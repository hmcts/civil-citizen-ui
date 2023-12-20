import {PageSectionBuilder} from "common/utils/pageSectionBuilder";
import {ClaimSummarySection, ClaimSummaryType} from "form/models/claimSummarySection";
import {t} from "i18next";

export class PaymentSuccessfulSectionBuilder extends PageSectionBuilder {
  _claimSummarySections: ClaimSummarySection[] = [];

  addPanel() {
    const section = ({
      type: ClaimSummaryType.PANEL,
      data: {
        title: `<span class='govuk-!-font-size-36'>${t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER')}</span>`,
        html: `<span class='govuk-!-font-size-27'>${t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER')}</span>
              <br><strong>"PAYMENT_REFERENCE"</strong><br>
              <span class='govuk-!-font-weight-bold govuk-!-font-size-24'>${t('PAGES.CLAIMANT_RESPONSE_CONFIRMATION.CLAIM_NUMBER')}</span>`,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }
}
