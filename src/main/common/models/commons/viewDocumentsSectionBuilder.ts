import {MediationAgreementDocuments} from 'models/mediation/documents/mediationAgreementDocuments';

export class ViewDocumentsSection {
  title: string;
  documents: MediationAgreementDocuments[];

  constructor(viewDocumentsTitle: string, mediationAgreementDocuments: MediationAgreementDocuments[]) {
    this.title = viewDocumentsTitle;
    this.documents = mediationAgreementDocuments;
  }

  mapperDocumentsToView(){
    const mapDocuments =  this.documents.map((items) => {
      return {
        uploadDate: items.value.createdDatetime,
        fileName: items.value.documentName,
        linkInformation: {
          url: 'url',
          text: 'text',
        },
      };
    });
    return {
      title: this.title,
      documents: mapDocuments,
    };
  }
}
