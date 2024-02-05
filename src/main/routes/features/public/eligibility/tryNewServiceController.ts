import {Response, Router} from 'express';
import {BASE_ELIGIBILITY_URL, ELIGIBILITY_CLAIM_VALUE_URL, CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL} from '../../../urls';
import {AppRequest} from 'common/models/AppRequest';

const tryNewServiceController = Router();

tryNewServiceController.get(BASE_ELIGIBILITY_URL, async (req: AppRequest, res: Response) => {
  const userId = req.session?.user?.id;
  if(req.cookies['eligibilityCompleted'] && userId) {
     res.redirect(CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL);
  } 
  else {
     res.render('features/public/eligibility/try-new-service', {urlNextView: ELIGIBILITY_CLAIM_VALUE_URL});
  }
});

export default tryNewServiceController;
