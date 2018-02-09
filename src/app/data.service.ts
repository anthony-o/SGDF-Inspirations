import {Injectable} from "@angular/core";
import {Theme} from "./theme";
import {TrancheAge} from "./trancheAge";
import {Atelier} from "./atelier";
import {AlertController} from "ionic-angular";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import marked from "marked";
import * as JSZip from "jszip";
import * as mammoth from "mammoth";
import {Document} from "./document";

@Injectable()
export class DataService {
  themes: Map<string, Theme>;
  trancheAges: Map<string, TrancheAge>;
  ateliers: Atelier[];
  tempsSpis: Document[];
  chants: Document[];
  gestes: Document[];
  textes: Document[];
  typesTempsSpis: Document[];

  private static FOLDER_NAME_TO_FIELD_MAPPING: Map<string, string> = new Map<string, string>(Object.entries({  // Object => Map grâce à https://stackoverflow.com/a/36644558/535203
    tempsSpis: "tempsSpis",
    chants: "chants",
    gestes: "gestes",
    textes: "textes",
    typesTempsSpis: "typesTempsSpis",
  }));

  private static FIELD_NAMES_TO_HANDLE: string[] = ['ateliers', 'themes', ...Array.from(DataService.FOLDER_NAME_TO_FIELD_MAPPING.values())];

  private static FOLDER_NAMES_TO_HANDLE: string[] = ['ateliers', 'themes', ...Array.from(DataService.FOLDER_NAME_TO_FIELD_MAPPING.keys())];


  private onlineData: boolean = false;

  private observables: Map<string, Observable<any[]>> = new Map<string, Observable<any[]>>();
  private observers: Map<string, Observer<any[]>> = new Map<string, Observer<any[]>>();

  constructor(private http: HttpClient, private alertCtrl: AlertController) {

    for (let fieldName of DataService.FIELD_NAMES_TO_HANDLE) {
      let observable = Observable.create(observer => {
        this.observers.set(fieldName, observer);
      });
      this.observables.set(fieldName, observable);
      observable.subscribe(() => {}); // on souscrit à l'observable pour l'initialiser
    }

    setTimeout(() => {
      this.init(); // initialisation dans un timeout sinon les variables observer n'ont pas encore été initialisées
    }, 20);
  }

  private handleError(error) {
    let errorMessage = "Erreur lors de l'obtention des données : " + error.message;
    this.alertCtrl.create({
      title: "Erreur lors de l'obtention des données",
      subTitle: errorMessage,
      buttons: ['Ignorer']
    });
    console.error(errorMessage);
  }

  init() {
    this.themes = new Map();
    this.trancheAges = new Map();
    this.ateliers = [];
    this.tempsSpis = [];
    this.chants = [];
    this.gestes = [];
    this.textes = [];
    this.typesTempsSpis = [];

    if (this.onlineData) {
      // C'est en ligne, on va récupérer le contenu du Goole Doc suivant dont le contenu est le fichier zip encodé en base64
      this.http.get('https://docs.google.com/document/d/1rtncxTc2mvGYXI6H9kGmQsJwW7IaTuFcqcvL9tM2e-4/export?format=txt', {responseType: 'text'}).subscribe(base64EncodedDataZip => {
        // Puis on traite le fichier normalement
        this.handleDataZip(base64EncodedDataZip, {base64: true});
      });
    } else {
      this.http.get('/assets/data.zip', {responseType: 'arraybuffer'}).subscribe(dataZip => {
        this.handleDataZip(dataZip, {});
      });
    }
  }

  private handleDataZip(dataZip: any, options: any) {
    JSZip.loadAsync(dataZip, options).then(jsZip => {
      // D'abord on traîte les dossiers de la racine
      for (let folderName of DataService.FOLDER_NAMES_TO_HANDLE) {
        if (folderName == "ateliers") {
          this.handleFolder(this.parseAtelierMd, folderName, jsZip);
        } else {
          this.handleFolder(this.parseDocumentHandler(folderName), folderName, jsZip);
        }
      }
    });
  }

  private handleFolder(fileHandler: (fileParts: { [key: string]: string }) => void, folderPathFromRoot: string, jsZip: JSZip) {
    // Cette fonction va gérer
    jsZip.folder(folderPathFromRoot).forEach((relativePath, file) => {
      if (relativePath.endsWith(".docx")) {
        // Traitement des fichiers Word
        file.async('arraybuffer').then(arrayBuffer => {
          if (relativePath.endsWith(".md.docx")) {
            // Un document Word dont le texte est formaté en Markdown
            mammoth.extractRawText({arrayBuffer: arrayBuffer}).then(result => {
              console.log(result.messages);
              this.handleFile(result.value, fileHandler);
            }, this.handleError);
          } else {
            // Un document Word dont il faut convertir le contenu en Markdown
            mammoth.convertToMarkdown({arrayBuffer: arrayBuffer}).then(result => {
              console.log(result.messages);
              this.handleFile(result.value, fileHandler);
            }, this.handleError);
          }
        }, this.handleError);
      } else {
        // Il s'agit d'un fichier que l'on va interpréter comme un contenu texte simple
        file.async('text').then(textContent => {
          this.handleFile(textContent, fileHandler);
        }, this.handleError);
      }
    });
  }

  private handleFile(fileContent: string, fileHandler: (fileParts: { [key: string]: string }) => void) {
    let parts = this.parseFileToParts(fileContent);
    if (parts) {
      fileHandler.bind(this)(parts);
    }
  }

  private parseFileToParts(fileString: string): { [key: string]: string } {
    try {
      let fileParts: { [key: string]: string } = {};
      for (let part of fileString.split(/^# ?(?:<a .*?<\/a>)?\\?-\\?->/m)) { // mammoth quand il converti un fichier docx en markdown, garde les références en lien <a> pour chaque titre. Il faut donc les supprimer. Par ailleurs, il génère un \ devant les -.
        part = part.trim();
        if (part) {
          let partElements = /^(.+)$\s+([\s\S]*)/m.exec(part); // Utilisation de [\s\S] au lieu de . pour matcher les retours chariots https://stackoverflow.com/a/16119722/535203
          fileParts[partElements[1]
            .toLowerCase() // en minuscule
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // suppression des accents grâce à https://stackoverflow.com/a/37511463/535203
            .replace(/\W/g, '') // suppression des charactères autres qu'alphanumériques
            ] = partElements[2].trim();
        }
      }
      return fileParts;
    } catch (error) {
      console.error("Problème lors du parsing du fichier '"+fileString+"' : "+error.message);
      return null;
    }
  }

  private notMarked(contentToUnEscape: string) {
    return contentToUnEscape && contentToUnEscape.replace(/\\/g, '');
  }

  private parseAtelierMd(fileParts: { [key: string]: string }): void {
    // Création de l'objet Atelier avec ces parties
    let themeStr = fileParts.theme;
    let theme: Theme = this.themes.get(themeStr);
    if (!theme) {
      theme = new Theme(themeStr);
      this.themes.set(themeStr, theme);
      this.observers.get("themes").next(this.getThemesValues()); // Rafraîchissement des thèmes
    }

    let atelier: Atelier;
    try {
      let tranchesDAagesStr = this.notMarked(fileParts.tranchesdages),
          tranchesDAages: TrancheAge[];
      if (tranchesDAagesStr) {
        tranchesDAages = tranchesDAagesStr.split(',')
          .map(label => {
            let trancheAge = this.trancheAges.get(label) || new TrancheAge(label);
            this.trancheAges.set(label, trancheAge);
            return trancheAge;
          })
      }
      atelier = {
        sousTheme: this.notMarked(fileParts.soustheme),
        accueil: marked(fileParts.accueil),
        parole: {
          titre: this.notMarked(fileParts.paroletitre),
          texte: marked(fileParts.paroletexte),
          reference: this.notMarked(fileParts.parolereference)
        },
        geste: new Document(
          this.notMarked(fileParts.gestetitre),
          marked(fileParts.gestetexte),
        ),
        envoi: marked(fileParts.envoi),
        trancheAges: tranchesDAages
      };
    } catch (error) {
      console.error("Problème lors de la création d'un atelier : "+error.message);
      console.log(fileParts);
      atelier = null;
    }

    if (atelier) {
      this.ateliers.push(atelier);
      theme.ateliers.push(atelier);

      this.observers.get("ateliers").next(this.ateliers); // Rafraîchissement des ateliers
    }
  }

  private parseDocumentHandler(folderName: string): (fileParts: { [key: string]: string }) => void {
    let fieldName = DataService.FOLDER_NAME_TO_FIELD_MAPPING.get(folderName);
    let documents: Document[] = this[fieldName];

    return function (fileParts: { [key: string]: string }): void {
      let document: Document;
      try {
        document = {
          titre: this.notMarked(fileParts.titre),
          texte: marked(fileParts.texte)
        };
      } catch (error) {
        console.error("Problème lors de la création d'un document : "+error.message);
        console.log(fileParts);
        document = null;
      }

      if (document) {
        documents.push(document);

        this.observers.get(fieldName).next(documents); // Rafraîchissement de la liste de ce type de document
      }
    };
  }

  private getThemesValues(): Theme[] {
    return Array.from(this.themes.values())
  }

  private getFieldObservable<T>(fieldName: string, getter?: () => T[]): Observable<T[]> {
    // On renvoit les données au cas où elles ont déjà été envoyées. Timeout grâce à https://stackoverflow.com/a/44334611/535203
    setTimeout(() => {
      this.observers.get(fieldName).next(getter ? getter.bind(this)() : this[fieldName]);
    }, 20);

    return this.observables.get(fieldName);
  }

  getThemes(): Observable<Theme[]> {
    return this.getFieldObservable("themes", this.getThemesValues);
  }

  getAteliers(): Observable<Atelier[]> {
    return this.getFieldObservable("ateliers");
  }

  getTempsSpis(): Observable<Document[]> {
    return this.getFieldObservable("tempsSpis");
  }

  getChants(): Observable<Document[]> {
    return this.getFieldObservable("chants");
  }

  getGestes(): Observable<Document[]> {
    return this.getFieldObservable("gestes");
  }

  getTextes(): Observable<Document[]> {
    return this.getFieldObservable("textes");
  }

  getTypesTempsSpis(): Observable<Document[]> {
    return this.getFieldObservable("typesTempsSpis");
  }

  getOnlineData(): boolean {
    return this.onlineData;
  }

  setOnlineData(onlineData: boolean) {
    if (this.onlineData != onlineData) {
      this.onlineData = onlineData;
      this.init();
    }
  }
}
