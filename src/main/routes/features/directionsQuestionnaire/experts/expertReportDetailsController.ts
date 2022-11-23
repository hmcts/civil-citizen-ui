import {Response, Router} from 'express';
import {DQ_EXPERT_GUIDANCE_URL, DQ_EXPERT_REPORT_DETAILS_URL, DQ_GIVE_EVIDENCE_YOURSELF_URL} from '../../../urls';
import {GenericForm} from 'common/form/models/genericForm';
import {
  ExpertReportDetails,
} from 'common/models/directionsQuestionnaire/experts/expertReportDetails/expertReportDetails';
import {
  getExpertReportDetails,
  getExpertReportDetailsForm,
} from '../../../../services/features/directionsQuestionnaire/expertReportDetailsService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {YesNo} from 'common/form/models/yesNo';
import {
  saveDirectionQuestionnaire,
} from '../../../../services/features/directionsQuestionnaire/directionQuestionnaireService';

const expertReportDetailsController = Router();
const dqPropertyName = 'expertReportDetails';
const dqParentName = 'experts';

function renderView(form: GenericForm<ExpertReportDetails>, res: Response): void {
  res.render('features/directionsQuestionnaire/experts/expert-report-details', {form, today: new Date()});
}

expertReportDetailsController.get(DQ_EXPERT_REPORT_DETAILS_URL, async (req, res, next) => {
  try {
    renderView(new GenericForm(await getExpertReportDetails(req.params.id)), res);
  } catch (error) {
    next(error);
  }
});

expertReportDetailsController.post(DQ_EXPERT_REPORT_DETAILS_URL, async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const reportDetails = req.body.option === YesNo.YES ? req.body.reportDetails : undefined;
    let expertReportDetails = getExpertReportDetailsForm(req.body.option, reportDetails);
    const form = new GenericForm(expertReportDetails);
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      expertReportDetails = ExpertReportDetails.removeEmptyReportDetails(expertReportDetails);
      await saveDirectionQuestionnaire(claimId, expertReportDetails, dqPropertyName, dqParentName);

      if (req.body.option === YesNo.YES) {
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_GIVE_EVIDENCE_YOURSELF_URL));
      } else {
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_EXPERT_GUIDANCE_URL));
      }
    }
  } catch (error) {
    next(error);
  }
});

export default expertReportDetailsController;
