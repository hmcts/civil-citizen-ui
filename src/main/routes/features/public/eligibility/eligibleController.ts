import {Request, Response, Router} from 'express';
import {
  ELIGIBILITY_HWF_ELIGIBLE_URL,
  ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL,
  ELIGIBLE_FOR_THIS_SERVICE_URL, CLAIMANT_TASK_LIST_URL,
} from 'routes/urls';
import {getYouCanUseContent} from 'services/features/eligibility/eligibleService';
import {getLng} from 'common/utils/languageToggleUtils';
import {AppRequest} from 'models/AppRequest';

const eligibleController = Router();
const youCanUseViewPath = 'features/public/eligibility/eligible';

eligibleController.get([ELIGIBILITY_HWF_ELIGIBLE_URL, ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL, ELIGIBLE_FOR_THIS_SERVICE_URL], (req: Request, res: Response) => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  if(!req.cookies['eligibilityCompletedV2']){
    const cookie = true;
    res.cookie('eligibilityCompletedV2', cookie);
  }
  const youCanUseContent = getYouCanUseContent(req.url, getLng(lang));
  res.render(youCanUseViewPath, {youCanUseContent});
});

eligibleController.post([ELIGIBILITY_HWF_ELIGIBLE_URL, ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL, ELIGIBLE_FOR_THIS_SERVICE_URL], async (req: AppRequest, res: Response) => {

  res.redirect(CLAIMANT_TASK_LIST_URL);

});

export default eligibleController;
