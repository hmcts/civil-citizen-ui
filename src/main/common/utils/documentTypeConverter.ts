import {DocumentType} from '../../common/models/document/documentType';

export const convertToDocumentType = (uri: string): DocumentType => {
  switch (uri) {
    case 'sealed-claim':
      return DocumentType.SEALED_CLAIM;
    case 'acknowledgement-of-claim':
      return DocumentType.ACKNOWLEDGEMENT_OF_CLAIM;
    case 'acknowledgement-of-service':
      return DocumentType.ACKNOWLEDGEMENT_OF_SERVICE;
    case 'directions-questionnaire':
      return DocumentType.DIRECTIONS_QUESTIONNAIRE;
    case 'defendant-defence':
      return DocumentType.DEFENDANT_DEFENCE;
    case 'defendant-draft-directions':
      return DocumentType.DEFENDANT_DRAFT_DIRECTIONS;
    case 'default-judgement':
      return DocumentType.DEFAULT_JUDGMENT;
    case 'claimant-defence':
      return DocumentType.CLAIMANT_DEFENCE;
    case 'claimant-draft-directions':
      return DocumentType.CLAIMANT_DRAFT_DIRECTIONS;
    default:
      return undefined;
  }
};
