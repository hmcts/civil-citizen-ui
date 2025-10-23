import {RequestHandler, Response, Router} from 'express';
import {DQ_SENT_EXPERT_REPORTS_URL, DQ_SHARE_AN_EXPERT_URL} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {SentExpertReports} from 'models/directionsQuestionnaire/experts/sentExpertReports';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';

import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const sentExpertReportsController = Router();
const expertReportsViewPath = 'features/directionsQuestionnaire/experts/sent-expert-reports';
const dqPropertyName = 'sentExpertReports';
const dqParentName = 'experts';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('sentExpertReportsController');

function renderView(form: GenericForm<SentExpertReports>, res: Response): void {
  res.render(expertReportsViewPath, {form, pageTitle: 'PAGES.SENT_EXPERT_REPORTS.PAGE_TITLE'});
}

sentExpertReportsController.get(DQ_SENT_EXPERT_REPORTS_URL, (async (req, res, next) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const sentExpertReports = directionQuestionnaire.experts?.sentExpertReports ? directionQuestionnaire.experts.sentExpertReports : new SentExpertReports();
    renderView(new GenericForm(sentExpertReports), res);
  } catch (error) {
    logger.error(`Error when GET : sent export reports - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

sentExpertReportsController.post(DQ_SENT_EXPERT_REPORTS_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const form = new GenericForm(new SentExpertReports(req.body.sentExpertReportsOptions));
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), form.model, dqPropertyName, dqParentName);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_SHARE_AN_EXPERT_URL));
    }
  } catch (error) {
    logger.error(`Error when POST : sent export reports - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

export default sentExpertReportsController;
