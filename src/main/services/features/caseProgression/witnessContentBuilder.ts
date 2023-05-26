import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  getDate,
  getInput, getUpload,
  getWitnessSubtitle,
} from 'services/features/caseProgression/uploadDocumentsSection';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

export const buildWitnessSection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  const sectionContent = [];
  const pageSectionBuilder = new PageSectionBuilder();
  const witnessYourStatementTitle = pageSectionBuilder.addTitle('PAGES.UPLOAD_DOCUMENTS.WITNESS')._claimSummarySections.at(0);
  const witnessYourStatementContent = getWitnessSubtitle('PAGES.UPLOAD_DOCUMENTS.STATEMENT');
  const inputContent = getInput('PAGES.UPLOAD_DOCUMENTS.NAME','govuk-!-width-three-half');
  const dateContent = getDate('PAGES.UPLOAD_DOCUMENTS.DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE');
  const uploadContent = getUpload('PAGES.UPLOAD_DOCUMENTS.UPLOAD','PAGES.UPLOAD_DOCUMENTS.NO_UPLOAD');

  sectionContent.push(witnessYourStatementTitle);
  sectionContent.push(witnessYourStatementContent);
  sectionContent.push(inputContent);
  sectionContent.push(dateContent);
  sectionContent.push(uploadContent);

  return sectionContent.flat();
};
