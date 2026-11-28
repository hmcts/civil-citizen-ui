import {NextFunction, Response, Router} from 'express';
import {WhyDoYouDisagree} from 'common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CITIZEN_TIMELINE_URL, CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL} from 'routes/urls';
import {GenericForm} from 'common/form/models/genericForm';
import {ResponseType} from 'common/form/models/responseType';
import {
  getWhyDoYouDisagreeForm,
  saveWhyDoYouDisagreeData,
} from 'services/features/response/admission/whyDoYouDisagreeService';
import {AppRequest} from 'common/models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const whyDoYouDisagreeFullRejectionController = Router();
const whyDoYouDisagreeViewPath = 'features/response/admission/why-do-you-disagree';

function renderView(form: GenericForm<WhyDoYouDisagree>, claimAmount: number, res: Response) {
  res.render(whyDoYouDisagreeViewPath, {form, claimAmount});
}

whyDoYouDisagreeFullRejectionController.get(CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL, async (req, res, next: NextFunction) => {
  try {
    const form = await getWhyDoYouDisagreeForm(req as unknown as AppRequest, ResponseType.FULL_DEFENCE);
    renderView(new GenericForm(form.whyDoYouDisagree), form.claimAmount, res);
  } catch (error) {
    next(error);
  }
});

whyDoYouDisagreeFullRejectionController.post(CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL, async (req, res, next: NextFunction) => {
  try {
    const appReq = req as unknown as AppRequest;
    const form = new GenericForm(new WhyDoYouDisagree(req.body.text));
    await form.validate();
    if (form.hasErrors()) {
      // Read the claim amount from this user's draft. A module-level value is shared across users.
      const savedForm = await getWhyDoYouDisagreeForm(appReq, ResponseType.FULL_DEFENCE);
      renderView(form, savedForm.claimAmount, res);
    } else {
      await saveWhyDoYouDisagreeData(appReq, form.model, ResponseType.FULL_DEFENCE);
      const claimId = getRouteParam(req, 'id');
      res.redirect(constructResponseUrlWithIdParams(claimId, CITIZEN_TIMELINE_URL));
    }
  } catch (error) {
    next(error);
  }
},
);

export default whyDoYouDisagreeFullRejectionController;
