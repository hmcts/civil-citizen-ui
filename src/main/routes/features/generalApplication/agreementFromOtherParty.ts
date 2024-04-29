import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GA_AGREEMENT_FROM_OTHER_PARTY} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {AppRequest} from 'common/models/AppRequest';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { generateRedisKey } from 'modules/draft-store/draftStoreService';
import { getClaimById } from 'modules/utilityService';
import { saveAgreementFromOtherParty} from 'services/features/generalApplication/generalApplicationService';
import { selectedApplicationType } from 'common/models/generalApplication/applicationType';

const agreementFromOtherParty = Router();
const viewPath = 'features/generalApplication/agreement-from-other-party';
const cancelUrl = 'test';
const backLinkUrl = 'test';

agreementFromOtherParty.get(GA_AGREEMENT_FROM_OTHER_PARTY, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {

     const redisKey = generateRedisKey(<AppRequest>req);
     const claim = await getClaimById(redisKey, req, true);
   
     const applicationType = selectedApplicationType[claim.generalApplication?.applicationType?.option];
     const form = new GenericForm(new GenericYesNo(claim.generalApplication?.agreementFromOtherParty));
   
     res.render(viewPath, {
       form,
       applicationType,
       cancelUrl,
       backLinkUrl
     });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

agreementFromOtherParty.post(GA_AGREEMENT_FROM_OTHER_PARTY, (async (req: AppRequest | Request, res: Response, next: NextFunction) => {
  try {

    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getClaimById(redisKey, req, true);
    const applicationType = claim.generalApplication?.applicationType?.option;
    const form = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.GENERAL_APPLICATION.APPLICATION_FROM_OTHER_PARTY_EMPTY_OPTION'));
   
    form.validateSync();
  
    if (form.hasErrors()) {
      res.render(viewPath, { form, applicationType,cancelUrl, backLinkUrl });
    } else {
      await saveAgreementFromOtherParty(redisKey, req.body.option);
      res.redirect('test');
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default agreementFromOtherParty;
