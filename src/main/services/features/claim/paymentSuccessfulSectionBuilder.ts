import { getLng } from 'common/utils/languageToggleUtils';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';

export class PaymentSuccessfulSectionBuilder extends PageSectionBuilder {

  addPanel(paymentReferenceNumber: string, lng?: string) {
    const section = ({
      type: ClaimSummaryType.PANEL,
      data: {
        title: `<span class='govuk-!-font-size-50'>${t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAGE_TITLE', { lng: getLng(lng) })}<br>${t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAGE_TITLE2', { lng: getLng(lng) })}</span>`,
        html: `<span class='govuk-!-font-size-41'>${t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAYMENT_IS', { lng: getLng(lng) })}</span>
              <br><strong>${paymentReferenceNumber}</strong><br>`,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addSummary(totalAmount: string, microText: string, lng?: string) {
    const section = ({
      type: ClaimSummaryType.HTML,
      data: {
        html: `<dl class="govuk-summary-list">
                 <div class="govuk-summary-list__row">
                 <dt class="govuk-summary-list__key"><strong>${t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAYMENT_FOR', { lng: getLng(lng) })}</strong></dt>
                 <dd class="govuk-summary-list__value">${t(microText, { lng: getLng(lng) })}</dd></div>
                 <div class="govuk-summary-list__row">
                 <dt class="govuk-summary-list__key"><strong>${t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.TOTAL_AMOUNT', { lng: getLng(lng) })}</strong></dt>
                 <dd class="govuk-summary-list__value">${totalAmount}</dd></div>
               </dl>`,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }
  
  addPanelForConfirmation(title: string, lng?: string) {
    const section = ({
      type: ClaimSummaryType.PANEL,
      data: {
        title: `<span class='govuk-!-font-size-36'>${t(title, { lng: getLng(lng) })}</span>`,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }
}
