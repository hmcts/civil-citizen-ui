import {NextFunction, RequestHandler, Response, Router} from 'express';
import {EXIT_BREATHING_SPACE_CHECK_ANSWERS_URL, EXIT_BREATHING_SPACE_CONFIRMATION_URL, EXIT_BREATHING_SPACE_URL} from '../../urls';
import {getClaimById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {t} from 'i18next';
import {formatDateToFullDate} from 'common/utils/dateUtils';
import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {summaryRow} from 'models/summaryList/summaryList';

const checkAnswersController = Router();
const viewPath = 'features/breathingSpace/check-your-answers';

checkAnswersController.get(EXIT_BREATHING_SPACE_CHECK_ANSWERS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claim = await getClaimById(claimId, req);
    const draftClaim = await getCaseDataFromStore(claimId);

    const liftInfo = draftClaim.breathingSpace?.lift;
    const bsType = claim.breathingSpace?.enter?.type;

    const sections: SummarySection[] = [
      summarySection({
        title: t('PAGES.CHECK_YOUR_ANSWERS.TITLE', {lng: lang}),
        summaryRows: [
          summaryRow(
            t('PAGES.EXIT_BREATHING_SPACE.END_DATE_LEGEND', {lng: lang}),
            formatDateToFullDate(new Date(liftInfo?.expectedEnd), lang),
            constructResponseUrlWithIdParams(claimId, EXIT_BREATHING_SPACE_URL),
            t('COMMON.BUTTONS.CHANGE', {lng: lang}),
          ),
          summaryRow(
            t('PAGES.EXIT_BREATHING_SPACE.WHY_LIFTED', {lng: lang}),
            liftInfo?.liftReason || '',
            constructResponseUrlWithIdParams(claimId, EXIT_BREATHING_SPACE_URL),
            t('COMMON.BUTTONS.CHANGE', {lng: lang}),
          ),
        ],
      }),
    ];

    res.render(viewPath, {
      sections,
      claimId,
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

checkAnswersController.post(EXIT_BREATHING_SPACE_CHECK_ANSWERS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = getRouteParam(req, 'id');
    // Here we would normally trigger the actual submission to the backend (civil-service)
    // For now, we redirect to confirmation
    res.redirect(constructResponseUrlWithIdParams(claimId, EXIT_BREATHING_SPACE_CONFIRMATION_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default checkAnswersController;
