import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  COSC_FINAL_PAYMENT_DATE_URL, GA_CHECK_YOUR_ANSWERS_COSC_URL,
  GA_DEBT_PAYMENT_EVIDENCE_URL, GA_UPLOAD_DOCUMENT_COSC_URL,
} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {DebtPaymentEvidence} from 'models/generalApplication/debtPaymentEvidence';
import {debtPaymentEvidenceService} from 'services/features/generalApplication/certOfSorC/debtPaymentEvidenceService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';

const debtPaymentEvidenceController = Router();
const debtPaymentEvidenceViewPath = 'features/generalApplication/certOfSorC/debt-payment-evidence';

function renderView(form: GenericForm<DebtPaymentEvidence>, res: Response, claimId: string, cancelUrl: string) {

  const backLinkUrl = constructResponseUrlWithIdParams(claimId, COSC_FINAL_PAYMENT_DATE_URL);
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
    const form: DebtPaymentEvidence = claim.certificateOfSatisfactionOrCanceled?.debtPaymentEvidence
      ? claim.certificateOfSatisfactionOrCanceled.debtPaymentEvidence: new DebtPaymentEvidence;
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
      const redisKey = generateRedisKey(<AppRequest>req);
      const claim = await getClaimById(claimId, req, true);
      const cancelUrl = await getCancelUrl(claimId, claim);
      const form = new GenericForm(new DebtPaymentEvidence(req.body.evidence, req.body.provideDetails));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form,  res, claimId, cancelUrl);
      } else {
        await debtPaymentEvidenceService.saveDebtPaymentEvidence(<AppRequest>req, claimId, redisKey, form.model);
        switch (form.model.evidence) {
          case debtPaymentOptions.NO_EVIDENCE:
            nextPageUrl = constructResponseUrlWithIdParams(claimId, GA_CHECK_YOUR_ANSWERS_COSC_URL);
            break;
          default:
            nextPageUrl = constructResponseUrlWithIdParams(claimId, GA_UPLOAD_DOCUMENT_COSC_URL);
            break;
        }
        res.redirect(nextPageUrl);
      }
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default debtPaymentEvidenceController;