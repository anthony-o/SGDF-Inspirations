import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Atelier} from "../../app/atelier";
import {AtelierPage} from "../atelier/atelier";
import {Observable} from "rxjs/Observable";
import {DataService} from "../../app/data.service";
import "rxjs/add/observable/of";

@Component({
  selector: 'page-atelier-list',
  templateUrl: 'atelier-list.html',
})
export class AtelierListPage {
  ateliers$: Observable<Atelier[]>;
  labelFunction: (Atelier) => string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataService) {
    let ateliers$ = this.navParams.get("ateliers");
    if (ateliers$) {
      ateliers$ = Observable.of(ateliers$);
    }
    this.ateliers$ = ateliers$ || this.dataService.getAteliers();
    this.labelFunction = this.navParams.get("labelFunction")
      || function (atelier: Atelier) {
        return atelier.parole.titre
      };
  }

  atelierSelected(atelier: Atelier) {
    this.navCtrl.push(AtelierPage, {atelier: atelier});
  }
}
