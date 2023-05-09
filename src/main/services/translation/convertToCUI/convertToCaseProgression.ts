
import {CCDClaim} from 'models/civilClaimResponse';
import {CaseProgression, CaseProgressionDocuments} from 'models/caseProgression/caseProgression';
import {CaseDocument} from 'models/document/caseDocument';

export const toCUICaseProgression = (ccdClaim: CCDClaim): CaseProgression => {
  if (ccdClaim) {
    const caseProgression : CaseProgression = new CaseProgression();
    caseProgression.caseProgressionDocuments = getDocumentDetails(ccdClaim);
    return caseProgression;

  }
};
const getDocumentDetails = (ccdClaim: CCDClaim): CaseProgressionDocuments[] => {
  const caseProgressionDocuments: CaseProgressionDocuments[] = [];
  //hearing document
  ccdClaim.hearingDocuments.forEach((item) => {
    pushItems(caseProgressionDocuments, item.id, item.value);
  });
  if (ccdClaim.sdoOrderDocument){
    pushItems(caseProgressionDocuments, null, ccdClaim.sdoOrderDocument);
  }
  return caseProgressionDocuments;
};

const pushItems = (caseProgressionDocuments: CaseProgressionDocuments[], id: string, caseDocument: CaseDocument) => {
  caseProgressionDocuments.push(new CaseProgressionDocuments(id,caseDocument));
};
