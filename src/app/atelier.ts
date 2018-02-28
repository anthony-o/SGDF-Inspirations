import {Parole} from "./parole";
import {TrancheAge} from "./trancheAge";
import {Document} from "./document";
import {Theme} from "./theme";

export class Atelier {
  accueil: string;
  parole: Parole;
  geste: Document;
  envoi: string;
  tranchesAges: TrancheAge[];
  sousTheme: string;
  theme: Theme;
}
