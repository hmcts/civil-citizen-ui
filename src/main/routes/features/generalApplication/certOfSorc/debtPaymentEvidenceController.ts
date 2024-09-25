import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  APPLICATION_TYPE_URL, CHECK_YOUR_ANSWERS_COSC_URL,
  GA_DEBT_PAYMENT_EVIDENCE_URL, UPLOAD_DOCUMENT_COSC_URL,
} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {debtPaymentOptions} from 'routes/features/generalApplication/certOfSorc/debtPaymentOptions';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {DebtPaymentEvidence} from 'routes/features/generalApplication/certOfSorc/debtPaymentEvidence';

const debtPaymentEvidenceController = Router();
const debtPaymentEvidenceViewPath = 'features/certOfSorc/debt-payment-evidence';

function renderView(form: GenericForm<DebtPaymentEvidence>, res: Response, claimId: string, cancelUrl: string) {

  const backLinkUrl = constructResponseUrlWithIdParams(claimId, APPLICATION_TYPE_URL);
  res.render(debtPaymentEvidenceViewPath,
    {
      form,
      DebtPaymentOptions: debtPaymentOptions,
      pageTitle: 'PAGES.GENERAL_APPLICATION.DEBT_PAYMENT.DO_YOU_HAVE_EVIDENCE',
      cancelUrl: cancelUrl,
      backLinkUrl: backLinkUrl,
    },
  );
}

debtPaymentEvidenceController.get(GA_DEBT_PAYMENT_EVIDENCE_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const cancelUrl = await getCancelUrl(claimId, claim);
    const form:DebtPaymentEvidence = claim.debtPaymentEvidence?.option? new DebtPaymentEvidence(claim.debtPaymentEvidence?.option): new DebtPaymentEvidence;
    renderView(new GenericForm(form), res, claimId, cancelUrl);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

debtPaymentEvidenceController.post(GA_DEBT_PAYMENT_EVIDENCE_URL,
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      let nextPageUrl = '';
      const claimId = req.params.id;
      const claim = await getClaimById(claimId, req, true);
      const cancelUrl = await getCancelUrl(claimId, claim);
      const form = new GenericForm(new DebtPaymentEvidence(req.body.debtPaymentEvidenceOptions, req.body.provideDetails));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form,  res, claimId, cancelUrl);
      }
      switch (form.model.evidence) {
        case debtPaymentOptions.NO_EVIDENCE:
          nextPageUrl = constructResponseUrlWithIdParams(claimId, CHECK_YOUR_ANSWERS_COSC_URL);
          break;
        default:
          // This link is to be updated when merging all stories together for COSC
          nextPageUrl = constructResponseUrlWithIdParams(claimId, UPLOAD_DOCUMENT_COSC_URL);
          break;
      }
      res.redirect(nextPageUrl);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default debtPaymentEvidenceController;
