import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  getDate,
  getInput, getUpload,
  getWitnessSubtitle,
} from 'services/features/caseProgression/uploadDocumentsSection';
import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';

export const buildWitnessSection = (claim: Claim): ClaimSummarySection[] => {
  const sectionContent = [];
  const defendant = claim?.caseProgression?.defendantUploadDocuments;
  const defendantUploadDocuments = new UploadDocuments(defendant.disclosure, defendant.witness, defendant.expert,defendant.trial);

  const uploadContent = getUpload('PAGES.UPLOAD_DOCUMENTS.UPLOAD','PAGES.UPLOAD_DOCUMENTS.NO_UPLOAD');
  const dateStatementContent = getDate('PAGES.UPLOAD_DOCUMENTS.DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE');
  const inputWitnessNameContent = getInput('PAGES.UPLOAD_DOCUMENTS.WITNESS_NAME','govuk-!-width-three-half');

  if (defendantUploadDocuments?.witness?.[0].selected){
    const witnessYourStatementContent = getWitnessSubtitle('PAGES.UPLOAD_DOCUMENTS.STATEMENT');
    const inputNameContent = getInput('PAGES.UPLOAD_DOCUMENTS.NAME','govuk-!-width-three-half');
    sectionContent.push(witnessYourStatementContent);
    sectionContent.push(inputNameContent);
    sectionContent.push(dateStatementContent);
    sectionContent.push(uploadContent);
  }
  if (defendantUploadDocuments?.witness?.[1].selected){
    const witnessStatementContent = getWitnessSubtitle('PAGES.UPLOAD_DOCUMENTS.WITNESS_STATEMENT');

    sectionContent.push(witnessStatementContent);
    sectionContent.push(inputWitnessNameContent);
    sectionContent.push(dateStatementContent);
    sectionContent.push(uploadContent);
  }
  if (defendantUploadDocuments?.witness?.[2].selected){
    const witnessSummaryContent = getWitnessSubtitle('PAGES.UPLOAD_DOCUMENTS.WITNESS_SUMMARY');
    const dateSummaryContent = getDate('PAGES.UPLOAD_DOCUMENTS.DATE_SUMMARY', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE');
    sectionContent.push(witnessSummaryContent);
    sectionContent.push(inputWitnessNameContent);
    sectionContent.push(dateSummaryContent);
    sectionContent.push(uploadContent);
  }
  if (defendantUploadDocuments?.witness?.[3].selected){
    const witnessNoticeContent = getWitnessSubtitle('PAGES.UPLOAD_DOCUMENTS.WITNESS_NOTICE');

    sectionContent.push(witnessNoticeContent);
    sectionContent.push(inputWitnessNameContent);
    sectionContent.push(dateStatementContent);
    sectionContent.push(uploadContent);
  }
  if (defendantUploadDocuments?.witness?.[4].selected){
    const witnessDocumentsContent = getWitnessSubtitle('PAGES.UPLOAD_DOCUMENTS.WITNESS_DOCUMENT');
    const inputContent = getInput('PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT','govuk-!-width-three-half','PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT_HINT');
    const dateContent = getDate('PAGES.UPLOAD_DOCUMENTS.DOCUMENT_DATE', 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE');

    sectionContent.push(witnessDocumentsContent);
    sectionContent.push(inputContent);
    sectionContent.push(dateContent);
    sectionContent.push(uploadContent);
  }

  return sectionContent.flat();
};
