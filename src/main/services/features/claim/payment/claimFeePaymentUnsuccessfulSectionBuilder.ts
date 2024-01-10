import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {t} from 'i18next';

export class PaymentSuccessfulSectionBuilder extends PageSectionBuilder {

  addPanel(lang: string) {
    const section = ({
      type: ClaimSummaryType.TITLE,
      data: {
        text: t('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT', {lng: lang}),
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addSummary(totalAmount: string) {
    const section = ({
      type: ClaimSummaryType.HTML,
      data: {
        html: `<dl class="govuk-summary-list">
                 <div class="govuk-summary-list__row">
                 <dt class="govuk-summary-list__key"><strong>${t('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.PAYMENT_FOR')}</strong></dt>
                 <dd class="govuk-summary-list__value">${t('COMMON.MICRO_TEXT.CLAIM_FEE')}</dd></div>
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
