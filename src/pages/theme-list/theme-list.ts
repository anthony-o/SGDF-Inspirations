import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Theme} from "../../app/theme";
import {DataService} from "../../app/data.service";
import {SousThemeListPage} from "../sous-theme-list/sous-theme-list";

/**
 * Generated class for the ThemeListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-theme-list',
  templateUrl: 'theme-list.html',
})
export class ThemeListPage {
  themes: Theme[];

  constructor(public navCtrl: NavController, public navParams: NavParams, private dataService: DataService) {
    this.themes = Array.from(dataService.themes.values());
  }

  themeSelected(theme: Theme) {
    this.navCtrl.push(SousThemeListPage, {sousThemes: theme.sousThemes});
  }
}
