import {Component, ViewChild} from '@angular/core';
import {Nav, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {ThemeListPage} from "../pages/theme-list/theme-list";
import {AtelierListPage} from "../pages/atelier-list/atelier-list";
import {DataService} from "./data.service";
import {DocumentListPage} from "../pages/document-list/document-list";
import {HomePage} from "../pages/home/home";
import {TYPES_DOCUMENTS_BY_FOLDER_NAME} from "./typeDocument";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  menus: Array<{ title: string, pages: { title: string, component?: any, params?: any }[] }>;

  onlineData: boolean;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public dataService: DataService) {
    this.initializeApp();

    let outilsPages: { title: string, component?: any, params?: any }[] = [];

    for (let typeDocument of Array.from(TYPES_DOCUMENTS_BY_FOLDER_NAME.values())) {
      outilsPages.push({
        title: typeDocument.titrePluriel,
        component: DocumentListPage,
        params: {
          documentsType: typeDocument.titrePluriel,
          documentType: typeDocument.titreSingulier,
          folderName: typeDocument.nomDossier
        }
      });
    }

    // used for an example of ngFor and navigation
    this.menus = [
      {
        title: 'Préparer un temps spirituel', pages: [
          {title: 'Méthode'},
          {title: 'Temps spirituels en kit par thèmes', component: ThemeListPage},
          {title: 'Temps spirituels en kit', component: AtelierListPage},
        ]
      },
      {
        title: 'Outils', pages: outilsPages
      },
      {
        title: 'Autres', pages: [
          {title: 'Contact'}
        ]
      }
    ];

    this.onlineData = this.dataService.getOnlineData();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component, page.params);
  }

  openHome() {
    this.nav.setRoot(HomePage);
  }

  updateOnlineData() {
    this.dataService.setOnlineData(this.onlineData);
  }
}
