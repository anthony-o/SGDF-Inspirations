import {ErrorHandler, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {MyApp} from './app.component';

import {AboutPage} from '../pages/about/about';
import {ContactPage} from '../pages/contact/contact';
import {HomePage} from '../pages/home/home';
import {TabsPage} from '../pages/tabs/tabs';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {DataService} from "./data.service";
import {ThemeListPage} from "../pages/theme-list/theme-list";
import {AtelierListPage} from "../pages/atelier-list/atelier-list";
import {AtelierPage} from "../pages/atelier/atelier";
import {HttpClientModule} from "@angular/common/http";
import {DocumentListPage} from "../pages/document-list/document-list";
import {DocumentPage} from "../pages/document/document";

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    ThemeListPage,
    AtelierListPage,
    AtelierPage,
    DocumentListPage,
    DocumentPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    ThemeListPage,
    AtelierListPage,
    AtelierPage,
    DocumentListPage,
    DocumentPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    DataService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
