import {NextFunction, Request, Response, Router} from 'express';
import {CP_CHECK_ANSWERS_URL, CP_EVIDENCE_UPLOAD_SUBMISSION_URL} from '../../urls';
import {
  getBottomElements,
  getSummarySections,
  getTopElements, saveDocuments,
} from 'services/features/caseProgression/checkYourAnswers/checkAnswersService';
import {deleteDraftClaimFromStore, getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'common/models/claim';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {AppRequest} from 'common/models/AppRequest';
import {GenericForm} from 'common/form/models/genericForm';
import {documentUploadSubmissionForm} from 'form/models/caseProgression/documentUploadSubmission';

const checkAnswersViewPath = 'features/caseProgression/check-answers';
const documentUploadCheckAnswerController = Router();

function renderView(res: Response, form: GenericForm<documentUploadSubmissionForm>, claim: Claim, claimId: string, lang: string) {
  const topPageContents = getTopElements(claim);
  const summarySections = getSummarySections(claim, claimId, lang);
  const bottomPageContents = getBottomElements();
  const isSmallClaims = claim.isSmallClaimsTrackDQ;

  res.render(checkAnswersViewPath, {
    form, topPageContents, summarySections, bottomPageContents, isSmallClaims,
  });
}

documentUploadCheckAnswerController.get(CP_CHECK_ANSWERS_URL,
  async (req: AppRequest, res: Response, next: NextFunction) => {
    try {
      const claimId = req.params.id;
      const lang = req.query.lang ? req.query.lang : req.cookies.lang;
      const claim = await getCaseDataFromStore(claimId);
      const form = new GenericForm(new documentUploadSubmissionForm());
      renderView(res, form, claim, claimId, lang);
    } catch (error) {
      next(error);
    }
  });

documentUploadCheckAnswerController.post(CP_CHECK_ANSWERS_URL, async (req: Request | AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const form = new GenericForm(new documentUploadSubmissionForm(req.body.signed));
    const claim = await getCaseDataFromStore(claimId);
    await form.validate();

    if (form.hasErrors()) {
      renderView(res, form, claim, claimId, lang);
    } else {
      await saveDocuments(claim, <AppRequest>req, false);
      await deleteDraftClaimFromStore(claimId);
      res.redirect(constructResponseUrlWithIdParams(claim.id, CP_EVIDENCE_UPLOAD_SUBMISSION_URL));
    }
  } catch (error) {
    next(error);
  }

});

export default documentUploadCheckAnswerController;
