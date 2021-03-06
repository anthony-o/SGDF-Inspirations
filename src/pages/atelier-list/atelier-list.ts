import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Atelier} from "../../app/atelier";
import {AtelierPage} from "../atelier/atelier";
import {Observable} from "rxjs/Observable";
import {DataService} from "../../app/data.service";
import "rxjs/add/observable/of";
import {OpenHomePage} from "../open-home";

@Component({
  selector: 'page-atelier-list',
  templateUrl: 'atelier-list.html',
})
export class AtelierListPage extends OpenHomePage {
  ateliers$: Observable<Atelier[]>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataService) {
    super(navCtrl);
    let ateliers$ = this.navParams.get("ateliers");
    if (ateliers$) {
      ateliers$ = Observable.of(ateliers$);
    }
    this.ateliers$ = ateliers$ || this.dataService.getAteliers();
  }

  atelierSelected(atelier: Atelier) {
    this.navCtrl.push(AtelierPage, {atelier: atelier});
  }
}
