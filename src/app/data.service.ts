import {Injectable} from "@angular/core";
import * as Papa from 'papaparse';
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

@Injectable()
export class DataService {
  data: string = '"Theme","SousTheme","Accueil","Parole.Titre","Parole.Texte","Parole.Reference","Geste.Titre","Geste.Texte","Envoi","TrancheAge[]"\n' +
    '"1er thème","1er sous-thème","Accueil 1","Parole 1","Parole 1 détails","Parole 1 référence","Geste 1","Geste 1 détails","Envoi 1","8-11,12-14"\n' +
    '"1er thème","1er sous-thème","Accueil 2","Parole 2","Parole 2 détails","Parole 2 référence","Geste 2","Geste 2 détails","Envoi 2","8-11,15-17"\n' +
    '"1er thème","2ème sous-thème","Accueil 3","Parole 3","Parole 3 détails","Parole 3 référence","Geste 3","Geste 3 détails","Envoi 3","15-17"';

  themes: Map<string, Theme> = new Map();
  sousThemes: Map<string, SousTheme> = new Map();
  trancheAges: Map<string, TrancheAge> = new Map();
  ateliers: Atelier[] = [];

  private initialized: boolean = false;
  private initializing: boolean = false;
  private onlineData: boolean = false;

  private observable: Observable<DataService>;
  private observer: Observer<DataService>;

  constructor(private http: HttpClient, private alertCtrl: AlertController) {
  }

  init() {
    this.themes = new Map();
    this.sousThemes = new Map();
    this.trancheAges = new Map();
    this.ateliers = [];

    this.initialized = false;
    this.initializing = false;
  }

  sendDataServiceToObserver(): any {
    if (!this.initializing) {
      if (this.initialized) {
        this.observer.next(this);
      } else {
        this.initializing = true;

        let url = this.onlineData ? 'https://docs.google.com/spreadsheets/d/1RDbRvIgSeY9R7Os9aaa6_-teDtIjXmaHsYE9w81RSnU/export?format=csv' : '/assets/data.csv';
        this.http.get(url, {responseType: 'text'})
          .catch(error => {
            let errorMessage = "Erreur lors de l'obtention des données : " + error.message;
            this.alertCtrl.create({
              title: "Erreur lors de l'obtention des données",
              subTitle: errorMessage,
              buttons: ['Ignorer']
            });
            console.error(errorMessage);
            return [];
          })
          .subscribe(dataCsv => {
            // inspiré par https://devdactic.com/csv-data-ionic/
            // Documentation pour Papa.parse : http://papaparse.com/docs#strings
            let data: { [key: string]: string }[] = Papa.parse(dataCsv, {header: true}).data;

            for (let line of data) {
              if (line && line.Theme) {
                let themeStr = marked(line.Theme);
                let theme: Theme = this.themes.get(themeStr) || new Theme(themeStr);
                this.themes.set(themeStr, theme);

                let sousThemeStr = marked(line.SousTheme);
                let sousTheme: SousTheme = this.sousThemes.get(sousThemeStr) || new SousTheme(sousThemeStr);
                this.sousThemes.set(sousThemeStr, sousTheme);

                if (!theme.sousThemes.includes(sousTheme)) {
                  theme.sousThemes.push(sousTheme);
                }

                let atelier: Atelier = {
                  sousTheme: sousTheme,
                  accueil: marked(line.Accueil),
                  parole: {
                    titre: line['Parole.Titre'],
                    texte: marked(line['Parole.Texte']),
                    reference: line['Parole.Reference']
                  },
                  geste: new Geste(
                    line['Geste.Titre'],
                    marked(line['Geste.Texte']),
                  ),
                  envoi: marked(line.Envoi),
                  trancheAges: line['TrancheAge[]'].split(',')
                    .map(label => {
                      let trancheAge = this.trancheAges.get(label) || new TrancheAge(label);
                      this.trancheAges.set(label, trancheAge);
                      return trancheAge;
                    })
                };
                sousTheme.ateliers.push(atelier);

                this.ateliers.push(atelier);
              }
            }

            this.initialized = true;
            this.initializing = false;

            this.observer.next(this);
            //observer.complete();
          });
      }
    }
  }

  getObservableInstance(): Observable<DataService> {
    if (!this.observable) {
      this.observable = Observable.create(observer => {
        this.observer = observer;

        this.sendDataServiceToObserver();
      });
      return this.observable;
    } else {
      return Observable.create(observer => {
        this.observable.subscribe(dataService => {
          observer.next(dataService);
        });
        this.sendDataServiceToObserver();
      });
    }
  }

  getThemes(): Observable<Theme[]> {
    return this.getObservableInstance().map(dataService => Array.from(dataService.themes.values()));
  }

  getAteliers(): Observable<Atelier[]> {
    return this.getObservableInstance().map(dataService => dataService.ateliers);
  }

  getOnlineData(): boolean {
    return this.onlineData;
  }

  setOnlineData(onlineData: boolean) {
    if (this.onlineData != onlineData) {
      this.init();
      this.onlineData = onlineData;
      this.sendDataServiceToObserver();
    }
  }
}
