export class TypeDocument {
  constructor(
    public titrePluriel: string,
    public titreSingulier: string,
    public nomDossier: string,
  ) {}
}

export const TYPES_DOCUMENTS_BY_FOLDER_NAME: Map<string, TypeDocument> = new Map<string, TypeDocument>(Object.entries({  // Object => Map grâce à https://stackoverflow.com/a/36644558/535203
  typesTempsSpis: new TypeDocument("Types de temps spis", "Type de temps spis", "typesTempsSpis"),
  textes: new TypeDocument("Textes", "Texte", "textes"),
  chants: new TypeDocument("Chants", "Chant", "chants"),
  gestes: new TypeDocument("Gestes", "Geste", "gestes"),
  benedicites: new TypeDocument("Bénédicités", "Bénédicité", "benedicites"),
}));

export const SIMPLE_DOCUMENT_FILE_NAMES: string[] = [
  'Méthode',
  'Contact',
];
