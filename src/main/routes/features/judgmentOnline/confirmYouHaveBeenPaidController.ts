import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  CONFIRM_YOU_HAVE_BEEN_PAID_URL,
  DASHBOARD_CLAIMANT_URL,
} from '../../urls';
import {GenericForm} from 'form/models/genericForm';
import {DocumentUploadSubmissionForm} from 'form/models/caseProgression/documentUploadSubmission';
import {AppRequest} from 'models/AppRequest';
import {t} from 'i18next';
import {getClaimById} from 'modules/utilityService';

const confirmYouHaveBeenPaidViewPath = 'features/judgmentOnline/confirm-you-have-been-paid';
const confirmYouHaveBeenPaidController = Router();
const judgmentUrl = 'www.test.com'; //TODO update URL
// function renderView(res: Response, form: GenericForm<DocumentUploadSubmissionForm>, claim: Claim, claimId: string, isClaimant: boolean, lang: string) {
//   const isSmallClaims = claim.isSmallClaimsTrackDQ;
//   const cancelUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claim.id);
// // if(isClaimant && specClaim) {
//   res.render(confirmYouHaveBeenPaidViewPath, {
//     form, isSmallClaims, cancelUrl,
//   });
// }

const getSupportLinks = (lng: string) => {
  const iWantToTitle = t('PAGES.DASHBOARD.SUPPORT_LINKS.I_WANT_TO', { lng });
  const iWantToLinks = [
    { text: t('PAGES.CONFIRM_YOU_HAVE_BEEN_PAID.JUDGMENT_LINK', { lng }), url: judgmentUrl },
  ];
  return [iWantToTitle, iWantToLinks] as const;
};

confirmYouHaveBeenPaidController.get(CONFIRM_YOU_HAVE_BEEN_PAID_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req);
    const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const [iWantToTitle, iWantToLinks] = getSupportLinks(lang);
    const isSmallClaims = claim.isSmallClaimsTrackDQ;
    const isClaimant = claim.isClaimant();
    const cancelUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claim.id);

    const form = new GenericForm(new DocumentUploadSubmissionForm());
    // res.render(confirmYouHaveBeenPaidViewPath, {confirmYouHaveBeenPaid:getConfirmYouHaveBeenPaidContents(claimId, claim)});
    // renderView(res, form, claim, claimId, claim.isClaimant(), iWantToLinks, iWantToTitle, helpSupportLinks, helpSupportTitle, lang);
    if (isClaimant && isSmallClaims) {
      res.render(
        confirmYouHaveBeenPaidViewPath, {
          form,
          iWantToTitle,
          iWantToLinks,
          cancelUrl,
        },
      );
    }
  } catch (error) {
    next(error);
  }
})as RequestHandler);

confirmYouHaveBeenPaidController.post(CONFIRM_YOU_HAVE_BEEN_PAID_URL, (async (req: Request | AppRequest, res: Response, next: NextFunction) => {
  try {
    // const claimId = req.params.id;
    // const lang = req.query.lang ? req.query.lang : req.cookies.lang;
    const form = new GenericForm(new DocumentUploadSubmissionForm(req.body.signed));
    // const claim = await getCaseDataFromStore(claimId);
    await form.validate();

    if (form.hasErrors()) {
      // renderView(res, form, claim, claimId, isSmallClaims, lang);
    } else {
      // await saveUploadedDocuments(claim, <AppRequest>req);
      // await deleteDraftClaimFromStore(claimId);
      // res.redirect(constructResponseUrlWithIdParams(claim.id, CP_EVIDENCE_UPLOAD_SUBMISSION_URL));
    }
  } catch (error) {
    next(error);
  }

})as RequestHandler);

export default confirmYouHaveBeenPaidController;
