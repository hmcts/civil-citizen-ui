import {PageSectionBuilder} from "common/utils/pageSectionBuilder";
import {ClaimSummarySection, ClaimSummaryType} from "form/models/claimSummarySection";
import {t} from "i18next";

export class PaymentSuccessfulSectionBuilder extends PageSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];

  addPanel(paymentReferenceNumber: String) {
    const section = ({
      type: ClaimSummaryType.PANEL,
      data: {
        title: `<span class='govuk-!-font-size-36'>${t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.PAYMENT.SUCCESSFUL.PAGE_TITLE')}</span>`,
        html: `<span class='govuk-!-font-size-27'>${t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.PAYMENT.SUCCESSFUL.PAYMENT_IS')}</span>
              <br><strong>${paymentReferenceNumber}</strong><br>`,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }

  addSummary(paymentFor: String, totalAmount: String) {
    const section = ({
      type: ClaimSummaryType.HTML,
      data: {
        title: ``,
        html: `<dl class="govuk-summary-list">
                 <div class="govuk-summary-list__row"><dt class="govuk-summary-list__key"><strong>Payment for</strong></dt><dd class="govuk-summary-list__value">${paymentFor}</dd></div>
                 <div class="govuk-summary-list__row"><dt class="govuk-summary-list__key"><strong>Total amount</strong></dt><dd class="govuk-summary-list__value">${totalAmount}</dd></div>
               </dl>`,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }
}
