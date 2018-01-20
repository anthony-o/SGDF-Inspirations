import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {SousTheme} from "../../app/sousTheme";
import {AtelierListPage} from "../atelier-list/atelier-list";

/**
 * Generated class for the SousThemeListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-sous-theme-list',
  templateUrl: 'sous-theme-list.html',
})
export class SousThemeListPage {
  sousThemes: SousTheme[];

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.sousThemes = this.navParams.get("sousThemes")
  }

  sousThemeSelected(sousTheme) {
    this.navCtrl.push(AtelierListPage, {ateliers: sousTheme.ateliers});
  }
}
