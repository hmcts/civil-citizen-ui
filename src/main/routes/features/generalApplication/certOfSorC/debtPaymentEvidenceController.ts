import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {
  BACK_URL, GA_CHECK_YOUR_ANSWERS_COSC_URL, GA_DEBT_PAYMENT_EVIDENCE_COSC_URL,
  GA_UPLOAD_DOCUMENTS_COSC_URL,
} from 'routes/urls';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {DebtPaymentEvidence} from 'models/generalApplication/debtPaymentEvidence';
import {
  getCertificateOfSatisfactionOrCancellation,
  saveCertificateOfSatisfactionOrCancellation,
} from 'services/features/generalApplication/certOfSorC/certificateOfSatisfactionOrCancellationService';
import {CertificateOfSatisfactionOrCancellation} from 'models/generalApplication/CertificateOfSatisfactionOrCancellation';

const debtPaymentEvidenceController = Router();
const debtPaymentEvidenceViewPath = 'features/generalApplication/certOfSorC/debt-payment-evidence';

function renderView(form: GenericForm<DebtPaymentEvidence>, res: Response, claimId: string, cancelUrl: string) {
  const backLinkUrl = BACK_URL;
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

debtPaymentEvidenceController.get(GA_DEBT_PAYMENT_EVIDENCE_COSC_URL, (async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const certificateOfSatisfactionOrCancellation: CertificateOfSatisfactionOrCancellation = await getCertificateOfSatisfactionOrCancellation(req);
    const cancelUrl = await getCancelUrl(claimId, null);
    const form: DebtPaymentEvidence = certificateOfSatisfactionOrCancellation?.debtPaymentEvidence
      ? certificateOfSatisfactionOrCancellation.debtPaymentEvidence: new DebtPaymentEvidence();
    renderView(new GenericForm(form), res, claimId, cancelUrl);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

debtPaymentEvidenceController.post(GA_DEBT_PAYMENT_EVIDENCE_COSC_URL,
  (async (req: Request, res: Response, next: NextFunction) => {
    try {
      let nextPageUrl = '';
      const claimId = req.params.id;
      const cancelUrl = await getCancelUrl(claimId, null);
      const form = new GenericForm(new DebtPaymentEvidence(req.body.debtPaymentOption, req.body.provideDetails));
      form.validateSync();
      if (form.hasErrors()) {
        renderView(form,  res, claimId, cancelUrl);
      } else {
        if (req.body.debtPaymentOption !== debtPaymentOptions.UNABLE_TO_PROVIDE_EVIDENCE_OF_FULL_PAYMENT) {
          form.model.provideDetails = '';
        }
        await saveCertificateOfSatisfactionOrCancellation(req, form.model, 'debtPaymentEvidence');
        switch (form.model.debtPaymentOption) {
          case debtPaymentOptions.UNABLE_TO_PROVIDE_EVIDENCE_OF_FULL_PAYMENT:
            nextPageUrl = constructResponseUrlWithIdParams(claimId, GA_CHECK_YOUR_ANSWERS_COSC_URL);
            break;
          default:
            nextPageUrl = constructResponseUrlWithIdParams(claimId, GA_UPLOAD_DOCUMENTS_COSC_URL);
            break;
        }
        res.redirect(nextPageUrl);
      }
    } catch (error) {
      next(error);
    }
  }) as RequestHandler);

export default debtPaymentEvidenceController;
