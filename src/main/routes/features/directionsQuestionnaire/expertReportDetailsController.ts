import * as express from 'express';
import {DQ_EXPERT_REPORT_DETAILS_URL, DQ_CONSIDER_CLAIMANT_DOCUMENTS} from '../../urls';
import {GenericForm} from '../../../common/form/models/genericForm';
import {ExpertReportDetails} from '../../../common/models/directionsQuestionnaire/expertReportDetails/expertReportDetails';
import {
  getExpertReportDetails,
  getExpertReportDetailsForm,
  saveExpertReportDetails,
} from '../../../services/features/directionsQuestionnaire/expertReportDetailsService';
import {constructResponseUrlWithIdParams} from '../../../common/utils/urlFormatter';

const expertReportDetailsController = express.Router();

function renderView(form: GenericForm<ExpertReportDetails>, res: express.Response): void {
  const expertReportDetailsForm = Object.assign(form);
  expertReportDetailsForm.option = form.model.hasExpertReports;
  console.log('get--', expertReportDetailsForm);
  console.log('get--', expertReportDetailsForm.model.reportDetails);
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
    console.log('body-->', req.body)
    console.log('model-->', req.body.reportDetails)
    const expertReportDetails = getExpertReportDetailsForm(req.body.hasExportReports, req.body.reportDetails);
    const form = new GenericForm(expertReportDetails);
    form.validateSync();

    if (form.hasErrors()) {
      renderView(form, res);
    } else {
      await saveExpertReportDetails(claimId, expertReportDetails);
      res.redirect(constructResponseUrlWithIdParams(claimId, DQ_CONSIDER_CLAIMANT_DOCUMENTS));
    }
  } catch (error) {
    next(error);
  }
});

export default expertReportDetailsController;
