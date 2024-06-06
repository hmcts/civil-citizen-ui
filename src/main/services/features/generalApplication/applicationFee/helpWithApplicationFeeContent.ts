import {t} from 'i18next';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DASHBOARD_CLAIMANT_URL, HELP_WITH_FEES_ELIGIBILITY} from 'routes/urls';
import {ClaimFeeData} from 'models/civilClaimResponse';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';

export const getApplyHelpWithApplicationFeeContents = (lng: string) => {
  const linkBefore = `PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.LINK_BEFORE`;
  const linkParagraph = `<p class="govuk-body govuk-!-margin-bottom-1">${t(linkBefore, {lng})}
        <a target="_blank" class="govuk-link" rel="noopener noreferrer" href="https://www.gov.uk/get-help-with-court-fees">
        ${t(`PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.LINK_TEXT`, {lng})}</a></p>`;
  return new PageSectionBuilder()
    .addMicroText('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING')
    .addMainTitle('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.TITLE')
    .addRawHtml(linkParagraph)
    .addParagraph('')
    .addParagraph(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.PARAGRAPH', {lng}))
    .addTitle(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.QUESTION_TITLE', {lng}))
    .build();
};

export const getButtonsContents  = (claimId : string) => {
  return new PageSectionBuilder()
    .addButtonWithCancelLink('COMMON.BUTTONS.CONTINUE', '',false, constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL))
    .build();
};

export const getHelpWithApplicationFeeContinueContent = (gaFeeData: ClaimFeeData) => {
  const feeAmount = convertToPoundsFilter(gaFeeData?.calculatedAmountInPence.toString());
  return new PageSectionBuilder()
    .addMicroText('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING')
    .addMainTitle('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.TITLE')
    .addInsetText('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.GENERAL_APPLICATION_FEE_INSET',
      {feeAmount: feeAmount})
    .addLink('PAGES.APPLY_HELP_WITH_FEES.START.ELIGIBILITY_LINK', HELP_WITH_FEES_ELIGIBILITY, 'PAGES.APPLY_HELP_WITH_FEES.START.ELIGIBILITY', null, null, true)
    .addParagraph('PAGES.APPLY_HELP_WITH_FEES.START.RECEIVE_DECISION')
    .addSpan('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_FULLY_TITLE', '', 'govuk-!-font-weight-bold')
    .addParagraph('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_FULLY')
    .addSpan('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_PARTIALLY_TITLE', '', 'govuk-!-font-weight-bold')
    .addParagraph('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_PARTIALLY')
    .addSpan('PAGES.APPLY_HELP_WITH_FEES.START.REJECTED_TITLE', '', 'govuk-!-font-weight-bold')
    .addParagraph('PAGES.APPLY_HELP_WITH_FEES.START.REJECTED')
    .addTitle('PAGES.APPLY_HELP_WITH_FEES.START.CONTINUE_APPLICATION')
    .build();
};


