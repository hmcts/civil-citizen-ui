import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  getDate,
  getInput, getUpload,
  getWitnessTitle,
  getWitnessYourStatement
} from 'services/features/caseProgression/witnessSection';

export const buildWitnessSection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  const sectionContent = [];
  const witnessTitle = getWitnessTitle();

  const witnessYourStatementContent = getWitnessYourStatement();
  const inputContent = getInput('PAGES.UPLOAD_DOCUMENTS.NAME');
  const dateContent = getDate('PAGES.UPLOAD_DOCUMENTS.DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE');
  const uploadContent = getUpload();

  sectionContent.push(witnessTitle);
  sectionContent.push(witnessYourStatementContent);
  sectionContent.push(inputContent);
  sectionContent.push(dateContent);
  sectionContent.push(uploadContent);

  return sectionContent.flat();
};
