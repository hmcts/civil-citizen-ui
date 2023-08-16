import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {CP_CHECK_ANSWERS_URL, CP_EVIDENCE_UPLOAD_SUBMISSION_URL} from '../../urls';
import {getSummarySections} from 'services/features/claim/checkAnswers/checkAnswersService';
import {deleteDraftClaimFromStore, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'common/models/AppRequest';
import {GenericForm} from 'common/form/models/genericForm';
import {documentUploadSubmissionForm} from 'form/models/caseProgression/documentUploadSubmission';

const checkAnswersViewPath = 'features/caseProgression/check-answers';
const documentUploadCheckAnswerController = Router();

function renderView(res: Response, form: GenericForm<documentUploadSubmissionForm>, claim: Claim, userId: string, lang: string) {
  const summarySections = getSummarySections(userId, claim, lang);

  res.render(checkAnswersViewPath, {
    form, summarySections,
  });
}

documentUploadCheckAnswerController.get(CP_CHECK_ANSWERS_URL,
  (async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.session?.user?.id;
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const claim = await getCaseDataFromStore(req.params.id);
      const form = new GenericForm(new documentUploadSubmissionForm());
      renderView(res, form, claim, userId, lang);
    } catch (error) {
      next(error);
    }
  })as RequestHandler);

documentUploadCheckAnswerController.post(CP_CHECK_ANSWERS_URL, (async (req: Request | AppRequest, res: Response, next: NextFunction) => {
  try {
    const userId = (<AppRequest>req).session?.user?.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const form = new GenericForm(new documentUploadSubmissionForm(req.body.signed));
    const claim = await getCaseDataFromStore(userId);
    await form.validate();

    if (form.hasErrors()) {
      renderView(res, form, claim, userId, lang);
    } else {
      // await saveDocuments(<AppRequest>req);
      await deleteDraftClaimFromStore(userId);
      res.redirect(constructResponseUrlWithIdParams(claim.id, CP_EVIDENCE_UPLOAD_SUBMISSION_URL));
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

export default documentUploadCheckAnswerController;
