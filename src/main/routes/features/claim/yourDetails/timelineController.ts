import {NextFunction, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import {CLAIM_EVIDENCE_URL, CLAIM_TIMELINE_URL} from 'routes/urls';
import {ClaimantTimeline} from 'form/models/timeLineOfEvents/claimantTimeline';
import {GenericForm} from 'form/models/genericForm';
import {getDateInThePast} from 'common/utils/dateUtils';
import {getClaimDetails} from 'services/features/claim/details/claimDetailsService';
import {
  getTimeline,
  saveTimeline,
} from 'services/features/claim/yourDetails/timelineService';

const timelineController = Router();
const timelineViewPath = 'features/claim/yourDetails/timeline';

timelineController.get(CLAIM_TIMELINE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.user?.id;
    const form = new GenericForm(getTimeline(await getClaimDetails(userId)));
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
}) as RequestHandler);

timelineController.post(CLAIM_TIMELINE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const body = Object.assign(req.body);
    const form = new GenericForm(ClaimantTimeline.buildPopulatedForm(body.rows));
    form.validateSync();

    if (form.hasErrors()) {
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const dates = [
        getDateInThePast(lang, 90),
        getDateInThePast(lang, 88),
        getDateInThePast(lang, 60),
      ];
      res.render(timelineViewPath, {form, dates});
    } else {
      await saveTimeline(req.session?.user?.id, form.model);
      res.redirect(CLAIM_EVIDENCE_URL);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default timelineController;
