import {t} from 'i18next';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

const HELP_FEE_SELECTION = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE.APPLY_HELP_FEE_SELECTION';

export const getApplyHelpFeeSelectionContents = (lng: string) => {

  const linkBefore = `${HELP_FEE_SELECTION}.LINK_BEFORE`;
  const linkParagraph = `<p class="govuk-body govuk-!-margin-bottom-1">${t(linkBefore, {lng})}
        <a target="_blank" class="govuk-link" rel="noopener noreferrer" href="https://www.gov.uk/get-help-with-court-fees">${t(`${HELP_FEE_SELECTION}.LINK_TEXT`, {lng})}</a>
    </p>`;
  return new PageSectionBuilder()
    .addMicroText('COMMON.MICRO_TEXT.HEARING_FEE')
    .addMainTitle(`${HELP_FEE_SELECTION}.TITLE`)
    .addRawHtml(linkParagraph)
    .addParagraph('')
    .addParagraph(`${HELP_FEE_SELECTION}.PARAGRAPH`)
    .addTitle(`${HELP_FEE_SELECTION}.QUESTION_TITLE`)
    .build();
};
