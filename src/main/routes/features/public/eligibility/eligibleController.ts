import * as express from 'express';
import {
  ELIGIBILITY_HWF_ELIGIBLE_URL,
  ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL,
  ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../routes/urls';
import {getYouCanUseContent} from '../../../../services/features/eligibility/eligibleService';
import {getLng} from '../../../../common/utils/languageToggleUtils';

const eligibleController = express.Router();
const youCanUseViewPath = 'features/public/eligibility/eligible';

eligibleController.get([ELIGIBILITY_HWF_ELIGIBLE_URL,ELIGIBILITY_HWF_ELIGIBLE_REFERENCE_URL,ELIGIBLE_FOR_THIS_SERVICE_URL], (req: express.Request, res: express.Response) => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const youCanUseContent = getYouCanUseContent(req.url, getLng(lang));
  res.render(youCanUseViewPath, { youCanUseContent });
});

export default eligibleController;
