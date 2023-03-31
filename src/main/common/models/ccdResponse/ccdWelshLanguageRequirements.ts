
export interface CCDWelshLanguageRequirements {
  evidence?: CCDLanguage ,
  court?: CCDLanguage,
  documents?: CCDLanguage,
}

export enum CCDLanguage {
   WELSH =  'WELSH',
   ENGLISH = 'ENGLISH',
   BOTH = 'BOTH',
}
