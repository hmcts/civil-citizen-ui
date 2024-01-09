import {NextFunction, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'common/models/AppRequest';

import {MEDIATION_TYPE_OF_DOCUMENTS} from 'routes/urls';
import {
  TypeOfDocuments,
  TypeOfDocumentsItem,
  TypeOfMediationDocuments,
} from 'models/mediation/uploadFiles/typeOfDocuments';
import {GenericForm} from "form/models/genericForm";
import {Claim} from "models/claim";

const typeOfDocumentsViewPath = 'features/mediation/uploadDocuments/typeOfDocuments';
const mediationTypeOfDocumentsController = Router();
//const dqPropertyName = 'defendantUploadDocuments';
//const dqPropertyNameClaimant = 'claimantUploadDocuments';

async function renderView(res: Response, claimId: string, claim: Claim) {

  const partyInformation = (claim: Claim) =>  {
    return {
      claimantName: 'leo',//claim.getClaimantFullName(),
      defendantName: 'leo1'//claim.getDefendantFullName()
    };
  };
  const item =  TypeOfDocuments.builder('PAGES.MEDIATION.TYPE_OF_DOCUMENTS.CHECKBOX_TITLE')
    .addItems(new TypeOfDocumentsItem('test','test', false,TypeOfMediationDocuments.YOUR_STATEMENT))
    .addItems(new TypeOfDocumentsItem('test','test', false,TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT))
    .build();
  const form = new GenericForm(item);
  res.render(typeOfDocumentsViewPath, {form: form, pageTitle: 'PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE', partyInformation: partyInformation(claim)});
}

mediationTypeOfDocumentsController.get(MEDIATION_TYPE_OF_DOCUMENTS, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {

    await renderView(res, 'claimId', new Claim());
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
