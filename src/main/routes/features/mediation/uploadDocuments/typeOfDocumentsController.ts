import {NextFunction, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'common/models/AppRequest';

import {MEDIATION_TYPE_OF_DOCUMENTS} from 'routes/urls';
import {
  TypeOfDocuments,
  TypeOfDocumentsItem,
  TypeOfMediationDocuments,
} from 'models/mediation/uploadFiles/typeOfDocuments';
import {GenericForm} from "form/models/genericForm";

const typeOfDocumentsViewPath = 'features/mediation/uploadDocuments/typeOfDocuments';
const mediationTypeOfDocumentsController = Router();
//const dqPropertyName = 'defendantUploadDocuments';
//const dqPropertyNameClaimant = 'claimantUploadDocuments';

async function renderView(res: Response, claimId: string) {
  const item =  TypeOfDocuments.builder('PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE')
    .addItems(new TypeOfDocumentsItem('test','test', false,TypeOfMediationDocuments.YOUR_STATEMENT))
    .addItems(new TypeOfDocumentsItem('test','test', false,TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT))
    .build();
  const form = new GenericForm(item);
  res.render(typeOfDocumentsViewPath, {form: form, pageTitle: 'PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE'});
}

mediationTypeOfDocumentsController.get(MEDIATION_TYPE_OF_DOCUMENTS, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {

    await renderView(res, 'claimId');
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

mediationTypeOfDocumentsController.post(MEDIATION_TYPE_OF_DOCUMENTS, (async (req, res, next) => {
  try {
    //const claimId = req.params.id;


/*    form.validateSync();
    if (form.hasErrors()) {
      await renderView(res, claimId, form);
    } else {
      res.redirect(constructResponseUrlWithIdParams(claimId, CP_UPLOAD_DOCUMENTS_URL));
    }*/
  } catch (error) {
    next(error);
  }
}) as RequestHandler);
export default mediationTypeOfDocumentsController;
