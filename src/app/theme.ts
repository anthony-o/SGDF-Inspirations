import {Atelier} from "./atelier";

export class Theme {
  constructor(
    public label: string,
    public ateliers: Atelier[] = []
  ) {}
}
