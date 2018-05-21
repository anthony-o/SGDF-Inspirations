import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { OpenHomePage } from '../open-home';
import { DataService } from '../../app/data.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'page-simple-document',
  templateUrl: 'simple-document.html',
})
export class SimpleDocumentPage extends OpenHomePage {
  content$: Observable<string>;
  navBarTitle: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public dataService: DataService) {
    super(navCtrl);
    const simpleDocumentFileName = this.navParams.get('simpleDocumentFileName');
    this.content$ = dataService.getSimpleDocumentByFileName(simpleDocumentFileName);
    this.navBarTitle = simpleDocumentFileName;
  }

}
