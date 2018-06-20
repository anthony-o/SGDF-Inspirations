export class TypeDocument {
  constructor(
    public titrePluriel: string,
    public titreSingulier: string,
    public nomDossier: string,
    public iconName?: string,
  ) {}
}

export const TYPES_DOCUMENTS_BY_FOLDER_NAME: Map<string, TypeDocument> = new Map<string, TypeDocument>(Object.entries({  // Object => Map grâce à https://stackoverflow.com/a/36644558/535203
  typesTempsSpis: new TypeDocument("Types de temps spis", "Type de temps spis", "typesTempsSpis", "apps"),
  textes: new TypeDocument("Textes", "Texte", "textes", "book"),
  chants: new TypeDocument("Chants", "Chant", "chants", "musical-notes"),
  benedicites: new TypeDocument("Bénédicités", "Bénédicité", "benedicites", "restaurant"),
}));

export const SIMPLE_DOCUMENT_FILE_NAMES: string[] = [
  'Méthode',
  'Contact',
  'Gestes',
  'Cléophas',
];
