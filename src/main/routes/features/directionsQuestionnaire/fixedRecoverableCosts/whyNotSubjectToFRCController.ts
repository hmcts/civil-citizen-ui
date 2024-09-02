import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {GenericForm} from 'form/models/genericForm';
import {
  BACK_URL, DQ_DISCLOSURE_OF_DOCUMENTS_URL,
  WHY_NOT_SUBJECT_TO_FRC_URL,
} from 'routes/urls';
import {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {ReasonForNotSubjectToFrc} from 'models/directionsQuestionnaire/fixedRecoverableCosts/reasonForNotSubjectToFRC';
const whyNotSubjectToFRCController = Router();
const reasonForNotSubjectToFRCViewPath = 'features/directionsQuestionnaire/fixedRecoverableCosts/why-not-subject-to-frc';
const WHY_NOT_SUBJECT_TO_FRC_PAGE = 'PAGES.WHY_NOT_SUBJECT_TO_FRC.';

function renderView(complexityBand: GenericForm<ReasonForNotSubjectToFrc>, lang: string, res: Response): void {
  const form = complexityBand;

  res.render(reasonForNotSubjectToFRCViewPath, {
    form,
    pageTitle: `${WHY_NOT_SUBJECT_TO_FRC_PAGE}PAGE_TITLE`,
    title: `${WHY_NOT_SUBJECT_TO_FRC_PAGE}TITLE`,
    backLinkUrl: BACK_URL,
  });
}

whyNotSubjectToFRCController.get(WHY_NOT_SUBJECT_TO_FRC_URL, (async (req, res, next: NextFunction) => {
  try {
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    const form = directionQuestionnaire.fixedRecoverableCosts?.reasonsForNotSubjectToFrc ?
      new ReasonForNotSubjectToFrc(directionQuestionnaire.fixedRecoverableCosts.reasonsForNotSubjectToFrc) : new ReasonForNotSubjectToFrc();
    renderView(new GenericForm(form), lang , res);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

whyNotSubjectToFRCController.post(WHY_NOT_SUBJECT_TO_FRC_URL, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    await saveDirectionQuestionnaire(
      generateRedisKey(<AppRequest>req),
      req.body.reasonsForNotSubjectToFrc,
      'reasonsForNotSubjectToFrc',
      'fixedRecoverableCosts');
    res.redirect(constructResponseUrlWithIdParams(claimId, DQ_DISCLOSURE_OF_DOCUMENTS_URL));
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default whyNotSubjectToFRCController;
