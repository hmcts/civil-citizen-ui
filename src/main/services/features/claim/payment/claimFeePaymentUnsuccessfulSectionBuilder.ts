import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';

export class PaymentUnsuccessfulSectionBuilder extends PageSectionBuilder {

  addPhoneNumber(lng : string, phoneNumber: string) {
    const section = ({
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body ">
                ${t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.CALL_US_ON', { lng })}
                <span class="govuk-body govuk-!-font-weight-bold">${ phoneNumber }</span>
                ${t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.MAKE_YOUR_PAYMENT', { lng })}
               </p>`,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addPaymentLink(lng : string, paymentLink: string) {
    const section = ({
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body ">
                ${t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.GO_BACK', { lng })}
                <a href="${paymentLink}">${t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.TRY_PAYMENT_AGAIN', { lng })}</a>.
               </p>`,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addCallChargesLink(lng : string, callCharges: string, callChargesLink: string) {
    const section = ({
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body ">
                ${t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.FIND_OUT_CHARGES', { lng })}
                <a href="${callChargesLink}">${callCharges}</a>.
               </p>`,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }
}
