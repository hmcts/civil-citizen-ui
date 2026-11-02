import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  CITIZEN_EVIDENCE_URL,
  CITIZEN_TIMELINE_URL,
  CASE_TIMELINE_DOCUMENTS_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {
  getDefendantTimeline,
  saveDefendantTimeline,
} from 'services/features/response/timelineOfEvents/defendantTimelineService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {TimeLineOfEventDetails} from 'models/timelineOfEvents/timeLineOfEvents';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {getClaimTimeline} from 'services/features/common/claimTimelineService';
import {getLng} from 'common/utils/languageToggleUtils';

const defendantTimelineController = Router();
const defendantTimelineView = 'features/response/timelineOfEvents/defendant-timeline';

function renderView(form: GenericForm<DefendantTimeline>, theirTimeline: TimeLineOfEventDetails[], pdfUrl: string, res: Response) {
  res.render(defendantTimelineView, {
    form, theirTimeline, pdfUrl,
  });
}

defendantTimelineController.get(CITIZEN_TIMELINE_URL,
  (async (req, res, next: NextFunction) => {
    try {
      const claimId = getRouteParam(req, 'id');
      const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const theirTimeline = getClaimTimeline(claim, getLng(lang));
      const pdfUrl = claim.extractDocumentId() && CASE_TIMELINE_DOCUMENTS_URL.replace(':id', claimId).replace(':documentId', claim.extractDocumentId());
      const form = new GenericForm(getDefendantTimeline(claim));
      renderView(form, theirTimeline, pdfUrl, res);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

defendantTimelineController.post(CITIZEN_TIMELINE_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const form = new GenericForm(DefendantTimeline.buildPopulatedForm(req.body.rows, req.body.comment));
    const redisKey = generateRedisKey(<AppRequest>req);
    await form.validate();
    if (form.hasErrors()) {
      const claim = await getCaseDataFromStore(redisKey);
      const pdfUrl = claim.extractDocumentId() && CASE_TIMELINE_DOCUMENTS_URL.replace(':id', claimId).replace(':documentId', claim.extractDocumentId());
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      renderView(form, getClaimTimeline(claim, getLng(lang)), pdfUrl, res);
    } else {
      await saveDefendantTimeline(redisKey, form.model);
      res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_EVIDENCE_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default defendantTimelineController;
