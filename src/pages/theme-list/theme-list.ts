import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Theme} from "../../app/theme";
import {DataService} from "../../app/data.service";
import {Observable} from "rxjs/Observable";
import {AtelierListPage} from "../atelier-list/atelier-list";

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
  themes$: Observable<Theme[]>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private dataService: DataService) {
    // this.dataService.getThemes().subscribe(themes => {console.log('nouveaux themes');console.log(themes)});
    // this.themes$ = Observable.of([]);
    this.themes$ = this.dataService.getThemes();
  }

  themeSelected(theme: Theme) {
    this.navCtrl.push(AtelierListPage, {ateliers: theme.ateliers});
  }
}
