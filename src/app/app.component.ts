import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ThemeListPage } from '../pages/theme-list/theme-list';
import { AtelierListPage } from '../pages/atelier-list/atelier-list';
import { DataService } from './data.service';
import { DocumentListPage } from '../pages/document-list/document-list';
import { HomePage } from '../pages/home/home';
import { TYPES_DOCUMENTS_BY_FOLDER_NAME } from './typeDocument';
import { SimpleDocumentPage } from '../pages/simple-document/simple-document';
import { PreferencesPage } from '../pages/preferences/preferences';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DebugPage } from '../pages/debug/debug';

interface MenuPage {
  title?: string,
  iconName?: string,
  component?: any,
  params?: any
}

interface MenuPageGroup {
  title?: string,
  iconName?: string,
  pages: MenuPage[],
}

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  menus: Array<MenuPageGroup>;

  onlineData: boolean;

  displayDebug: BehaviorSubject<boolean>;


  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public dataService: DataService) {
    this.initializeApp();

    const outilsPages: MenuPage[] = [];

    for (let typeDocument of Array.from(TYPES_DOCUMENTS_BY_FOLDER_NAME.values())) {
      outilsPages.push({
        title: typeDocument.titrePluriel,
        iconName: typeDocument.iconName,
        component: DocumentListPage,
        params: {
          documentsType: typeDocument.titrePluriel,
          documentType: typeDocument.titreSingulier,
          folderName: typeDocument.nomDossier
        }
      });
    }
    outilsPages.push({title: 'Gestes', iconName: 'hand', component: SimpleDocumentPage, params: {simpleDocumentFileName: 'Gestes'}});

    this.menus = [
      {
        title: 'Temps spirituels', iconName: 'contract', pages: [
          {title: 'Méthode', iconName: 'bulb', component: SimpleDocumentPage, params: {simpleDocumentFileName: 'Méthode'}},
          {title: 'Par thèmes', iconName: 'albums', component: ThemeListPage},
          {title: 'Par ordre alphabétique', iconName: 'list', component: AtelierListPage},
        ]
      }, {
        title: 'Outils', iconName: 'build', pages: outilsPages
      }
    ];

    this.onlineData = this.dataService.getOnlineData();

    this.displayDebug = this.dataService.displayDebug;
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page: MenuPage) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.openHome();
    this.nav.push(page.component, page.params);
  }

  openHome() {
    this.nav.setRoot(HomePage);
  }

  openCleophasPage() {
    this.openPage({component: SimpleDocumentPage, params: {simpleDocumentFileName: 'Cléophas'}});
  }

  openPreferencesPage() {
    this.openPage({component: PreferencesPage});
  }

  openContactPage() {
    this.openPage({component: SimpleDocumentPage, params: {simpleDocumentFileName: 'Contact'}});
  }

  openDebugPage() {
    this.openPage({component: DebugPage});
  }

  updateOnlineData() {
    this.dataService.setOnlineData(this.onlineData);
  }
}
