import { Component } from '@angular/core';
import { NavController, NavParams, Toggle } from 'ionic-angular';
import { OpenHomePage } from '../open-home';
import { DataService } from '../../app/data.service';
import { TrancheAge } from '../../app/trancheAge';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'page-preferences',
  templateUrl: 'preferences.html',
})
export class PreferencesPage extends OpenHomePage {
  private trancheAgeFilterValuesBehaviorSubjectByTrancheAge: Map<TrancheAge, BehaviorSubject<boolean>>;
  trancheAges: TrancheAge[];

  constructor(public navCtrl: NavController, public navParams: NavParams, dataService: DataService) {
    super(navCtrl);

    this.trancheAgeFilterValuesBehaviorSubjectByTrancheAge = dataService.trancheAgeFilterValuesBehaviorSubjectByTrancheAge;
    this.trancheAges = Array.from(dataService.trancheAgeFilterValuesBehaviorSubjectByTrancheAge.keys());
  }

  changeTrancheAgeFilterValue(trancheAge: TrancheAge, event: Toggle) {
    this.trancheAgeFilterValuesBehaviorSubjectByTrancheAge.get(trancheAge).next(event.checked);
  }

}
