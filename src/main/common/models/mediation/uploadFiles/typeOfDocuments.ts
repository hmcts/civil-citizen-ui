export enum TypeOfMediationDocuments {
    YOUR_STATEMENT = ('yourStatement'),
    DOCUMENTS_REFERRED_TO_IN_STATEMENT = ('documentsReferredToInStatement')
}

export class TypeOfDocumentsItem{
  value: string;
  text: string;
  checked: boolean;
  type: TypeOfMediationDocuments;
  hint?: {text?: string};

  constructor(value: string, text: string, checked: boolean, type: TypeOfMediationDocuments, hint?: { text?: string }) {
    this.value = value;
    this.text = text;
    this.checked = checked;
    this.type = type;
    this.hint = hint;
  }
}
export class TypeOfDocuments {
  title:string;
  items:TypeOfDocumentsItem[];

  constructor(builder: TypeOfDocumentsBuilder) {
    this.title = builder.title;
    this.items = builder.items;
  }

  // Builder class for constructing TypeOfDocuments
  static builder(title: string): TypeOfDocumentsBuilder {
    return new TypeOfDocumentsBuilder(title);
  }

}

export class TypeOfDocumentsBuilder {
  title: string;
  items: TypeOfDocumentsItem[];

  constructor(title: string) {
    // Initialize default values or leave them undefined
    this.title = title;
    this.items = [];
  }

  addItems(item: TypeOfDocumentsItem): TypeOfDocumentsBuilder {
    this.items.push(item);
    return this;
  }

  // Build method to create an instance of TypeOfDocuments
  build(): TypeOfDocuments {
    return new TypeOfDocuments(this);
  }
}
