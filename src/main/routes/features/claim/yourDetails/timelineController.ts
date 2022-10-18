import {NextFunction, Response, Router} from 'express';
import {AppRequest} from '../../../../common/models/AppRequest';
import {CLAIM_EVIDENCE_URL, CLAIM_TIMELINE_URL} from '../../../../routes/urls';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {getClaimantInformation} from '../../../../services/features/claim/yourDetails/claimantDetailsService';
import {DefendantTimeline} from 'common/form/models/timeLineOfEvents/defendantTimeline';
import {
  getTimeline,
  validateTimeline,
} from '../../../../services/features/claim/yourDetails/timelineService';
import {getDateInThePast} from '../../../../common/utils/dateUtils';

const timelineController = Router();
const timelineViewPath = 'features/claim/yourDetails/timeline';

timelineController.get(CLAIM_TIMELINE_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const form = new GenericForm(getTimeline(await getClaimantInformation(userId)));
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const dates = [
      getDateInThePast(lang, 90),
      getDateInThePast(lang, 88),
      getDateInThePast(lang, 60),
    ];
    res.render(timelineViewPath, {form, dates});
  } catch (error) {
    next(error);
  }
});

timelineController.post(CLAIM_TIMELINE_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const body = Object.assign(req.body);
    const form = validateTimeline(DefendantTimeline.buildPopulatedForm(body.rows));

    if (form.hasErrors()) {
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const dates = [
        getDateInThePast(lang, 90),
        getDateInThePast(lang, 88),
        getDateInThePast(lang, 60),
      ];
      res.render(timelineViewPath, {form, dates});
    } else {
      //save
      res.redirect(CLAIM_EVIDENCE_URL);
    }
  } catch (error) {
    next(error);
  }
});

export default timelineController;
