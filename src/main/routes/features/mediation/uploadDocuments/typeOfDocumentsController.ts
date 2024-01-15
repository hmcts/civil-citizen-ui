import {NextFunction, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'common/models/AppRequest';

import {MEDIATION_TYPE_OF_DOCUMENTS, MEDIATION_UPLOAD_DOCUMENTS} from 'routes/urls';

import {GenericForm} from 'form/models/genericForm';
import {Claim} from 'models/claim';

import {
  TypeOfMediationDocuments, UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {
  getUploadDocuments,
  saveUploadDocument,
} from 'services/features/mediation/uploadDocuments/uploadDocumentsService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {convertToArrayOfStrings} from 'common/utils/stringUtils';
import {TypeOfDocumentsForm} from 'form/models/mediation/uploadDocuments/typeOfDocumentsForm';
import {TypeOfDocumentsItemForm} from 'form/models/mediation/uploadDocuments/typeOfDocumentsItemForm';

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

function renderView(form: GenericForm<TypeOfDocumentsForm>, res: Response, claimId: string, claim: Claim) {
  res.render(typeOfDocumentsViewPath, {
    form: form,
    pageTitle: 'PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE',
    claimId: claimId,
    partyInformation: partyInformation(claim)});
}

mediationTypeOfDocumentsController.get(MEDIATION_TYPE_OF_DOCUMENTS, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const uploadDocuments = getUploadDocuments(claim);
    const form = new GenericForm(typeOfDocumentsForm.mapTypeOfDocumentsFormFromUploadDocuments(uploadDocuments));
    renderView(form, res, claimId, claim);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

mediationTypeOfDocumentsController.post(MEDIATION_TYPE_OF_DOCUMENTS, (async (req, res, next) => {
  try {
    const action = req.body.action;
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const mapOfTypeOfDocumentsForm =  typeOfDocumentsForm.mapTypeOfDocumentsFormFromStrings(convertToArrayOfStrings(req.body.typeOfDocuments));
    const form = new GenericForm(mapOfTypeOfDocumentsForm);
    if (action === 'add_another') {
    //add new object to the array
      typeOfDocumentsForm.typeOfDocuments.push(new TypeOfDocumentsItemForm(5,TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT.toString(),`${MEDIATION_TYPE_OF_DOCUMENTS_PAGE}${TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT}`, false, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, 'new'));
      return renderView(form, res, claimId, claim);
    }
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

export default mediationTypeOfDocumentsController;
