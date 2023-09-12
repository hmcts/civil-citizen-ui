import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';
import {
  buildAnswersToQuestionsSection,
  buildExpertReportSection,
  buildJointStatementSection, buildQuestionsForOtherSection,
} from 'services/features/caseProgression/expertContentBuilder';
import {GenericForm} from 'form/models/genericForm';
import {
  ExpertSection,
  UploadDocumentsUserForm,
} from 'models/caseProgression/uploadDocumentsUserForm';

export const getExpertContent = (claim: Claim, form: GenericForm<UploadDocumentsUserForm>): ClaimSummaryContent[][] => {
  const sectionContent = [];
  const selectItems= [];
  // TODO check for logged user and send only the other party/parties name/s
  selectItems.push({'value': '', 'text': ''});
  selectItems.push({'value': claim.getClaimantFullName(), 'text': claim.getClaimantFullName()});
  selectItems.push({'value': claim.getDefendantFullName(), 'text': claim.getDefendantFullName()});

  if(claim.caseProgression?.defendantUploadDocuments?.expert[0]?.selected){
    sectionContent.push(getExpertReport(form));
  }

  if(claim.caseProgression?.defendantUploadDocuments?.expert[1]?.selected){
    sectionContent.push(getExpertStatement(form));
  }

  if(claim.caseProgression?.defendantUploadDocuments?.expert[2]?.selected){
    sectionContent.push(getQuestionsForExperts(form, selectItems));
  }

  if(claim.caseProgression?.defendantUploadDocuments?.expert[3]?.selected){
    sectionContent.push(getAnswersForExperts(form, selectItems));
  }

  return sectionContent;
};

const getExpertReport = (form: GenericForm<UploadDocumentsUserForm>): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form && form.model.expertReport.length != 0) {
    form.model.expertReport.forEach(function (expertSection: ExpertSection, index: number) {
      sectionContent.push([buildExpertReportSection(expertSection, index, form)]);
    });
  } else {
    sectionContent.push([buildExpertReportSection()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};

const getExpertStatement = (form: GenericForm<UploadDocumentsUserForm>): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form && form.model.expertStatement.length != 0) {
    form.model.expertStatement.forEach(function (expertSection: ExpertSection, index: number) {
      sectionContent.push([buildJointStatementSection(expertSection, index, form)]);
    });
  } else {
    sectionContent.push([buildJointStatementSection()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};

const getQuestionsForExperts = (form: GenericForm<UploadDocumentsUserForm>, selectItems: ({
  text: string;
  value: string
})[]): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form && form.model.questionsForExperts.length != 0) {
    form.model.questionsForExperts.forEach(function (expertSection: ExpertSection, index: number) {
      sectionContent.push([buildQuestionsForOtherSection(selectItems, expertSection, index, form)]);
    });
  } else {
    sectionContent.push([buildQuestionsForOtherSection(selectItems)]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};

const getAnswersForExperts = (form: GenericForm<UploadDocumentsUserForm>, selectItems: ({
  text: string;
  value: string
})[]): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form && form.model.answersForExperts.length != 0) {
    form.model.answersForExperts.forEach(function (expertSection: ExpertSection, index: number) {
      sectionContent.push([buildAnswersToQuestionsSection(selectItems, expertSection, index, form)]);
    });
  } else {
    sectionContent.push([buildAnswersToQuestionsSection(selectItems)]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};
