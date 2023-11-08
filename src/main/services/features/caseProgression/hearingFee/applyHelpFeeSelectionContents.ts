import {
  ApplyHelpFeeSelectionSectionBuilder,
} from 'models/caseProgression/hearingFee/applyHelpFeeSelectionSectionBuilder';
import {t} from 'i18next';

const HELP_FEE_SELECTION = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION';

export const getApplyHelpFeeSelectionContents = () => {

  const linkBefore = `${HELP_FEE_SELECTION}.LINK_BEFORE`;
  const linkParagraph = `<p class="govuk-body govuk-!-margin-bottom-1">${t(linkBefore)}
        <a target="_blank" class="govuk-link" rel="noopener noreferrer" href="https://www.gov.uk/get-help-with-court-fees">${t(`${HELP_FEE_SELECTION}.LINK_TEXT`)}</a>
    </p>`;
  return new ApplyHelpFeeSelectionSectionBuilder()
    .addMicroText(`${HELP_FEE_SELECTION}.PAGE_TITLE`)
    .addMainTitle(`${HELP_FEE_SELECTION}.TITLE`)
    .addRawHtml(linkParagraph)
    .addParagraph('')
    .addParagraph(`${HELP_FEE_SELECTION}.PARAGRAPH`)
    .addTitle(`${HELP_FEE_SELECTION}.QUESTION_TITLE`)
    .build();
};
