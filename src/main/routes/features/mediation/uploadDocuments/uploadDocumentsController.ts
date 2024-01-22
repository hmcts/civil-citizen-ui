import {MEDIATION_TYPE_OF_DOCUMENTS, MEDIATION_UPLOAD_DOCUMENTS} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {NextFunction, RequestHandler, Response, Router} from 'express';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {
  getUploadDocuments,
  saveUploadDocument,
} from 'services/features/mediation/uploadDocuments/uploadDocumentsService';
import {GenericForm} from 'form/models/genericForm';
import {convertToArrayOfStrings} from 'common/utils/stringUtils';
import {TypeOfMediationDocuments, UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {TypeOfDocumentsForm} from 'form/models/mediation/uploadDocuments/typeOfDocumentsForm';
import {Claim} from 'models/claim';
import {TypeOfDocumentSection, UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {UploadDocumentsSectionBuilder} from 'models/caseProgression/uploadDocumentsSectionBuilder';
import {forEach} from 'lodash';
import {TypeOfDocumentsItemForm} from "form/models/mediation/uploadDocuments/typeOfDocumentsItemForm";

const uploadDocumentViewPath = 'features/mediation/uploadDocuments/uploadDocuments';
const mediationUploadDocumentsController = Router();
const TYPE_OF_DOCUMENTS_PROPERTY_NAME = 'uploadDocuments';
const MEDIATION_UPLOAD_DOCUMENT_PAGE = 'PAGES.MEDIATION.UPLOAD_DOCUMENTS.';

export const buildUploadDocumentSection = (form:GenericForm<TypeOfDocumentsForm>): ClaimSummarySection[][] => {
  const sectionContent = [];
  const typeOfDocumentsItemForms = form.model.orderArrayById();
  const items = typeOfDocumentsItemForms.map((typeOfDocumentItemForm, index) => {
    typeOfDocumentItemForm.uploadDocuments.forEach((uploadDocument) => {
      const errorFieldNamePrefix = `${typeOfDocumentItemForm.type}[${typeOfDocumentItemForm.type}][${index}]`;
      const invalidDateErrors = {
        invalidDayError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateDay]`, typeOfDocumentItemForm.type),
        invalidMonthError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateMonth]`, typeOfDocumentItemForm.type),
        invalidYearError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][dateYear]`, typeOfDocumentItemForm.type),
        invalidDateError : form?.errorFor(`${errorFieldNamePrefix}[dateInputFields][date]`, typeOfDocumentItemForm.type),
      };
      sectionContent.push( new UploadDocumentsSectionBuilder()
          .addTitle(typeOfDocumentItemForm.type, null, 'govuk-!-width-three-quarters')
          .addInputArray('input1', '', 'PAGES.UPLOAD_DOCUMENTS.TYPE_OF_DOCUMENT_EXAMPLE', typeOfDocumentItemForm.type, 'typeOfDocument', section?.typeOfDocument, index, form?.errorFor(`${errorFieldNamePrefix}[typeOfDocument]`, typeOfDocumentItemForm.type))
          .addDateArray('addDate', invalidDateErrors, 'PAGES.UPLOAD_DOCUMENTS.DATE_EXAMPLE', typeOfDocumentItemForm.type, 'dateInputFields', 'date', section?.dateInputFields?.dateDay.toString(), section?.dateInputFields?.dateMonth.toString(), section?.dateInputFields?.dateYear.toString(), index )
          .addUploadArray('upload', '', typeOfDocumentItemForm.type, 'fileUpload', index,typeOfDocumentItemForm?.uploadDocuments.fileUpload?.fieldname', form?.errorFor(`${errorFieldNamePrefix}[${'fileUpload'}]`, typeOfDocumentItemForm.type), section?.caseDocument)
          .addRemoveSectionButton(form?.model.typeOfDocuments?.length > 1 || false)
          .build();
    );
    });

  });

  return items;
};
const partyInformation = (claim: Claim) =>  {
  return {
    claimantName: claim.getClaimantFullName(),
    defendantName: claim.getDefendantFullName(),
  };
};

function renderView(form: GenericForm<TypeOfDocumentsForm>, res: Response, claimId: string, claim: Claim) {
  res.render(uploadDocumentViewPath, {
    form: form,
    pageTitle: 'PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE',
    claimId: claimId,
    partyInformation: partyInformation(claim)});
}

const typeOfDocumentsForm = new TypeOfDocumentsForm(`${MEDIATION_UPLOAD_DOCUMENT_PAGE}CHECKBOX_TITLE`, `${MEDIATION_UPLOAD_DOCUMENT_PAGE}CHECKBOX_HINT`);

mediationUploadDocumentsController.get(MEDIATION_UPLOAD_DOCUMENTS, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const uploadDocuments = getUploadDocuments(claim);
    const form = new GenericForm(typeOfDocumentsForm.mapTypeOfDocumentsFormFromUploadDocuments(uploadDocuments));
    const builder =  buildUploadDocumentSection(form);
    console.log(builder);
    renderView(form, res, claimId, claim);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

mediationUploadDocumentsController.post(MEDIATION_UPLOAD_DOCUMENTS, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const mapOfTypeOfDocumentsForm =  typeOfDocumentsForm.mapTypeOfDocumentsFormFromStrings(convertToArrayOfStrings(req.body.typeOfDocuments));
    const form = new GenericForm(mapOfTypeOfDocumentsForm);
    await form.validate();
    if (form.hasErrors()) {
      renderView(form, res, claimId, claim);
    } else {
      //get upload documents from claim and map to type of documents
      const uploadDocuments: UploadDocuments = getUploadDocuments(claim).mapUploadDocumentsFromTypeOfDocumentsForm(mapOfTypeOfDocumentsForm);
      await saveUploadDocument(redisKey, uploadDocuments.typeOfDocuments, TYPE_OF_DOCUMENTS_PROPERTY_NAME);
      res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_UPLOAD_DOCUMENTS));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default mediationUploadDocumentsController;
