export class DocumentLinkInformation{
  url: string;
  text: string;

  constructor(url: string, text: string) {
    this.url = url;
    this.text = text;
  }
}

export class DocumentInformation {
  fileName: string;
  uploadDate: string;
  linkInformation: DocumentLinkInformation;

  constructor(fileName: string, uploadDate: string, linkInformation: DocumentLinkInformation) {
    this.fileName = fileName;
    this.uploadDate = uploadDate;
    this.linkInformation = linkInformation;
  }
}

export class DocumentsViewComponent {
  title: string;
  documents: DocumentInformation[];

  constructor(title: string, documents: DocumentInformation[]) {
    this.title = title;
    this.documents = documents;
  }
}
