import {MediationAgreementDocuments} from 'models/mediation/documents/mediationAgreementDocuments';
import {getLng} from 'common/utils/languageToggleUtils';
import dayjs from 'dayjs';

export class ViewDocumentsSection {
  title: string;
  documents: MediationAgreementDocuments[];

  constructor(viewDocumentsTitle: string, mediationAgreementDocuments: MediationAgreementDocuments[]) {
    this.title = viewDocumentsTitle;
    this.documents = mediationAgreementDocuments;
  }

  mapperDocumentsToView(lang: string){
    const mapDocuments =  this.documents.map((items) => {
      return {
        fileName: items.value.documentType,
        uploadDate: dayjs(items.value.createdDatetime).locale(getLng(lang)).format('DD MMMM YYYY'),
        linkInformation: {
          url: items.value.documentLink.document_url,
          text: items.value.documentLink.document_filename,
        },
      };
    });
    return {
      title: this.title,
      documents: mapDocuments,
    };
  }
}
