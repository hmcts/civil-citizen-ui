import * as express from 'express';
import {
  ELIGIBILITY_HWF_ELIGIBLE,
  ELIGIBILITY_HWF_ELIGIBLE_REFERENCE,
  ELIGIBLE_FOR_THIS_SERVICE_URL,
} from '../../../../routes/urls';
import {getYouCanUseContent} from '../../../../services/features/response/eligibility/youCanUseService';
import {getLng} from 'common/utils/languageToggleUtils';

const eligibleController = express.Router();
const youCanUseViewPath = 'features/public/eligibility/eligible';

eligibleController.get([ELIGIBILITY_HWF_ELIGIBLE,ELIGIBILITY_HWF_ELIGIBLE_REFERENCE,ELIGIBLE_FOR_THIS_SERVICE_URL], (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const youCanUseContent = getYouCanUseContent(req.url, getLng(lang));
  try {
    res.render(youCanUseViewPath, { youCanUseContent });
  } catch (error) {
    next(error);
  }
});

export default eligibleController;
