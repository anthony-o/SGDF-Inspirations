import {Atelier} from "./atelier";

export class SousTheme {
  constructor(
    public label: string,
    public ateliers: Atelier[] = []
  ) {};
}
