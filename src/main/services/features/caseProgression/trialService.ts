import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildTrialCaseSummarySection, buildTrialCostSection,
  buildTrialDocumentarySection, buildTrialLegalSection, buildTrialSkeletonSection,
} from 'services/features/caseProgression/trialContentBuilder';
import {GenericForm} from 'form/models/genericForm';
import {TypeOfDocumentSection, UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';

export const getTrialContent = (claim: Claim, form: GenericForm<UploadDocumentsUserForm>, isSmallClaims: boolean): ClaimSummaryContent[][] => {
  const sectionContent: any[] = [];

  if(claim.caseProgression?.defendantUploadDocuments?.trial[0]?.selected) {
    sectionContent.push(trialCaseSummary(form));
  }

  if(claim.caseProgression?.defendantUploadDocuments?.trial[1]?.selected) {
    sectionContent.push(trialSkeletonArgument(form));
  }

  if(claim.caseProgression?.defendantUploadDocuments?.trial[2]?.selected && !isSmallClaims) {
    sectionContent.push(trialAuthorities(form));
  }

  if(claim.caseProgression?.defendantUploadDocuments?.trial[3]?.selected) {
    sectionContent.push(trialCosts(form));
  }

  if(claim.caseProgression?.defendantUploadDocuments?.trial[4]?.selected) {
    sectionContent.push(trialDocumentary(form, isSmallClaims));
  }

  if(claim.caseProgression?.defendantUploadDocuments?.trial[2]?.selected && isSmallClaims) {
    sectionContent.push(trialAuthorities(form));
  }

  return sectionContent;
};

const trialCaseSummary = (form: GenericForm<UploadDocumentsUserForm>): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form) {
    form.model.trialCaseSummary?.forEach(function (trialCaseSummary: TypeOfDocumentSection, index: number) {
      sectionContent.push([buildTrialCaseSummarySection(trialCaseSummary, index, form)]);
    });
  } else {
    sectionContent.push([buildTrialCaseSummarySection()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};

const trialSkeletonArgument = (form: GenericForm<UploadDocumentsUserForm>): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form) {
    form.model.trialSkeletonArgument?.forEach(function (trialSkeletonArgument: TypeOfDocumentSection, index: number) {
      sectionContent.push([buildTrialSkeletonSection(trialSkeletonArgument, index, form)]);
    });
  } else {
    sectionContent.push([buildTrialSkeletonSection()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};

const trialAuthorities = (form: GenericForm<UploadDocumentsUserForm>): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form) {
    form.model.trialAuthorities?.forEach(function (trialAuthorities: TypeOfDocumentSection, index: number) {
      sectionContent.push([buildTrialLegalSection(trialAuthorities, index, form)]);
    });
  } else {
    sectionContent.push([buildTrialLegalSection()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};

const trialCosts = (form: GenericForm<UploadDocumentsUserForm>): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form) {
    form.model.trialCosts?.forEach(function (trialCosts: TypeOfDocumentSection, index: number) {
      sectionContent.push([buildTrialCostSection(trialCosts, index, form)]);
    });
  } else {
    sectionContent.push([buildTrialCostSection()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};

const trialDocumentary = (form: GenericForm<UploadDocumentsUserForm>, isSmallClaims: boolean): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form) {
    form.model.trialDocumentary?.forEach(function (trialDocumentary: TypeOfDocumentSection, index: number) {
      sectionContent.push([buildTrialDocumentarySection(isSmallClaims, trialDocumentary, index, form)]);
    });
  } else {
    sectionContent.push([buildTrialDocumentarySection(isSmallClaims)]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};
