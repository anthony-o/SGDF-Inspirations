import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';

import { HomePage } from '../pages/home/home';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { DataService } from './data.service';
import { ThemeListPage } from '../pages/theme-list/theme-list';
import { AtelierListPage } from '../pages/atelier-list/atelier-list';
import { AtelierPage } from '../pages/atelier/atelier';
import { HttpClientModule } from '@angular/common/http';
import { DocumentListPage } from '../pages/document-list/document-list';
import { DocumentPage } from '../pages/document/document';
import { SimpleDocumentPage } from '../pages/simple-document/simple-document';
import { IonicStorageModule } from '@ionic/storage';
import { PreferencesPage } from '../pages/preferences/preferences';
import { File } from '@ionic-native/file';
import { DebugPage } from '../pages/debug/debug';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ThemeListPage,
    AtelierListPage,
    AtelierPage,
    DocumentListPage,
    DocumentPage,
    SimpleDocumentPage,
    PreferencesPage,
    DebugPage,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ThemeListPage,
    AtelierListPage,
    AtelierPage,
    DocumentListPage,
    DocumentPage,
    SimpleDocumentPage,
    PreferencesPage,
    DebugPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    DataService,
    File,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
  ]
})
export class AppModule {
}
