import {NextFunction, RequestHandler, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import {CLAIM_EVIDENCE_URL, CLAIM_TIMELINE_URL} from 'routes/urls';
import {ClaimantTimeline} from 'form/models/timeLineOfEvents/claimantTimeline';
import {GenericForm} from 'form/models/genericForm';
import {getDateInThePast} from 'common/utils/dateUtils';
import {getClaimDetails, saveClaimDetails} from 'services/features/claim/details/claimDetailsService';
import {
  getTimeline,
} from 'services/features/claim/yourDetails/timelineService';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';

const timelineController = Router();
const timelineViewPath = 'features/claim/yourDetails/timeline';
const pageTitle= 'PAGES.TIMELINE.TITLE';
const timelineClaimDetailsProperty = 'timeline';

timelineController.get(CLAIM_TIMELINE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimDetails: ClaimDetails = await getClaimDetails(req);
    const timeline: ClaimantTimeline = getTimeline(claimDetails);
    const timelineForm = new GenericForm(timeline);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const dates = [
      getDateInThePast(lang, 90),
      getDateInThePast(lang, 88),
      getDateInThePast(lang, 60),
    ];
    res.render(timelineViewPath, {form: timelineForm, dates, pageTitle });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

timelineController.post(CLAIM_TIMELINE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const body = Object.assign(req.body);
    const timelineForm = new GenericForm(ClaimantTimeline.buildPopulatedForm(body.rows));
    timelineForm.validateSync();

    if (timelineForm.hasErrors()) {
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const dates = [
        getDateInThePast(lang, 90),
        getDateInThePast(lang, 88),
        getDateInThePast(lang, 60),
      ];
      res.render(timelineViewPath, {form: timelineForm, dates, pageTitle});
    } else {
      timelineForm.model.filterOutEmptyRows();
      await saveClaimDetails(req as AppRequest, timelineForm.model, timelineClaimDetailsProperty);
      res.redirect(CLAIM_EVIDENCE_URL);
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default timelineController;
