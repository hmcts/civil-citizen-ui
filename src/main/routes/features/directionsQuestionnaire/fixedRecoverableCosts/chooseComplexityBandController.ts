import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  ASSIGN_FRC_BAND_URL,
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
import {ComplexityBand} from 'models/directionsQuestionnaire/fixedRecoverableCosts/complexityBand';

const choseComplexityBandController = Router();
const chooseComplexityBandViewPath = 'features/directionsQuestionnaire/fixedRecoverableCosts/choose-complexity-band';
const CHOOSE_COMPLEXITY_BAND_PAGE = 'PAGES.CHOOSE_COMPLEXITY_BAND.';

function renderView(complexityBand: GenericForm<ComplexityBand>, lang: string, res: Response): void {
  const form = complexityBand;
  const whichComplexityBandToChooseContent = getWhichComplexityBandToChooseContent(lang);

  res.render(chooseComplexityBandViewPath, {
    form,
    whichComplexityBandToChooseContent,
    complexityBandOptions: ComplexityBandOptions,
    pageTitle: `${CHOOSE_COMPLEXITY_BAND_PAGE}PAGE_TITLE`,
    title: `${CHOOSE_COMPLEXITY_BAND_PAGE}TITLE`,
    //TODO ADD THE BACK URL
    backLinkUrl: constructResponseUrlWithIdParams('claimId', 'todo'),
  });
}

choseComplexityBandController.get(ASSIGN_FRC_BAND_URL, (async (req, res, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const complexityBandForm = directionQuestionnaire.fixedRecoverableCosts?.complexityBand ?
      new ComplexityBand(directionQuestionnaire.fixedRecoverableCosts.complexityBand) : new ComplexityBand();
    renderView(new GenericForm(complexityBandForm), lang , res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

choseComplexityBandController.post(ASSIGN_FRC_BAND_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const chosenBandForm = new GenericForm(new ComplexityBand(req.body.complexityBand));
    chosenBandForm.validateSync();
    if (chosenBandForm.hasErrors()) {
      renderView(chosenBandForm, lang, res);
    } else {
      await saveDirectionQuestionnaire(
        generateRedisKey(<AppRequest>req),
        chosenBandForm.model.complexityBand,
        'complexityBand',
        'fixedRecoverableCosts');
      //TODO REDIRECTION URL
      res.redirect(constructResponseUrlWithIdParams(claimId, 'todo'));
    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default choseComplexityBandController;
