import {NextFunction, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'common/models/AppRequest';

import {MEDIATION_TYPE_OF_DOCUMENTS} from 'routes/urls';

import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';

import {
  TypeOfDocumentsForm,
  TypeOfDocumentsItemForm,
  TypeOfMediationDocuments, UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {
  getUploadDocuments,
  saveUploadDocument,
} from 'services/features/response/mediation/uploadDocuments/uploadDocumentsService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const typeOfDocumentsViewPath = 'features/mediation/uploadDocuments/typeOfDocuments';
const mediationTypeOfDocumentsController = Router();
const TYPE_OF_DOCUMENTS_PROPERTY_NAME = 'typeOfDocuments';
const MEDIATION_TYPE_OF_DOCUMENTS_PAGE = 'PAGES.MEDIATION.TYPE_OF_DOCUMENTS.';

const partyInformation = (claim: Claim) =>  {
  return {
    claimantName: claim.getClaimantFullName(),
    defendantName: claim.getDefendantFullName(),
  };
};
const typeOfDocumentsForm = new TypeOfDocumentsForm(`${MEDIATION_TYPE_OF_DOCUMENTS_PAGE}CHECKBOX_TITLE`, `${MEDIATION_TYPE_OF_DOCUMENTS_PAGE}CHECKBOX_HINT`);
typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(1,TypeOfMediationDocuments.YOUR_STATEMENT.toString(),`${MEDIATION_TYPE_OF_DOCUMENTS_PAGE}${TypeOfMediationDocuments.YOUR_STATEMENT}`, false, TypeOfMediationDocuments.YOUR_STATEMENT, `${MEDIATION_TYPE_OF_DOCUMENTS_PAGE}${TypeOfMediationDocuments.YOUR_STATEMENT}_HINT`));
typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(2,TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT.toString(),`${MEDIATION_TYPE_OF_DOCUMENTS_PAGE}${TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT}`, false, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, `${MEDIATION_TYPE_OF_DOCUMENTS_PAGE}${TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT}_HINT`));

function convertToArrayOfStrings(data: string | string[]): string[] {
  if (typeof data === 'string') {
    // If it's a string, convert it to an array of characters
    return Array.of(data);
  } else if (Array.isArray(data)) {
    // If it's already an array, return it as is
    return data;
  }
}
async function renderView(form: GenericForm<TypeOfDocumentsForm>, res: Response, claimId: string, claim: Claim) {
  res.render(typeOfDocumentsViewPath, {
    form: form,
    pageTitle: 'PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE',
    claimId: 21212,
    partyInformation: partyInformation(claim)});
}

mediationTypeOfDocumentsController.get(MEDIATION_TYPE_OF_DOCUMENTS, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const uploadDocuments = await getUploadDocuments(redisKey);
    const form = new GenericForm(typeOfDocumentsForm.mapTypeOfDocumentsFormFromUploadDocuments(uploadDocuments));
    await renderView(form, res, claimId, new Claim());
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

mediationTypeOfDocumentsController.post(MEDIATION_TYPE_OF_DOCUMENTS, (async (req, res, next) => {
  try {
    const typeOfDocuments =  typeOfDocumentsForm.mapTypeOfDocumentsFormFromStrings(convertToArrayOfStrings(req.body.typeOfDocuments));
    const form = new GenericForm(typeOfDocuments);
    await form.validate();
    if (form.hasErrors()) {
      await renderView(form, res, 'claimId', new Claim());
    } else {
      const redisKey = generateRedisKey(<AppRequest>req);
      const claimId = req.params.id;
      //get the existing uploadDocuments
      const uploadDocuments: UploadDocuments = await getUploadDocuments(redisKey);

      //map with the new typeOfDocuments from form
      await saveUploadDocument(redisKey, uploadDocuments.mapUploadDocumentsFromTypeOfDocumentsForm(typeOfDocuments).typeOfDocuments, TYPE_OF_DOCUMENTS_PROPERTY_NAME);

      //await saveUploadDocument(redisKey, form.model, TYPE_OF_DOCUMENTS_PROPERTY_NAME);
      //mediationUploadDocuments":{"typeOfDocuments":{"title":"PAGES.MEDIATION.TYPE_OF_DOCUMENTS.CHECKBOX_TITLE","hint":"PAGES.MEDIATION.TYPE_OF_DOCUMENTS.CHECKBOX_HINT","typeOfDocuments":[{"value":"YOUR_STATEMENT","text":"PAGES.MEDIATION.TYPE_OF_DOCUMENTS.YOUR_STATEMENT","checked":true,"type":"YOUR_STATEMENT","hint":"PAGES.MEDIATION.TYPE_OF_DOCUMENTS.YOUR_STATEMENT_HINT"},{"value":"DOCUMENTS_REFERRED_TO_IN_STATEMENT","text":"PAGES.MEDIATION.TYPE_OF_DOCUMENTS.DOCUMENTS_REFERRED_TO_IN_STATEMENT","checked":true,"type":"DOCUMENTS_REFERRED_TO_IN_STATEMENT","hint":"PAGES.MEDIATION.TYPE_OF_DOCUMENTS.DOCUMENTS_REFERRED_TO_IN_STATEMENT_HINT"}]}}},"ccdState":"AWAITING_APPLICANT_INTENTION","id":"1700479388428002725812a1-4e56-4411-9dd4-202f320b2955","lastModifiedDate":"2023-1
      res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_TYPE_OF_DOCUMENTS));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default mediationTypeOfDocumentsController;
