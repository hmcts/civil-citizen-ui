import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GA_APPLY_HELP_WITH_FEE_SELECTION} from 'routes/urls';
export const getHelpWithApplicationFeeReferenceContents = () => {
  return new PageSectionBuilder()
    .addMicroText('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING')
    .addMainTitle('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.TITLE')
    .addTitle('PAGES.APPLY_HELP_WITH_FEES.REFERENCE_NUMBER.QUESTION_TITLE')
    .build();
};
export const getButtonsContents  = (claimId : string) => {
  return new PageSectionBuilder()
    .addButtonWithCancelLink('COMMON.BUTTONS.CONTINUE', '',false, constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_FEE_SELECTION))
    .build();
};
