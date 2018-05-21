import { Injectable } from '@angular/core';
import { Theme } from './theme';
import { TrancheAge, TRANCHES_AGES_BY_AGE, TRANCHES_AGES_BY_KEY } from './trancheAge';
import { Atelier } from './atelier';
import { AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import marked from 'marked';
import * as JSZip from 'jszip';
import { JSZipObject } from 'jszip';
import * as mammoth from 'mammoth';
import { Document } from './document';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { SIMPLE_DOCUMENT_FILE_NAMES, TYPES_DOCUMENTS_BY_FOLDER_NAME } from './typeDocument';

@Injectable()
export class DataService {
  themes: Map<string, Theme>;
  ateliers: Atelier[];

  ateliersBehaviorSubject: BehaviorSubject<Atelier[]>;
  themesBehaviorSubject: BehaviorSubject<Theme[]>;

  documentsByFolderName: Map<string, Document[]>;
  documentsBehaviorSubjectByFolderName: Map<string, BehaviorSubject<Document[]>>;

  simpleDocumentsBehaviorSubjectByFileName: Map<string, BehaviorSubject<string>>;

  private static FOLDER_NAMES_TO_HANDLE: string[] = ['ateliers', ...Array.from(TYPES_DOCUMENTS_BY_FOLDER_NAME.keys())];

  private onlineData: boolean = false;

  private static DEFAULT_SIMPLE_DOCUMENT_CONTENT = '<h1>Chargement...</h1>';

  constructor(private http: HttpClient, private alertCtrl: AlertController) {
    this.ateliersBehaviorSubject = new BehaviorSubject<Atelier[]>([]);
    this.themesBehaviorSubject = new BehaviorSubject<Theme[]>([]);

    this.documentsBehaviorSubjectByFolderName = new Map<string, BehaviorSubject<Document[]>>();

    for (let typeDocumentFolderName of Array.from(TYPES_DOCUMENTS_BY_FOLDER_NAME.keys())) {
      this.documentsBehaviorSubjectByFolderName.set(typeDocumentFolderName, new BehaviorSubject<Document[]>([]));
    }

    this.simpleDocumentsBehaviorSubjectByFileName = new Map<string, BehaviorSubject<string>>();

    for (let simpleDocumentFileName of SIMPLE_DOCUMENT_FILE_NAMES) {
      this.simpleDocumentsBehaviorSubjectByFileName.set(simpleDocumentFileName, new BehaviorSubject<string>(DataService.DEFAULT_SIMPLE_DOCUMENT_CONTENT));
    }

    this.init();
  }

  private handleError(error) {
    const errorMessage = `Erreur lors de l'obtention des données : ${error.message}`;
    this.alertCtrl.create({
      title: `Erreur lors de l'obtention des données`,
      subTitle: errorMessage,
      buttons: ['Ignorer']
    });
    console.error(errorMessage);
  }

  init() {
    this.themes = new Map();
    this.ateliers = [];

    this.ateliersBehaviorSubject.next(this.ateliers);

    this.themesBehaviorSubject.next([]);

    this.documentsByFolderName = new Map<string, Document[]>();

    for (let typeDocumentFolderName of Array.from(TYPES_DOCUMENTS_BY_FOLDER_NAME.keys())) {
      const documents = [];
      this.documentsBehaviorSubjectByFolderName.get(typeDocumentFolderName).next(documents);
      this.documentsByFolderName.set(typeDocumentFolderName, documents);
    }

    for (let simpleDocumentFileName of SIMPLE_DOCUMENT_FILE_NAMES) {
      const content = DataService.DEFAULT_SIMPLE_DOCUMENT_CONTENT;
      this.simpleDocumentsBehaviorSubjectByFileName.get(simpleDocumentFileName).next(content);
    }

    if (this.onlineData) {
      // C'est en ligne, on va récupérer le contenu du Goole Doc suivant dont le contenu est le fichier zip encodé en base64
      this.http.get('https://docs.google.com/document/d/1rtncxTc2mvGYXI6H9kGmQsJwW7IaTuFcqcvL9tM2e-4/export?format=txt', {responseType: 'text'}).subscribe(base64EncodedDataZip => {
        // Puis on traite le fichier normalement
        this.handleDataZip(base64EncodedDataZip, {base64: true});
      });
    } else {
      this.http.get('assets/data.zip', {responseType: 'arraybuffer'}).subscribe(dataZip => {
        this.handleDataZip(dataZip, {});
      });
    }
  }

  private handleDataZip(dataZip: any, options: any) {
    JSZip.loadAsync(dataZip, options).then(jsZip => {
      // D'abord on traîte les dossiers de la racine
      for (let folderName of DataService.FOLDER_NAMES_TO_HANDLE) {
        if (folderName == 'ateliers') {
          this.handleFolder(this.parseAtelierMd, folderName, jsZip);
        } else {
          this.handleFolder(this.parseDocumentHandler(folderName), folderName, jsZip);
        }
      }
      // Puis les fichier simples
      for (let simpleDocumentFileName of SIMPLE_DOCUMENT_FILE_NAMES) {
        jsZip.file(new RegExp(`${simpleDocumentFileName}`)).forEach((zipObject) => {
          this.handleZipObject(zipObject.name, zipObject, (fileContent) => this.parseSimpleFile(fileContent, zipObject));
        });
      }
    });
  }

  private handleFolder(fileHandler: (fileParts: { [key: string]: string }) => void, folderPathFromRoot: string, jsZip: JSZip) {
    // Cette fonction va gérer
    jsZip.folder(folderPathFromRoot).forEach((relativePath, file) => {
      this.handleZipObject(relativePath, file, (fileContent: string) => {
        this.handleFile(fileContent, fileHandler);
      });
    });
  }

  private handleZipObject(relativePath, zipObject: JSZipObject, fileContentHandler: (fileContent: string) => void) {
    if (relativePath.endsWith('.docx')) {
      // Traitement des fichiers Word
      zipObject.async('arraybuffer').then(arrayBuffer => {
        if (relativePath.endsWith('.md.docx')) {
          // Un document Word dont le texte est formaté en Markdown
          mammoth.extractRawText({arrayBuffer: arrayBuffer}).then(result => {
            if (result.messages && result.messages.length > 0) {
              console.log(result.messages);
            }
            fileContentHandler(result.value);
          }, this.handleError);
        } else {
          // Un document Word dont il faut convertir le contenu en Markdown
          mammoth.convertToMarkdown({arrayBuffer: arrayBuffer}).then(result => {
            if (result.messages && result.messages.length > 0) {
              console.log(result.messages);
            }
            fileContentHandler(result.value);
          }, this.handleError);
        }
      }, this.handleError);
    } else {
      // Il s'agit d'un fichier que l'on va interpréter comme un contenu texte simple
      zipObject.async('text').then(textContent => {
        fileContentHandler(textContent);
      }, this.handleError);
    }
  }

  private handleFile(fileContent: string, fileHandler: (fileParts: { [key: string]: string }) => void) {
    const parts = this.parseFileToParts(fileContent);
    if (parts) {
      fileHandler.bind(this)(parts);
    }
  }

  private parseFileToParts(fileString: string): { [key: string]: string } {
    try {
      const fileParts: { [key: string]: string } = {};
      for (let part of fileString.split(/^# ?(?:<a .*?<\/a>)?\\?-\\?->/m)) { // quand mammoth converti un fichier docx en markdown, garde les références en lien <a> pour chaque titre. Il faut donc les supprimer. Par ailleurs, il génère un \ devant les -.
        part = part.trim();
        if (part) {
          const partElements = /^(.+)$\s+([\s\S]*)/m.exec(part); // Utilisation de [\s\S] au lieu de . pour matcher les retours chariots https://stackoverflow.com/a/16119722/535203
          fileParts[partElements[1]
            .toLowerCase() // en minuscule
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // suppression des accents grâce à https://stackoverflow.com/a/37511463/535203
            .replace(/\W/g, '') // suppression des charactères autres qu'alphanumériques
            ] = partElements[2].trim();
        }
      }
      return fileParts;
    } catch (error) {
      console.error(`Problème lors du parsing du fichier '${fileString}' : ${error.message}`);
      return null;
    }
  }

  private notMarked(contentToUnEscape: string) {
    return contentToUnEscape && contentToUnEscape.replace(/\\/g, '');
  }

  private parseAtelierMd(fileParts: { [key: string]: string }): void {
    // Création de l'objet Atelier avec ces parties
    const themeStr = fileParts.theme;
    let theme: Theme = this.themes.get(themeStr);
    if (!theme) {
      theme = new Theme(themeStr);
      this.themes.set(themeStr, theme);
      this.themesBehaviorSubject.next(this.getThemesValues()); // Rafraîchissement des thèmes
    }

    let atelier: Atelier;
    try {
      const tranchesDAgesStr = this.notMarked(fileParts.tranchesdages),
        tranchesDAges: Set<TrancheAge> = new Set<TrancheAge>();
      if (tranchesDAgesStr) {
        for (let trancheDAgeStr of tranchesDAgesStr.split(',')) {
          let match;
          if (match = /(\d+).*?(\d+)?/.exec(trancheDAgeStr)) {
            let start = parseInt(match[1]),
              end = parseInt(match[2]) || (start + 1);
            for (let i = start; i < end; i++) {
              tranchesDAges.add(TRANCHES_AGES_BY_AGE.get(i.toString()));
            }
          } else if (match = /([a-zA-Z])([a-zA-Z])?/.exec(trancheDAgeStr)) {
            let key = match[1].toLowerCase(),
              second = (match[2] || '').toLowerCase();
            if (key == 'c') {
              key += second;
            }
            tranchesDAges.add(TRANCHES_AGES_BY_KEY.get(key));
          }
        }
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
        tranchesAges: Array.from(tranchesDAges),
        theme: theme
      };
    } catch (error) {
      console.error(`Problème lors de la création d'un atelier : ${error.message}`);
      console.log(fileParts);
      atelier = null;
    }

    if (atelier) {
      this.ateliers.push(atelier);
      theme.ateliers.push(atelier);

      // this.ateliersBehaviorSubject.next(this.ateliers); // Rafraîchissement des ateliers
    }
  }

  private parseDocumentHandler(folderName: string): (fileParts: { [key: string]: string }) => void {
    const documents: Document[] = this.documentsByFolderName.get(folderName);

    return function (fileParts: { [key: string]: string }): void {
      let document: Document;
      try {
        document = {
          titre: this.notMarked(fileParts.titre),
          texte: marked(fileParts.texte)
        };
      } catch (error) {
        console.error(`Problème lors de la création d'un document : ${error.message}`);
        console.log(fileParts);
        document = null;
      }

      if (document) {
        documents.push(document);

        // this.documentsBehaviorSubjectByFolderName.get(folderName).next(documents); // Rafraîchissement de la liste de ce type de document
      }
    };
  }

  private parseSimpleFile(fileContent: string, zipObject: JSZipObject): void {
    const fileName = /([^\/]*?)\.md(\.docx)?$/.exec(zipObject.name);
    if (fileName && fileName[1]) {
      const simpleDocumentBehaviorSubject = this.simpleDocumentsBehaviorSubjectByFileName.get(fileName[1]);
      if (simpleDocumentBehaviorSubject) {
        simpleDocumentBehaviorSubject.next(marked(fileContent));
      }
    }
  }

  private getThemesValues(): Theme[] {
    return Array.from(this.themes.values());
  }

  getThemes(): Observable<Theme[]> {
    return this.themesBehaviorSubject;
  }

  getAteliers(): Observable<Atelier[]> {
    return this.ateliersBehaviorSubject;
  }

  getDocumentsByFolderName(folderName: string): Observable<Document[]> {
    return this.documentsBehaviorSubjectByFolderName.get(folderName);
  }

  getOnlineData(): boolean {
    return this.onlineData;
  }

  getSimpleDocumentByFileName(fileName: string): Observable<string> {
    return this.simpleDocumentsBehaviorSubjectByFileName.get(fileName);
  }

  setOnlineData(onlineData: boolean) {
    if (this.onlineData != onlineData) {
      this.onlineData = onlineData;
      setTimeout(() => {
        this.init(); // initialisation dans un timeout pour ne pas figer la vue
      }, 20);
    }
  }
}
