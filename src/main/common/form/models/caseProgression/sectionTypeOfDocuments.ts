import {TypeOfDocumentsItems} from 'form/models/caseProgression/typeOfDocuments';

export class SectionTypeOfDocuments {
  title ?: string;
  items ?:TypeOfDocumentsItems[];

  constructor(title: string, items: TypeOfDocumentsItems[]) {
    this.title = title;
    this.items = items;
  }
}
