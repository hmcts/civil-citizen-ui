import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';

import {
  buildDocumentsReferred,
  buildNoticeOfIntention,
  buildWitnessStatement, buildWitnessSummary,
} from 'services/features/caseProgression/witnessContentBuilder';
import {GenericForm} from 'form/models/genericForm';
import {
  TypeOfDocumentSection,
  UploadDocumentsUserForm,
  WitnessSection,
} from 'models/caseProgression/uploadDocumentsUserForm';

export const getWitnessContent = (claim: Claim, form: GenericForm<UploadDocumentsUserForm>): ClaimSummaryContent[][] => {
  const sectionContent = [];

  if (claim.caseProgression?.defendantUploadDocuments?.witness[0]?.selected){
    sectionContent.push(getWitnessStatement(form));
  }

  if (claim.caseProgression?.defendantUploadDocuments?.witness[1]?.selected){
    sectionContent.push(getWitnessSummary(form));
  }

  if (claim.caseProgression?.defendantUploadDocuments?.witness[2]?.selected){
    sectionContent.push(getNoticeOfIntention(form));
  }

  if (claim.caseProgression?.defendantUploadDocuments?.witness[3]?.selected){
    sectionContent.push(getDocumentsReferred(form));
  }

  return sectionContent;
};

const getWitnessStatement = (form: GenericForm<UploadDocumentsUserForm>): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form) {
    form.model.witnessStatement.forEach(function (witnessSection: WitnessSection, index: number) {
      sectionContent.push([buildWitnessStatement(witnessSection, index, form)]);
    });
  } else {
    sectionContent.push([buildWitnessStatement()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};

const getWitnessSummary = (form: GenericForm<UploadDocumentsUserForm>): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form) {
    form.model.witnessSummary.forEach(function (witnessSection: WitnessSection, index: number) {
      sectionContent.push([buildWitnessSummary(witnessSection, index, form)]);
    });
  } else {
    sectionContent.push([buildWitnessSummary()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};

const getNoticeOfIntention = (form: GenericForm<UploadDocumentsUserForm>): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form) {
    form.model.noticeOfIntention.forEach(function (witnessSection: WitnessSection, index: number) {
      sectionContent.push([buildNoticeOfIntention(witnessSection, index, form)]);
    });
  } else {
    sectionContent.push([buildNoticeOfIntention()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};

const getDocumentsReferred = (form: GenericForm<UploadDocumentsUserForm>): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form) {
    form.model.documentsReferred.forEach(function (documentsReferred: TypeOfDocumentSection, index: number) {
      sectionContent.push([buildDocumentsReferred(documentsReferred, index, form)]);
    });
  } else {
    sectionContent.push([buildDocumentsReferred()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};
