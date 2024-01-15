import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from "i18next";

export class PaymentUnsuccessfulSectionBuilder extends PageSectionBuilder {

  addPhoneNumber(lang : string) {
    const section = ({
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body ">
                ${t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.CALL_US_ON', { lng: lang })}
                <span class="govuk-body govuk-!-font-weight-bold">${t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.PHONE_NUMBER', { lng: lang })}</span>
                ${t('PAGES.PAYMENT_CONFIRMATION.UNSUCCESSFUL.MAKE_YOUR_PAYMENT', { lng: lang })}
               </p>`,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }
}
