import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  SUBJECT_TO_FRC_URL,
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

const subjectToFRCController = Router();
const subjectToFRCViewPath = 'features/directionsQuestionnaire/fixedRecoverableCosts/subject-to-frc';
const SUBJECT_TO_FRC_PAGE = 'PAGES.SUBJECT_TO_FRC.';

function renderView(subjectToFRC: GenericForm<GenericYesNo>, claimId: string, res: Response): void {
  const form = subjectToFRC;
  const whatAreFixedRecoverableCostsContent = getWhatAreFixedRecoverableCostsContent();
  res.render(subjectToFRCViewPath, {
    form,
    whatAreFixedRecoverableCostsContent,
    buttonTitle: `${SUBJECT_TO_FRC_PAGE}BUTTON_TITLE`,
    pageTitle: `${SUBJECT_TO_FRC_PAGE}PAGE_TITLE`,
    title: `${SUBJECT_TO_FRC_PAGE}TITLE`,
    backLinkUrl: constructResponseUrlWithIdParams(claimId, 'todo'),
  });
}

subjectToFRCController.get(SUBJECT_TO_FRC_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const subjectToFRC = directionQuestionnaire.fixedRecoverableCosts?.subjectToFrc ?
      new GenericYesNo(directionQuestionnaire.fixedRecoverableCosts?.subjectToFrc?.option) : new GenericYesNo();
    renderView(new GenericForm(subjectToFRC), claimId , res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

subjectToFRCController.post(SUBJECT_TO_FRC_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const subjectToFRCForm = new GenericForm(new GenericYesNo(req.body.option, 'ERRORS.SUBJECT_TO_FRC'));
    subjectToFRCForm.validateSync();
    if (subjectToFRCForm.hasErrors()) {
      renderView(subjectToFRCForm, claimId, res);
    } else {
      await saveDirectionQuestionnaire(
        generateRedisKey(<AppRequest>req),
        subjectToFRCForm.model,
        'subjectToFrc',
        'fixedRecoverableCosts');
      //TODO add the url.
      res.redirect(constructResponseUrlWithIdParams(claimId, 'todo'));
    }

  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default subjectToFRCController;
