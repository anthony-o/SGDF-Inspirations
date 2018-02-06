import {Component, ViewChild} from '@angular/core';
import {Nav, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {ThemeListPage} from "../pages/theme-list/theme-list";
import {AtelierListPage} from "../pages/atelier-list/atelier-list";
import {DataService} from "./data.service";
import {DocumentListPage} from "../pages/document-list/document-list";
import {HomePage} from "../pages/home/home";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{ title: string, component: any, params?: any }>;

  onlineData: boolean;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public dataService: DataService) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      {title: 'Ateliers', component: AtelierListPage},
      {title: 'Ateliers par thèmes', component: ThemeListPage},
      {
        title: 'Temps spis', component: DocumentListPage, params: {
          documentsType: 'Temps spis',
          documentType: 'Temps spi',
          dataServiceGetterName: 'getTempsSpis'
        }
      },
      {
        title: 'Chants',
        component: DocumentListPage,
        params: {documentsType: 'Chants', documentType: 'Chant', dataServiceGetterName: 'getChants'}
      },
      {
        title: 'Gestes',
        component: DocumentListPage,
        params: {documentsType: 'Gestes', documentType: 'Geste', dataServiceGetterName: 'getGestes'}
      },
      {
        title: 'Textes',
        component: DocumentListPage,
        params: {documentsType: 'Textes', documentType: 'Texte', dataServiceGetterName: 'getTextes'}
      },
      {
        title: 'Types de temps spis',
        component: DocumentListPage,
        params: {
          documentsType: 'Types de temps spis',
          documentType: 'Type de temps spi',
          dataServiceGetterName: 'getTypesTempsSpis'
        }
      },
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
