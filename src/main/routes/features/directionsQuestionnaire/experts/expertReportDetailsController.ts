import {RequestHandler, Response, Router} from 'express';
import {
  DQ_EXPERT_DETAILS_URL,
  DQ_EXPERT_GUIDANCE_URL,
  DQ_EXPERT_REPORT_DETAILS_URL,
} from 'routes/urls';
import {GenericForm} from 'form/models/genericForm';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';
import {GenericYesNo} from 'form/models/genericYesNo';

const expertReportDetailsController = Router();
const dqPropertyName = 'expertReportDetails';
const dqParentName = 'experts';

const viewPath = 'features/directionsQuestionnaire/experts/expert-report-details';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('expertReportDetailsController');

function renderView(form: GenericForm<GenericYesNo>, res: Response): void {
  res.render(viewPath, {form, today: new Date(), pageTitle: 'PAGES.EXPERT_REPORT_DETAILS.PAGE_TITLE'});
}

expertReportDetailsController.get(DQ_EXPERT_REPORT_DETAILS_URL, (async (req, res, next) => {
  try {
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const expertReportDetails = directionQuestionnaire.experts?.expertReportDetails ?
      new GenericYesNo(directionQuestionnaire.experts?.expertReportDetails?.option) : new GenericYesNo();
    renderView(new GenericForm(expertReportDetails), res);
  } catch (error) {
    logger.error(`Error when GET : expert report details - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

expertReportDetailsController.post(DQ_EXPERT_REPORT_DETAILS_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const claim = await getCaseDataFromStore(generateRedisKey(<AppRequest>req));
    const errorKey = claim.isClaimantIntentionPending()
      ? 'ERRORS.EXPERT_REPORT_DETAILS_REQUIRED_CLAIMANT'
      : 'ERRORS.EXPERT_REPORT_DETAILS_REQUIRED';
    const expertReportForm = new GenericForm(new GenericYesNo(req.body.option, errorKey));
    expertReportForm.validateSync();
    if (expertReportForm.hasErrors()) {
      renderView(expertReportForm, res);
    } else {
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req),
        expertReportForm.model, dqPropertyName, dqParentName);
      const redirectUrl = req.body.option === YesNo.YES ? DQ_EXPERT_DETAILS_URL : DQ_EXPERT_GUIDANCE_URL;
      res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
    }
  } catch (error) {
    logger.error(`Error when POST : expert report details - ${error.message}`);
    next(error);
  }
}) as RequestHandler);

export default expertReportDetailsController;
