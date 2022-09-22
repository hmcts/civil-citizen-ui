import * as express from 'express';
import {DQ_EXPERT_REPORT_DETAILS_URL, DQ_GIVE_EVIDENCE_YOURSELF_URL, DQ_EXPERT_GUIDANCE_URL} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {ExpertReportDetails} from '../../../common/models/directionsQuestionnaire/expertReportDetails/expertReportDetails';
import {
  getExpertReportDetails,
  getExpertReportDetailsForm,
  saveExpertReportDetails,
} from '../../../services/features/directionsQuestionnaire/expertReportDetailsService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';
import {YesNo} from '../../../common/form/models/yesNo';

const expertReportDetailsController = express.Router();

function renderView(form: GenericForm<ExpertReportDetails>, res: express.Response): void {
  const expertReportDetailsForm = Object.assign(form);
  expertReportDetailsForm.option = form.model.hasExpertReports;
  res.render('features/directionsQuestionnaire/expert-report-details', {form: expertReportDetailsForm});
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
    const expertReportDetails = getExpertReportDetailsForm(req.body.hasExpertReports, req.body.reportDetails);
    const form = new GenericForm(expertReportDetails);
    form.validateSync();
    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveExpertReportDetails(claimId, expertReportDetails);
      if (req.body.hasExpertReports === YesNo.YES) {
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
