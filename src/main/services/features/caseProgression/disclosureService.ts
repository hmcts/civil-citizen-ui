import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {Claim} from 'models/claim';

import {
  buildDisclosureDocumentSection, buildDisclosureListSection,
} from 'services/features/caseProgression/disclosureContentBuilder';
import {GenericForm} from 'form/models/genericForm';
import {
  FileOnlySection, TypeOfDocumentSection,
  UploadDocumentsUserForm,
} from 'models/caseProgression/uploadDocumentsUserForm';

export const getDisclosureContent = (claim: Claim, form: GenericForm<UploadDocumentsUserForm>): ClaimSummaryContent[][] => {
  const sectionContent = [];

  if (claim.caseProgression?.defendantUploadDocuments?.disclosure[0]?.selected) {
    sectionContent.push(documentsForDisclosure(form));
  }

  if (claim.caseProgression?.defendantUploadDocuments?.disclosure[1]?.selected) {
    sectionContent.push(disclosureList(form));
  }

  return sectionContent;
};

const documentsForDisclosure = (form: GenericForm<UploadDocumentsUserForm>): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form) {
    form.model.documentsForDisclosure?.forEach(function (documentsForDisclosure: TypeOfDocumentSection, index: number) {
      sectionContent.push([buildDisclosureDocumentSection(documentsForDisclosure, index, form)]);
    });
  } else {
    sectionContent.push([buildDisclosureDocumentSection()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};

const disclosureList = (form: GenericForm<UploadDocumentsUserForm>): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form) {
    form.model.disclosureList?.forEach(function (disclosureList: FileOnlySection, index: number) {
      sectionContent.push([buildDisclosureListSection(disclosureList, index, form)]);
    });
  } else {
    sectionContent.push([buildDisclosureListSection()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};
