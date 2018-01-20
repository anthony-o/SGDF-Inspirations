import {SousTheme} from "./sousTheme";

export class Theme {
  constructor(
    public label: string,
    public sousThemes: SousTheme[] = []
  ) {}
}
