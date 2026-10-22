import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  GA_COSC_CONFIRM_URL,
} from 'routes/urls';
import {t} from 'i18next';
import {getClaimById} from 'modules/utilityService';
import {
  getCoScGeneralApplicationConfirmationContent, getConfirmationParameters,
} from 'services/features/generalApplication/submitGeneralApplicationConfirmationContent';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {getDashboardUrlForParty} from 'services/features/generalApplication/generalApplicationService';

const submitCoScApplicationConfirmationViewPath = 'features/generalApplication/submit-general-application-confirmation';
const submitCoScApplicationConfirmationController = Router();

submitCoScApplicationConfirmationController.get(GA_COSC_CONFIRM_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const parameters = getConfirmationParameters(req.query);
    const claimId = getRouteParam(req, 'id');
    const claim = await getClaimById(claimId, req, true);
    if (!parameters) {
      return res.redirect(getDashboardUrlForParty(claimId, claim));
    }
    const {genAppId, applicationFee} = parameters;
    res.render(submitCoScApplicationConfirmationViewPath, {
      confirmationTitle : t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.TITLE', {lng}),
      confirmationContent: await getCoScGeneralApplicationConfirmationContent(claimId, genAppId, claim, lng,applicationFee),
    });
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default submitCoScApplicationConfirmationController;
