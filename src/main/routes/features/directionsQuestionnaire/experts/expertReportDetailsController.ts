import {RequestHandler, Response, Router} from 'express';
import {
  DQ_EXPERT_DETAILS_URL,
  DQ_EXPERT_GUIDANCE_URL,
  DQ_EXPERT_REPORT_DETAILS_URL,
  DQ_GIVE_EVIDENCE_YOURSELF_URL,
} from '../../../urls';
import {GenericForm} from 'form/models/genericForm';
import {
  ExpertReportDetails,
} from 'models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
import {
  getExpertReportDetails,
  getExpertReportDetailsForm,
} from 'services/features/directionsQuestionnaire/expertReportDetailsService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'form/models/yesNo';
import {
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'common/models/AppRequest';

const expertReportDetailsController = Router();
const dqPropertyName = 'expertReportDetails';
const dqParentName = 'experts';

const claimantViewPath = 'features/directionsQuestionnaire/experts/expert-report-details-claimant';
const defendantViewPath = 'features/directionsQuestionnaire/experts/expert-report-details';

function renderView(viewPath: string, form: GenericForm<ExpertReportDetails>, res: Response): void {
  res.render(viewPath, {form, today: new Date()});
}

expertReportDetailsController.get(DQ_EXPERT_REPORT_DETAILS_URL, (async (req, res, next) => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    const viewPath = claim.isClaimant() ? claimantViewPath : defendantViewPath;
    renderView(viewPath, new GenericForm(await getExpertReportDetails(generateRedisKey(<AppRequest>req))), res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

expertReportDetailsController.post(DQ_EXPERT_REPORT_DETAILS_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const reportDetails = req.body.option === YesNo.YES ? req.body.reportDetails : undefined;
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim = await getCaseDataFromStore(redisKey);
    let expertReportDetails = getExpertReportDetailsForm(claim.isClaimant(), req.body.option, reportDetails);
    const form = new GenericForm(expertReportDetails);
    form.validateSync();
    if (form.hasErrors()) {
      const viewPath = claim.isClaimant() ? claimantViewPath : defendantViewPath;
      renderView(viewPath, form, res);
    } else {
      expertReportDetails = ExpertReportDetails.removeEmptyReportDetails(expertReportDetails);
      await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), expertReportDetails, dqPropertyName, dqParentName);

      if (req.body.option === YesNo.YES) {
        if (claim.isClaimant()) {
          res.redirect(constructResponseUrlWithIdParams(claimId, DQ_EXPERT_DETAILS_URL));
        } else {
          res.redirect(constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL));
        }
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_EXPERT_GUIDANCE_URL));
      }
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default expertReportDetailsController;
