import {NextFunction, RequestHandler, Response, Router} from 'express';

import {
  GA_RESPOND_ADDITIONAL_INFO_URL,
} from 'routes/urls';
import {AppRequest} from 'models/AppRequest';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {getClaimById} from 'modules/utilityService';
import {
  getCancelUrl,
} from 'services/features/generalApplication/generalApplicationService';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {RespondAddInfo} from 'models/generalApplication/response/respondAddInfo';

const respondAddInfoController = Router();
const viewPath = 'features/generalApplication/additionalInfoUpload/additional-info';

respondAddInfoController.get(GA_RESPOND_ADDITIONAL_INFO_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const { appId, id: claimId } = req.params;
    const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPOND_ADDITIONAL_INFO_URL);
    const claimIdPrettified = caseNumberPrettify(claimId);
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPOND_ADDITIONAL_INFO_URL);
    const respondAddInfo = new RespondAddInfo();
    const form = new GenericForm(respondAddInfo);
    res.render(viewPath, { currentUrl, backLinkUrl, cancelUrl, claimIdPrettified, claim, form});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

respondAddInfoController.post(GA_RESPOND_ADDITIONAL_INFO_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const option = req.body.option;
    const text = req.body.additionalText;
    const { appId, id:claimId } = req.params;
    const currentUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPOND_ADDITIONAL_INFO_URL);
    const respondAddInfo = new RespondAddInfo(
      option,
      text,
    );
    const form = new GenericForm(respondAddInfo);
    await form.validate();
    if (form.hasErrors()) {
      const { appId, id: claimId } = req.params;
      const claimIdPrettified = caseNumberPrettify(claimId);
      const claim = await getClaimById(claimId, req, true);
      const cancelUrl = await getCancelUrl(claimId, claim);
      const backLinkUrl = constructResponseUrlWithIdAndAppIdParams(claimId, appId, GA_RESPOND_ADDITIONAL_INFO_URL);
      return await res.render(viewPath, { currentUrl, backLinkUrl, cancelUrl, claimIdPrettified, claim, form});
    }
    //await saveAcceptDefendantOffer(generateRedisKeyForGA(req), acceptDefendantOffer);
    res.redirect('test'); // TODO: add url
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default respondAddInfoController;