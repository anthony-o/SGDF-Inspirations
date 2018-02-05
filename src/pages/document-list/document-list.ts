import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Observable} from "rxjs/Observable";
import {DataService} from "../../app/data.service";
import {Document} from "../../app/document";
import {DocumentPage} from "../document/document";

/**
 * Generated class for the DocumentListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-document-list',
  templateUrl: 'document-list.html',
})
export class DocumentListPage {
  documentsType: string;
  documentType: string;
  documents$: Observable<Document[]>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataService) {
    this.documentType = this.navParams.get("documentType");
    this.documentsType = this.navParams.get("documentsType");
    this.documents$ = this.dataService[this.navParams.get("dataServiceGetterName")]();
  }

  documentSelected(document: Document) {
    this.navCtrl.push(DocumentPage, {document: document, documentType: this.documentType});
  }
}
