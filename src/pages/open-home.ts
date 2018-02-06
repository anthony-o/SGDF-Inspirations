import {NavController} from "ionic-angular";
import {HomePage} from "./home/home";

export class OpenHomePage {

  constructor(public navCtrl: NavController) {
  }

  public openHome() {
    this.navCtrl.setRoot(HomePage);
  }
}
