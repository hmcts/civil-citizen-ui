import {NextFunction, RequestHandler, Response, Router} from 'express';
import {
  GA_COSC_CONFIRM_URL,
} from 'routes/urls';
import {t} from 'i18next';
import {getClaimById} from 'modules/utilityService';
import {
  getCoScGeneralApplicationConfirmationContent,
} from 'services/features/generalApplication/submitGeneralApplicationConfirmationContent';
import {AppRequest} from 'models/AppRequest';

const submitCoScApplicationConfirmationViewPath = 'features/generalApplication/submit-general-application-confirmation';
const submitCoScApplicationConfirmationController = Router();

submitCoScApplicationConfirmationController.get(GA_COSC_CONFIRM_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const lng = req.query.lang ? req.query.lang : req.cookies.lang;
    const applicationFee = Number(req.query.appFee);
    const claimId = req.params.id;
    const genAppId = req.query.id as string;
    const claim = await getClaimById(claimId, req, true);
    res.render(submitCoScApplicationConfirmationViewPath, {
      confirmationTitle : t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.TITLE', {lng}),
      confirmationContent: await getCoScGeneralApplicationConfirmationContent(claimId, genAppId, claim, lng,applicationFee),
    });
  }catch (error) {
    next(error);
  }
}) as RequestHandler);

export default submitCoScApplicationConfirmationController;
