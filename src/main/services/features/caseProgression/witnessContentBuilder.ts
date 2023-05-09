import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  getDate,
  getInput, getUpload,
  getWitnessSubtitle,
} from 'services/features/caseProgression/uploadDocumentsSection';

export const buildWitnessSection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  const sectionContent = [];

  const witnessYourStatementContent = getWitnessSubtitle('PAGES.UPLOAD_DOCUMENTS.STATEMENT');
  const inputContent = getInput('PAGES.UPLOAD_DOCUMENTS.NAME','govuk-!-width-three-half');
  const dateContent = getDate('PAGES.UPLOAD_DOCUMENTS.DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE');
  const uploadContent = getUpload('PAGES.UPLOAD_DOCUMENTS.UPLOAD','PAGES.UPLOAD_DOCUMENTS.NO_UPLOAD');

  sectionContent.push(witnessYourStatementContent);
  sectionContent.push(inputContent);
  sectionContent.push(dateContent);
  sectionContent.push(uploadContent);

  return sectionContent.flat();
};
