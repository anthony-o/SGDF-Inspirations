export class TrancheAge {
  constructor(
    public label: string,
    public cle: string,
    public ages: string
  ) {
  };
}

let farfadets = new TrancheAge('Farfadets', 'F', '6-8'),
  louveteauxJeannettes = new TrancheAge('Louveteaux-Jeannettes', 'LJ', '8-11'),
  scoutsGuides = new TrancheAge('Scouts-Guides', 'SG', '11-14'),
  pionniersCaravelles = new TrancheAge('Pionniers-Caravelles', 'PC', '14-17'),
  compagnons = new TrancheAge('Compagnons', 'C', '17-21'),
  responsables = new TrancheAge('Responsables', 'R', '18+'),
  marins = new TrancheAge('Marins', 'M', '14-17'),
  ventDuLarge = new TrancheAge('Vent du large', 'VDL', '17+');

export const TRANCHES_AGES_LIST: TrancheAge[] = [
  farfadets,
  louveteauxJeannettes,
  scoutsGuides,
  pionniersCaravelles,
  compagnons,
  responsables,
  marins,
  ventDuLarge,
];

export const TRANCHES_AGES_BY_KEY: Map<string, TrancheAge> = new Map<string, TrancheAge>(Object.entries({  // Object => Map grâce à https://stackoverflow.com/a/36644558/535203
  f: farfadets,
  l: louveteauxJeannettes,
  j: louveteauxJeannettes,
  s: scoutsGuides,
  g: scoutsGuides,
  p: pionniersCaravelles,
  ca: pionniersCaravelles,
  co: compagnons,
  c: compagnons,
  r: responsables,
  m: marins,
  v: ventDuLarge
}));

export const TRANCHES_AGES_BY_AGE: Map<string, TrancheAge> = new Map<string, TrancheAge>(Object.entries({  // Object => Map grâce à https://stackoverflow.com/a/36644558/535203
  '6': farfadets,
  '7': farfadets,
  '8': louveteauxJeannettes,
  '9': louveteauxJeannettes,
  '10': louveteauxJeannettes,
  '11': scoutsGuides,
  '12': scoutsGuides,
  '13': scoutsGuides,
  '14': pionniersCaravelles,
  '15': pionniersCaravelles,
  '16': pionniersCaravelles,
  '17': compagnons,
  '18': compagnons,
  '19': compagnons,
  '20': compagnons,
}));
