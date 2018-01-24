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

  constructor(private http: HttpClient, private alertCtrl: AlertController) {
  }

  timeoutInit(observer: Observer<DataService>): void {
    // timeout thanks to https://stackoverflow.com/a/44334611/535203
    setTimeout(() => {
      if (!this.initialized) {
        this.timeoutInit(observer);
      } else {
        observer.next(this);
        observer.complete();
      }
    }, 200);
  }

  init(): Observable<DataService> {
    return Observable.create(observer => {
      if (!this.initialized && !this.initializing) {
        this.initializing = true;

        this.http.get('/assets/data.csv', {responseType: 'text'})
          .catch(error => {
            let errorMessage = "Erreur lors de l'obtention des données : "+error.message;
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
                let themeStr = line.Theme;
                let theme: Theme = this.themes.get(themeStr) || new Theme(themeStr);
                this.themes.set(themeStr, theme);

                let sousThemeStr = line.SousTheme;
                let sousTheme: SousTheme = this.sousThemes.get(sousThemeStr) || new SousTheme(sousThemeStr);
                this.sousThemes.set(sousThemeStr, sousTheme);

                if (!theme.sousThemes.includes(sousTheme)) {
                  theme.sousThemes.push(sousTheme);
                }

                let atelier: Atelier = {
                  sousTheme: sousTheme,
                  accueil: line.Accueil,
                  parole: {
                    titre: line['Parole.Titre'],
                    texte: line['Parole.Texte'],
                    reference: line['Parole.Reference']
                  },
                  geste: new Geste(
                    line['Geste.Titre'],
                    line['Geste.Texte'],
                  ),
                  envoi: line.Envoi,
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

            observer.next(this);
            observer.complete();
          });
      } else {
        this.timeoutInit(observer);
      }
    });
  }

  getThemes(): Observable<Theme[]> {
    return this.init().map(dataService => Array.from(dataService.themes.values()));
  }

}
