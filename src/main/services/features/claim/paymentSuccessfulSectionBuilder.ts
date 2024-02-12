import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';

export class PaymentSuccessfulSectionBuilder extends PageSectionBuilder {

  addPanel(paymentReferenceNumber: string) {
    const section = ({
      type: ClaimSummaryType.PANEL,
      data: {
        title: `<span class='govuk-!-font-size-50'>${t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAGE_TITLE')}<br>${t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAGE_TITLE2')}</span>`,
        html: `<span class='govuk-!-font-size-41'>${t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAYMENT_IS')}</span>
              <br><strong>${paymentReferenceNumber}</strong><br>`,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addSummary(totalAmount: string, microText: string) {
    const section = ({
      type: ClaimSummaryType.HTML,
      data: {
        html: `<dl class="govuk-summary-list">
                 <div class="govuk-summary-list__row">
                 <dt class="govuk-summary-list__key"><strong>${t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAYMENT_FOR')}</strong></dt>
                 <dd class="govuk-summary-list__value">${t(microText)}</dd></div>
                 <div class="govuk-summary-list__row">
                 <dt class="govuk-summary-list__key"><strong>${t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.TOTAL_AMOUNT')}</strong></dt>
                 <dd class="govuk-summary-list__value">${totalAmount}</dd></div>
               </dl>`,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }
}
