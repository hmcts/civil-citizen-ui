import {t} from 'i18next';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {constructResponseUrlWithIdAndAppIdParams, constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DASHBOARD_CLAIMANT_URL, GA_APPLY_HELP_WITH_FEE_REFERENCE, HELP_WITH_FEES_ELIGIBILITY} from 'routes/urls';

export const getHelpApplicationFeeSelectionPageContents = (lng: string, paymentSyncError: boolean) => {
  const linkBefore = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.LINK_BEFORE';
  const linkParagraph = `<p class="govuk-body govuk-!-margin-bottom-1">${t(linkBefore, {lng})}
        <a target="_blank" class="govuk-link" rel="noopener noreferrer" href="https://www.gov.uk/get-help-with-court-fees">
        ${t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.LINK_TEXT', {lng})}</a>.</p>`;
  const contentBuilder = new PageSectionBuilder()
    .addMicroText('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING')
    .addMainTitle('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.WANT_TO_APPLY_HWF_TITLE');
  if (paymentSyncError) {
    contentBuilder.addWarning('PAGES.FEE_AMOUNT.SYNC_WARNING');
  }
  contentBuilder
    .addRawHtml(linkParagraph)
    .addParagraph('')
    .addParagraph(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.PARAGRAPH', {lng}))
    .addTitle(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.QUESTION_TITLE', {lng}));
  return contentBuilder.build();
};

export const getButtonsContents  = (claimId : string) => {
  return new PageSectionBuilder()
    .addRawHtml(String.raw`</fieldset>`, '')
    .addButtonWithCancelLink('COMMON.BUTTONS.CONTINUE', '',false, constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL))
    .build();
};

export const getHelpApplicationFeeContinuePageContents = (lang: string, feeAmount: string, feeTypeFlag: boolean) => {
  const pageBuilder=new PageSectionBuilder();
  const fieldsetHtml = String.raw`<fieldset class="govuk-fieldset"><legend class="govuk-visually-hidden">${t('PAGES.APPLY_HELP_WITH_FEES.START.CONTINUE_APPLICATION', {lang})}</legend>`;

  if (feeTypeFlag) {
    pageBuilder.addMicroText('PAGES.GENERAL_APPLICATION.PAY_ADDITIONAL_FEE.HEADING');
  } else{
    pageBuilder .addMicroText('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING');
  }
  pageBuilder.addMainTitle('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.TITLE')
    .addInsetText('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.GENERAL_APPLICATION_FEE_INSET',
      {feeAmount: feeAmount})
    .addFullStopLink('PAGES.APPLY_HELP_WITH_FEES.START.ELIGIBILITY_LINK', HELP_WITH_FEES_ELIGIBILITY, 'PAGES.APPLY_HELP_WITH_FEES.START.ELIGIBILITY', null, null, true)
    .addParagraph('PAGES.APPLY_HELP_WITH_FEES.START.RECEIVE_DECISION')
    .addSpan('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_FULLY_TITLE', '', 'govuk-!-font-weight-bold')
    .addParagraph('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_FULLY')
    .addSpan('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_PARTIALLY_TITLE', '', 'govuk-!-font-weight-bold')
    .addParagraph('PAGES.APPLY_HELP_WITH_FEES.START.ACCEPTED_PARTIALLY')
    .addSpan('PAGES.APPLY_HELP_WITH_FEES.START.REJECTED_TITLE', '', 'govuk-!-font-weight-bold')
    .addParagraph('PAGES.APPLY_HELP_WITH_FEES.START.REJECTED')
    .addRawHtml(fieldsetHtml,'')
    .addTitle('PAGES.APPLY_HELP_WITH_FEES.START.CONTINUE_APPLICATION')
    .build();
  return pageBuilder.build();
};

export const getApplicationFeeContentPageDetails = (claimId: string, feeType: boolean, genAppId: string) => {
  const nextPageUrl = constructResponseUrlWithIdAndAppIdParams(claimId, genAppId, GA_APPLY_HELP_WITH_FEE_REFERENCE) + '?additionalFeeTypeFlag=' + feeType;
  const dashBoardClaimantUrl = DASHBOARD_CLAIMANT_URL.replace(':id', claimId);
  const pageBuilder = new PageSectionBuilder();
  if (feeType) {
    pageBuilder.addMicroText('PAGES.GENERAL_APPLICATION.PAY_ADDITIONAL_FEE.HEADING');
  } else {
    pageBuilder.addMicroText('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING');
  }
  pageBuilder.addMainTitle('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.TITLE')
    .addParagraph('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PARAGRAPH_IF')
    .addParagraph('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.APPLICATION_FEE_PARAGRAPH_INSTEAD')
    .addParagraph('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.APPLICATION_FEE_PARAGRAPH_DURING')
    .addParagraph('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PARAGRAPH_ONCE')
    .addLink('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.LINK','https://www.gov.uk/get-help-with-court-fees','','','',true)
    .addButtonWithCancelLink('COMMON.BUTTONS.CONTINUE', nextPageUrl,false, dashBoardClaimantUrl);
  return pageBuilder.build();
};
