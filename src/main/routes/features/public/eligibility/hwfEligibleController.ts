import * as express from 'express';
import {ELIGIBILITY_HWF_ELIGIBLE} from '../../../../routes/urls';
import {getYouCanUseContent} from '../../../../services/features/response/eligibility/youCanUseService';
import {YouCanUseReason} from 'common/form/models/eligibility/YouCanUseReason';
import {getLng} from 'common/utils/languageToggleUtils';

const hwfEligibleController = express.Router();
const youCanUseViewPath = 'features/public/eligibility/you-can-use';

hwfEligibleController.get(ELIGIBILITY_HWF_ELIGIBLE, (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const lang = req.query.lang ? req.query.lang : req.cookies.lang;
  const youCanUseContent = getYouCanUseContent(YouCanUseReason.HWF_ELIGIBLE, getLng(lang));
  try {
    res.render(youCanUseViewPath, { youCanUseContent });
  } catch (error) {
    next(error);
  }
});

export default hwfEligibleController;
