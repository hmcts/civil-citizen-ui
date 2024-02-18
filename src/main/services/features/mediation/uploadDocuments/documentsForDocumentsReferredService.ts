import {ClaimSummaryContent} from 'form/models/claimSummarySection';
import {GenericForm} from 'form/models/genericForm';
import {
  MediationTypeOfDocumentSection,
  UploadDocumentsForm,
} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {TypeOfMediationDocuments, UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {
  buildDocumentsReferredSection,
} from 'services/features/mediation/uploadDocuments/documentsForDocumentsReferredContentBuilder';

export const getDocumentsForDocumentsReferred = (uploadDocuments: UploadDocuments, form: GenericForm<UploadDocumentsForm>): ClaimSummaryContent[][] => {
  const sectionContent = [];

  const documentsReferred = uploadDocuments.typeOfDocuments.find((typeOfDocument) => typeOfDocument.type === TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT && typeOfDocument.checked === true);

  if(documentsReferred){
    sectionContent.push(documentsForDocumentsReferred(form));
  }

  return sectionContent;
};

const documentsForDocumentsReferred = (form: GenericForm<UploadDocumentsForm>): ClaimSummaryContent[] => {
  const sectionContent = [];

  if (form && form.model.documentsForDocumentsReferred.length != 0) {
    form.model.documentsForDocumentsReferred?.forEach(function (documentsForDocumentsReferred: MediationTypeOfDocumentSection, index: number) {
      sectionContent.push([buildDocumentsReferredSection(documentsForDocumentsReferred, index, form)]);
    });
  } else {
    sectionContent.push([buildDocumentsReferredSection()]);
  }

  return sectionContent.flat().map((sectionContent, index) => ({
    contentSections: sectionContent,
    hasDivider: index < sectionContent.length - 1,
  }));
};

