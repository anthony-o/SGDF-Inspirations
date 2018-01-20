import {Parole} from "./parole";
import {Geste} from "./geste";
import {TrancheAge} from "./trancheAge";
import {SousTheme} from "./sousTheme";

export class Atelier {
  accueil: string;
  parole: Parole;
  geste: Geste;
  envoi: string;
  trancheAges: TrancheAge[];
  sousTheme: SousTheme;
}
