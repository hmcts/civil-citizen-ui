import {t} from 'i18next';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {DASHBOARD_CLAIMANT_URL} from 'routes/urls';

export const getHelpAdditionalFeeSelectionPageContents = (lng: string) => {
  const linkBefore = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.LINK_BEFORE';
  const linkParagraph = `<p class="govuk-body">${t(linkBefore, {lng})}
        <a target="_blank" class="govuk-link" rel="noopener noreferrer" href="https://www.gov.uk/get-help-with-court-fees">
        ${t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.LINK_TEXT', {lng})}</a></p>`;
  return new PageSectionBuilder()
    .addMicroText('PAGES.GENERAL_APPLICATION.PAY_ADDITIONAL_FEE.HEADING')
    .addMainTitle('PAGES.GENERAL_APPLICATION.PAY_ADDITIONAL_FEE.WANT_TO_APPLY_HWF_TITLE')
    .addRawHtml(linkParagraph)
    .addParagraph(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.PARAGRAPH', {lng}))
    .addTitle(t('PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION.QUESTION_TITLE', {lng}))
    .build();
};

export const getButtonsContents  = (claimId : string) => {
  return new PageSectionBuilder()
    .addButtonWithCancelLink('COMMON.BUTTONS.CONTINUE', '',false, constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL))
    .build();
};

