import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {ClaimSummaryType} from 'form/models/claimSummarySection';

export class PaymentUnsuccessfulSectionBuilder extends PageSectionBuilder {

  addPhoneNumber() {
    const section = ({
      type: ClaimSummaryType.HTML,
      data: {
        html: `<p class="govuk-body ">
                Or, call us on
                <span class="govuk-body govuk-!-font-weight-bold">0300 123 7050</span>
                to make your payment manually, quoting the case reference above.
               </p>`,
      },
    });
    this._claimSummarySections.push(section);
    return this;
  }
}
