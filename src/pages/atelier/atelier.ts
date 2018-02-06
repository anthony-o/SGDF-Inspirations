import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {Atelier} from "../../app/atelier";
import {OpenHomePage} from "../open-home";

/**
 * Generated class for the AtelierPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-atelier',
  templateUrl: 'atelier.html',
})
export class AtelierPage extends OpenHomePage {
  atelier: Atelier;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    super(navCtrl);
    this.atelier = this.navParams.get("atelier");
  }

}
