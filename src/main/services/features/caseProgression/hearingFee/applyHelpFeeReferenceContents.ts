import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

const HELP_FEE_SELECTION = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION.HEARING_FEE';

export const getApplyHelpFeeReferenceContents = () => {

  return new PageSectionBuilder()
    .addMicroText('COMMON.MICRO_TEXT.HEARING_FEE')
    .addMainTitle(`${HELP_FEE_SELECTION}.APPLY_HELP_FEE_SELECTION.TITLE`)
    .addTitle(`${HELP_FEE_SELECTION}.APPLY_HELP_REFERENCE_NUMBER.QUESTION_TITLE`)
    .build();
};
