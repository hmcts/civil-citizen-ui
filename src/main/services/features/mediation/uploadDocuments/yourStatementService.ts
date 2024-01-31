import {ClaimSummaryContent} from 'form/models/claimSummarySection';

import {GenericForm} from 'form/models/genericForm';

import {
  TypeOfDocumentYourNameSection,
  UploadDocumentsForm
} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {TypeOfMediationDocuments, UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {buildYourStatementSection} from 'services/features/mediation/uploadDocuments/yourStatementContentBuilder';

export const getYourStatementContent = (uploadDocuments: UploadDocuments, form: GenericForm<UploadDocumentsForm>): ClaimSummaryContent[][] => {
  const sectionContent = [];

  const yourStatement = uploadDocuments.typeOfDocuments.find((typeOfDocument) => typeOfDocument.type === TypeOfMediationDocuments.YOUR_STATEMENT);

  if(yourStatement){
    sectionContent.push(documentsForYourStatement(form));
  }

  return sectionContent;
};

const documentsForYourStatement = (form: GenericForm<UploadDocumentsForm>): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form && form.model.documentsForYourStatement.length != 0) {
    form.model.documentsForYourStatement?.forEach(function (typeOfDocumentYourNameSection: TypeOfDocumentYourNameSection, index: number) {
      sectionContent.push([buildYourStatementSection(typeOfDocumentYourNameSection, index, form)]);
    });
  } else {
    sectionContent.push([buildYourStatementSection()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};

