import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Document} from "../../app/document";
import {OpenHomePage} from "../open-home";

/**
 * Generated class for the DocumentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-document',
  templateUrl: 'document.html',
})
export class DocumentPage extends OpenHomePage {
  documentType: string;
  document: Document;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    super(navCtrl);
    this.documentType = this.navParams.get("documentType");
    this.document = this.navParams.get("document");
  }

}
