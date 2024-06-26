import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  BACK_URL, DQ_DISCLOSURE_OF_DOCUMENTS_URL,
  REASON_FOR_FRC_BAND_URL,
} from 'routes/urls';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  getWhichComplexityBandToChooseContent,
} from 'services/commons/detailContents';
import {ComplexityBandOptions} from 'models/directionsQuestionnaire/fixedRecoverableCosts/complexityBandOptions';
import {ReasonForComplexityBand} from 'models/directionsQuestionnaire/fixedRecoverableCosts/reasonForComplexityBand';

const reasonForComplexityBandController = Router();
const reasonForComplexityBandViewPath = 'features/directionsQuestionnaire/fixedRecoverableCosts/reason-for-complexity-band';
const COMPLEXITY_BAND_REASON_PAGE = 'PAGES.COMPLEXITY_BAND_REASON.';

function renderView(complexityBand: GenericForm<ReasonForComplexityBand>, lang: string, res: Response): void {
  const form = complexityBand;
  const whichComplexityBandToChooseContent = getWhichComplexityBandToChooseContent(lang);

  res.render(reasonForComplexityBandViewPath, {
    form,
    whichComplexityBandToChooseContent,
    complexityBandOptions: ComplexityBandOptions,
    pageTitle: `${COMPLEXITY_BAND_REASON_PAGE}PAGE_TITLE`,
    title: `${COMPLEXITY_BAND_REASON_PAGE}TITLE`,
    backLinkUrl: BACK_URL,
  });
}

reasonForComplexityBandController.get(REASON_FOR_FRC_BAND_URL, (async (req, res, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const form = directionQuestionnaire.fixedRecoverableCosts?.reasonsForBandSelection ?
      new ReasonForComplexityBand(directionQuestionnaire.fixedRecoverableCosts.reasonsForBandSelection) : new ReasonForComplexityBand();
    renderView(new GenericForm(form), lang , res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

reasonForComplexityBandController.post(REASON_FOR_FRC_BAND_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    await saveDirectionQuestionnaire(
      generateRedisKey(<AppRequest>req),
      req.body.reasonsForBandSelection,
      'reasonsForBandSelection',
      'fixedRecoverableCosts');
    res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DISCLOSURE_OF_DOCUMENTS_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default reasonForComplexityBandController;
