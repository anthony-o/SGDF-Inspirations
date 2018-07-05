import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { OpenHomePage } from '../open-home';
import { DataService, ErrorMessage } from '../../app/data.service';

/**
 * Generated class for the DebugPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-debug',
  templateUrl: 'debug.html',
})
export class DebugPage extends OpenHomePage {
  errorMessages: ErrorMessage[];

  constructor(public navCtrl: NavController, public navParams: NavParams, private dataService: DataService) {
    super(navCtrl);

    this.errorMessages = this.dataService.errorMessages;
  }

  stringifyError(error: Error): string {
    // Transformation d'une erreur JS en JSON grâce à https://stackoverflow.com/a/26199752/535203
    // Remplacement de toutes les occurrence d'une chaîne grâce à https://stackoverflow.com/a/1144788/535203
    // Affichage d'un JSON en HTML grâce à https://stackoverflow.com/a/8294549/535203
    return JSON.stringify(error, Object.getOwnPropertyNames(error), 2).replace(/\\n/g, '\n');
  }

}
