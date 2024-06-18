import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  FRC_BAND_AGREED_URL,
} from 'routes/urls';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericYesNo} from 'form/models/genericYesNo';
import {getWhatAreFixedRecoverableCostsContent} from 'services/commons/detailContents';

const frcBandAgreedController = Router();
const frcBandAgreedViewPath = 'features/directionsQuestionnaire/fixedRecoverableCosts/frc-band-agreed';
const FRC_BAND_AGREED_PAGE = 'PAGES.FRC_BAND_AGREED.';

function renderView(subjectToFRC: GenericForm<GenericYesNo>, claimId: string, res: Response): void {
  const form = subjectToFRC;
  const whatAreFixedRecoverableCostsContent = getWhatAreFixedRecoverableCostsContent();
  res.render(frcBandAgreedViewPath, {
    form,
    whatAreFixedRecoverableCostsContent,
    buttonTitle: `${FRC_BAND_AGREED_PAGE}BUTTON_TITLE`,
    pageTitle: `${FRC_BAND_AGREED_PAGE}PAGE_TITLE`,
    title: `${FRC_BAND_AGREED_PAGE}TITLE`,
    backLinkUrl: constructResponseUrlWithIdParams(claimId, 'todo'),
  });
}

frcBandAgreedController.get(FRC_BAND_AGREED_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const frcBandAgreed = directionQuestionnaire.fixedRecoverableCosts?.frcBandAgreed ?
      new GenericYesNo(directionQuestionnaire.fixedRecoverableCosts?.frcBandAgreed?.option) : new GenericYesNo();
    renderView(new GenericForm(frcBandAgreed), claimId , res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

frcBandAgreedController.post(FRC_BAND_AGREED_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const frcBandAgreedForm = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.FRC_BAND_AGREED'));
    frcBandAgreedForm.validateSync();
    if (frcBandAgreedForm.hasErrors()) {
      renderView(frcBandAgreedForm, claimId, res);
    } else {
      await saveDirectionQuestionnaire(
        generateRedisKey(<AppRequest>req),
        frcBandAgreedForm.model,
        'frcBandAgreed',
        'fixedRecoverableCosts');
      //TODO add the url.
      res.redirect(constructResponseUrlWithIdParams(claimId, 'todo'));
    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default frcBandAgreedController;
