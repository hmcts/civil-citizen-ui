import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  BACK_URL, FRC_BAND_AGREED_URL,
  SUBJECT_TO_FRC_URL, WHY_NOT_SUBJECT_TO_FRC_URL,
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
import {YesNo} from 'form/models/yesNo';

const subjectToFRCController = Router();
const subjectToFRCViewPath = 'features/directionsQuestionnaire/fixedRecoverableCosts/subject-to-frc';
const SUBJECT_TO_FRC_PAGE = 'PAGES.SUBJECT_TO_FRC.';

function renderView(subjectToFRC: GenericForm<GenericYesNo>, claimId: string, res: Response, lang: string): void {
  const form = subjectToFRC;
  const whatAreFixedRecoverableCostsContent = getWhatAreFixedRecoverableCostsContent(lang);
  res.render(subjectToFRCViewPath, {
    form,
    whatAreFixedRecoverableCostsContent,
    buttonTitle: `${SUBJECT_TO_FRC_PAGE}BUTTON_TITLE`,
    pageTitle: `${SUBJECT_TO_FRC_PAGE}PAGE_TITLE`,
    title: `${SUBJECT_TO_FRC_PAGE}TITLE`,
    backLinkUrl: BACK_URL,
  });
}

subjectToFRCController.get(SUBJECT_TO_FRC_URL, (async (req, res, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const subjectToFRC = directionQuestionnaire.fixedRecoverableCosts?.subjectToFrc ?
      new GenericYesNo(directionQuestionnaire.fixedRecoverableCosts?.subjectToFrc?.option) : new GenericYesNo();
    renderView(new GenericForm(subjectToFRC), claimId , res, lang);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

subjectToFRCController.post(SUBJECT_TO_FRC_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const claimId = req.params.id;
    const subjectToFRCForm = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.SUBJECT_TO_FRC'));
    subjectToFRCForm.validateSync();
    if (subjectToFRCForm.hasErrors()) {
      renderView(subjectToFRCForm, claimId, res, lang);
    } else {
      await saveDirectionQuestionnaire(
        generateRedisKey(<AppRequest>req),
        subjectToFRCForm.model,
        'subjectToFrc',
        'fixedRecoverableCosts');
      const redirectUrl = req.body.option === YesNo.YES ? FRC_BAND_AGREED_URL : WHY_NOT_SUBJECT_TO_FRC_URL;
      res.redirect(constructResponseUrlWithIdParams(claimId, redirectUrl));
    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default subjectToFRCController;
