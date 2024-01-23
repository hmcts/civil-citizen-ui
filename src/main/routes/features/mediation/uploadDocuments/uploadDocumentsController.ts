import {MEDIATION_UPLOAD_DOCUMENTS} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {NextFunction, RequestHandler, Response, Router} from 'express';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {
  addAnother,
  getUploadDocuments, getUploadDocumentsForm,
} from 'services/features/mediation/uploadDocuments/uploadDocumentsService';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {Claim} from 'models/claim';

import {getYourStatementContent} from 'services/features/mediation/uploadDocuments/yourStatementService';
import {UploadDocumentsForm} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {TypeOfMediationDocuments, UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {ClaimSummaryContent} from 'form/models/claimSummarySection';

const uploadDocumentViewPath = 'features/mediation/uploadDocuments/upload-documents';
const mediationUploadDocumentsController = Router();
//const TYPE_OF_DOCUMENTS_PROPERTY_NAME = 'uploadDocuments';
//const MEDIATION_UPLOAD_DOCUMENT_PAGE = 'PAGES.MEDIATION.UPLOAD_DOCUMENTS.';

const partyInformation = (claim: Claim) =>  {
  return {
    claimantName: claim.getClaimantFullName(),
    defendantName: claim.getDefendantFullName(),
  };
};
let yourStatementContent: ClaimSummaryContent[][] = [];
function renderView(form: GenericForm<UploadDocumentsForm>,uploadDocuments:UploadDocuments,res: Response, claimId: string, claim: Claim) {
  yourStatementContent = getYourStatementContent(uploadDocuments, form);
  res.render(uploadDocumentViewPath, {
    form: form,
    yourStatementContent: yourStatementContent,
    pageTitle: 'PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE',
    claimId: claimId,
    partyInformation: partyInformation(claim)});
}

mediationUploadDocumentsController.get(MEDIATION_UPLOAD_DOCUMENTS, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const uploadDocuments = getUploadDocuments(claim);
    renderView(null, uploadDocuments, res, claimId, claim);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

mediationUploadDocumentsController.post(MEDIATION_UPLOAD_DOCUMENTS, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const action = req.body.action;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const uploadDocuments = getUploadDocuments(claim);
    const uploadDocumentsForm = getUploadDocumentsForm(req);
    const form = new GenericForm(uploadDocumentsForm);
    console.log(action);
    if (action === 'add_another-yourStatement') {
      //add new object to the array
      //yourStatementContent.
      addAnother(uploadDocumentsForm,TypeOfMediationDocuments.YOUR_STATEMENT );
      return renderView(form, uploadDocuments, res, claimId, claim);
    }
    await form.validate();
    if (form.hasErrors()) {
      //renderView(form, res, claimId, claim);
    } else {
      //get upload documents from claim and map to type of documents
      //const uploadDocuments: UploadDocuments = getUploadDocuments(claim).mapUploadDocumentsFromTypeOfDocumentsForm(mapOfTypeOfDocumentsForm);
      //await saveUploadDocument(redisKey, uploadDocuments.typeOfDocuments, TYPE_OF_DOCUMENTS_PROPERTY_NAME);
      res.redirect(constructResponseUrlWithIdParams(claimId, MEDIATION_UPLOAD_DOCUMENTS));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default mediationUploadDocumentsController;
