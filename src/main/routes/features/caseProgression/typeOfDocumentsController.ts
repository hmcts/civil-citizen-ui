import {NextFunction, Request, Response, Router} from 'express';
import { TYPES_OF_DOCUMENTS_URL} from '../../urls';

import {AppRequest} from 'common/models/AppRequest';

import {GenericForm} from 'common/form/models/genericForm';
import {TypeOfDocuments} from 'form/models/caseProgression/typeOfDocuments';

const typeOfDocumentsViewPath = 'features/caseProgression/typeOfDocuments';
const typeOfDocumentsController = Router();

function renderView(res: Response, form: GenericForm<TypeOfDocuments>) {

  res.render(typeOfDocumentsViewPath, {
    form,
  });
}

typeOfDocumentsController.get(TYPES_OF_DOCUMENTS_URL,
  async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      /*const userId = req.session?.user?.id;
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const claim = await getCaseDataFromStore(userId);*/
      const form = new GenericForm(new TypeOfDocuments('s', 's'));
      renderView(res, form);
    } catch (error) {
      next(error);
    }
  });

typeOfDocumentsController.post(TYPES_OF_DOCUMENTS_URL, async (req: Request | AppRequest, res: Response, next: NextFunction) => {
  try {
    //const userId = (<AppRequest>req).session?.user?.id;
    //const isFullAmountRejected = (req.body?.isFullAmountRejected === 'true');
    //const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    //const form = new GenericForm((req.body.type === 'qualified')
    //  ? new QualifiedStatementOfTruth(isFullAmountRejected, req.body.signed, req.body.directionsQuestionnaireSigned, req.body.signerName, req.body.signerRole)
    //  : new StatementOfTruthForm(isFullAmountRejected, req.body.type, req.body.signed, req.body.directionsQuestionnaireSigned));
    //const claim = await getCaseDataFromStore(userId);
    /* await form.validate();
     if (form.hasErrors()) {
       renderView(res, form);
     } else {
       await saveStatementOfTruth(userId, form.model);
       const submittedClaim = await submitClaim(<AppRequest>req);
       await deleteDraftClaimFromStore(userId);
       if (claim.claimDetails.helpWithFees.option === YesNo.NO) {
         res.redirect(constructResponseUrlWithIdParams(userId, paymentUrl));
       } else {
         res.redirect(constructResponseUrlWithIdParams(submittedClaim.id, CLAIM_CONFIRMATION_URL));
       }*/
  } catch (error) {
    next(error);
  }
});

export default typeOfDocumentsController;
