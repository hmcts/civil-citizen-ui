import {documentIdExtractor} from 'common/utils/stringUtils';
import {SystemGeneratedCaseDocuments} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';
import {ClaimBilingualLanguagePreference} from 'common/models/claimBilingualLanguagePreference';

export class SystemDocumentInfoExtractor {
  static getSystemGeneratedCaseDocumentIdByType = ((systemGeneratedCaseDocuments: SystemGeneratedCaseDocuments[], documentType: DocumentType, respondentResponseLanguage?: ClaimBilingualLanguagePreference) => {
    let sealedDocument = systemGeneratedCaseDocuments.find((document) => {
      return document.value.documentType === documentType;
    });
    if (documentType === DocumentType.DEFENDANT_DEFENCE && respondentResponseLanguage === ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH) {
      const responseDocuments = systemGeneratedCaseDocuments.filter(documents => documents.value.documentType === documentType);
      sealedDocument = responseDocuments[1];
    }
    return documentIdExtractor(sealedDocument.value.documentLink.document_binary_url);
  });
}
