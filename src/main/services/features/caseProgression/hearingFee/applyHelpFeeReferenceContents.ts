import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

const HELP_FEE_SELECTION = 'PAGES.LATEST_UPDATE_CONTENT.CASE_PROGRESSION';

export const getApplyHelpFeeReferenceContents = () => {

  return new PageSectionBuilder()
    .addMicroText('COMMON.MICRO_TEXT.HEARING_FEE')
    .addMainTitle(`${HELP_FEE_SELECTION}.PAY_HEARING_FEE.APPLY_HELP_WITH_FEES.PAGE_TITLE`)
    .addTitle(`${HELP_FEE_SELECTION}.HEARING_FEE.APPLY_HELP_REFERENCE_NUMBER.QUESTION_TITLE`)
    .build();
};
