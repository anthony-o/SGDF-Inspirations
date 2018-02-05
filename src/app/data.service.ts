import {Injectable} from "@angular/core";
import {Theme} from "./theme";
import {SousTheme} from "./sousTheme";
import {TrancheAge} from "./trancheAge";
import {Atelier} from "./atelier";
import {Geste} from "./geste";
import {AlertController} from "ionic-angular";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import marked from "marked";
import * as JSZip from "jszip";
import * as mammoth from "mammoth";

@Injectable()
export class DataService {
  themes: Map<string, Theme>;
  sousThemes: Map<string, SousTheme>;
  trancheAges: Map<string, TrancheAge>;
  ateliers: Atelier[];

  private onlineData: boolean = false;

  private themesObservable: Observable<Theme[]>;
  private themesObserver: Observer<Theme[]>;

  private ateliersObservable: Observable<Atelier[]>;
  private ateliersObserver: Observer<Atelier[]>;

  constructor(private http: HttpClient, private alertCtrl: AlertController) {

    this.themesObservable = Observable.create(observer => {
      this.themesObserver = observer;
    });
    this.themesObservable.subscribe(themes => {});

    this.ateliersObservable = Observable.create(observer => {
      this.ateliersObserver = observer;
    });
    this.ateliersObservable.subscribe(ateliers => {});

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
    this.sousThemes = new Map();
    this.trancheAges = new Map();
    this.ateliers = [];

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
    // let jsZip = new JSZip(dataZip, options);
    JSZip.loadAsync(dataZip, options).then(jsZip => {
      jsZip.folder("ateliers").forEach((relativePath, file) => {
        if (relativePath.endsWith(".docx")) {
          // Traitement des fichiers Word
          // let arrayBuffer = file.asBinary();
          file.async('arraybuffer').then(arrayBuffer => {
            if (relativePath.endsWith(".md.docx")) {
              // Un document Word dont le texte est formaté en Markdown
              mammoth.extractRawText({arrayBuffer: arrayBuffer}).then(result => {
                console.log(result.messages);
                this.parseAtelierMd(result.value);
              }, this.handleError);
            } else {
              // Un document Word dont il faut convertir le contenu en Markdown
              mammoth.convertToMarkdown({arrayBuffer: arrayBuffer}).then(result => {
                console.log(result.messages);
                this.parseAtelierMd(result.value);
              }, this.handleError);
            }
          }, this.handleError);
        } else {
          // Il s'agit d'un fichier que l'on va interpréter comme un contenu texte simple
          file.async('text').then(atelierMd => {
            this.parseAtelierMd(atelierMd);
          }, this.handleError);
        }
      });
    }, this.handleError);
  }

  private parseAtelierMd(atelierMd): void {
    // Découpage du fichier source d'atelier en parties
    let atelierParts: any = {};
    for (let part of atelierMd.split(/^# ?(?:<a .*?<\/a>)?\\?-\\?->/m)) { // mammoth quand il converti un fichier docx en markdown, garde les références en lien <a> pour chaque titre. Il faut donc les supprimer. Par ailleurs, il génère un \ devant les -.
      if (part) {
        let partElements = /^(.+)$\s+([\s\S]*)/m.exec(part); // Utilisation de [\s\S] au lieu de . pour matcher les retours chariots https://stackoverflow.com/a/16119722/535203
        atelierParts[partElements[1]
          .toLowerCase() // en minuscule
          .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // suppression des accents grâce à https://stackoverflow.com/a/37511463/535203
          .replace(/\W/g, '') // suppression des charactères autres qu'alphanumériques
          ] = partElements[2].trim();
      }
    }
    // Création de l'objet Atelier avec ces parties
    let themeStr = atelierParts.theme;
    let theme: Theme = this.themes.get(themeStr);
    if (!theme) {
      theme = new Theme(themeStr);
      this.themes.set(themeStr, theme);
      this.themesObserver.next(this.getThemesValues()); // Rafraîchissement des thèmes
    }

    let atelier: Atelier = {
      sousTheme: atelierParts.soustheme,
      accueil: marked(atelierParts.accueil),
      parole: {
        titre: atelierParts.paroletitre,
        texte: marked(atelierParts.paroletexte),
        reference: atelierParts.parolereference
      },
      geste: new Geste(
        atelierParts.gestetitre,
        marked(atelierParts.gestetexte),
      ),
      envoi: marked(atelierParts.envoi),
      trancheAges: atelierParts.tranchesdages.split(',')
        .map(label => {
          let trancheAge = this.trancheAges.get(label) || new TrancheAge(label);
          this.trancheAges.set(label, trancheAge);
          return trancheAge;
        })
    };

    this.ateliers.push(atelier);
    theme.ateliers.push(atelier);

    this.ateliersObserver.next(this.ateliers); // Rafraîchissement des ateliers
  }

  private getThemesValues(): Theme[] {
    return Array.from(this.themes.values())
  }

  getThemes(): Observable<Theme[]> {
    // On renvoit les données au cas où elles ont déjà été envoyées. Timeout grâce à https://stackoverflow.com/a/44334611/535203
    setTimeout(() => {
      this.themesObserver.next(this.getThemesValues());
    }, 20);

    return this.themesObservable;
  }

  getAteliers(): Observable<Atelier[]> {
    // On renvoit les données au cas où elles ont déjà été envoyées. Timeout grâce à https://stackoverflow.com/a/44334611/535203
    setTimeout(() => {
      this.ateliersObserver.next(this.ateliers);
    }, 20);

    return this.ateliersObservable;
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
