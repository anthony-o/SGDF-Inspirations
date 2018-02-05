import {Parole} from "./parole";
import {TrancheAge} from "./trancheAge";
import {Document} from "./document";

export class Atelier {
  accueil: string;
  parole: Parole;
  geste: Document;
  envoi: string;
  trancheAges: TrancheAge[];
  sousTheme: string;
}
