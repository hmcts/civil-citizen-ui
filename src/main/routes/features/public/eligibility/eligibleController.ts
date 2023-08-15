import {Request, Response, Router} from 'express';
import {
  ELIGIBILITY_HWF_ELIGIBLE_URL,
  ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL,
  ELIGIBLE_FOR_THIS_SERVICE_URL,
  CLAIMANT_TASK_LIST_URL,
} from 'routes/urls';
import {getYouCanUseContent} from 'services/features/eligibility/eligibleService';
import {getLng} from 'common/utils/languageToggleUtils';

const eligibleController = Router();
const youCanUseViewPath = 'features/public/eligibility/eligible';

eligibleController.get([ELIGIBILITY_HWF_ELIGIBLE_URL, ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL, ELIGIBLE_FOR_THIS_SERVICE_URL], (req: Request, res: Response) => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const MILLISECONDS_IN_1_HOUR = 3600000;
  if(!req.cookies['eligibilityCompleted']){
    res.cookie('eligibilityCompleted', true, {maxAge: MILLISECONDS_IN_1_HOUR, httpOnly: true });
  }
  const youCanUseContent = getYouCanUseContent(req.url, getLng(lang));
  const claimTaskListUrl = CLAIMANT_TASK_LIST_URL;
  res.render(youCanUseViewPath, {youCanUseContent, claimTaskListUrl});
});

export default eligibleController;
