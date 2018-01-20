import {Component} from '@angular/core';

import {AboutPage} from '../about/about';
import {ThemeListPage} from "../theme-list/theme-list";
import {ContactPage} from "../contact/contact";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = ThemeListPage;
  tab2Root = AboutPage;
  tab3Root = ContactPage;

  constructor() {

  }
}
