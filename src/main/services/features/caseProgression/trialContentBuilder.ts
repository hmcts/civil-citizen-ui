import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadYourDocumentsSectionBuilder} from 'models/caseProgression/uploadYourDocumentsSectionBuilder';

export const buildTrialCaseSummarySection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  return new UploadYourDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.CASE_SUMMARY')
    .build();
};

export const buildTrialSkeletonSection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  return new UploadYourDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.SKELETON')
    .build();
};

export const buildTrialLegalSection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  return new UploadYourDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.LEGAL')
    .build();
};

export const buildTrialCostSection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  return new UploadYourDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.COST')
    .build();
};

export const buildTrialDocumentarySection = (claim: Claim, claimId: string): ClaimSummarySection[] => {
  return new UploadYourDocumentsSectionBuilder()
    .addTitle('PAGES.UPLOAD_DOCUMENTS.TRIAL.DOCUMENTARY')
    .build();
};
