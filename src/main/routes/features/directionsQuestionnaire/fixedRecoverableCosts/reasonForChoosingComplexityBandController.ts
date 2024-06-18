import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
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
import {ReasonForComplexityBand} from "models/directionsQuestionnaire/fixedRecoverableCosts/reasonForComplexityBand";

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
    //TODO ADD THE BACK URL
    backLinkUrl: constructResponseUrlWithIdParams('claimId', 'todo'),
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
    const chosenBandForm = new GenericForm(new ReasonForComplexityBand(req.body.reasonsForBandSelection));
    await saveDirectionQuestionnaire(
      generateRedisKey(<AppRequest>req),
      chosenBandForm.model.reasonsForBandSelection,
      'reasonsForBandSelection',
      'fixedRecoverableCosts');
    //TODO REDIRECTION URL
    res.redirect(constructResponseUrlWithIdParams(claimId, 'todo'));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default reasonForComplexityBandController;
