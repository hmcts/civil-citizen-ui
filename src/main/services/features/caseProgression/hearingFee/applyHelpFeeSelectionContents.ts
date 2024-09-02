import {t} from 'i18next';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';

const HELP_FEE_SELECTION = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION';

export const getApplyHelpFeeSelectionContents = (lng: string,claimId: string, totalClaimAmount:number) => {

  const linkBefore = `${HELP_FEE_SELECTION}.LINK_BEFORE`;
  const linkParagraph = `<p class="govuk-body govuk-!-margin-bottom-1">${t(linkBefore, {lng})}
        <a target="_blank" class="govuk-link" rel="noopener noreferrer" href="https://www.gov.uk/get-help-with-court-fees">${t(`${HELP_FEE_SELECTION}.LINK_TEXT`, {lng})}</a>
    </p>`;
  return new PageSectionBuilder()
    .addMicroText('PAGES.DASHBOARD.HEARINGS.HEARING')
    .addMainTitle(`${HELP_FEE_SELECTION}.TITLE`)
    .addLeadParagraph('COMMON.CASE_NUMBER_PARAM', {claimId:caseNumberPrettify(claimId)}, 'govuk-!-margin-bottom-1')
    .addLeadParagraph('COMMON.CLAIM_AMOUNT_WITH_VALUE', {claimAmount: currencyFormatWithNoTrailingZeros(totalClaimAmount)})
    .addRawHtml(linkParagraph)
    .addParagraph('')
    .addParagraph(`${HELP_FEE_SELECTION}.PARAGRAPH`)
    .addTitle(`${HELP_FEE_SELECTION}.QUESTION_TITLE`)
    .build();
};
