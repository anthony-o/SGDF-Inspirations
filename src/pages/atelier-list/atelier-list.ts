import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Atelier} from "../../app/atelier";
import {AtelierPage} from "../atelier/atelier";

/**
 * Generated class for the AtelierListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-atelier-list',
  templateUrl: 'atelier-list.html',
})
export class AtelierListPage {
  ateliers: Atelier[];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.ateliers = this.navParams.get("ateliers");
  }

  atelierSelected(atelier: Atelier) {
    this.navCtrl.push(AtelierPage, {atelier: atelier});
  }
}
