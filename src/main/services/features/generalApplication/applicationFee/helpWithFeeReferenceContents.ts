import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {constructResponseUrlWithIdAndAppIdParams} from 'common/utils/urlFormatter';
import {GA_APPLY_HELP_WITH_FEE_SELECTION} from 'routes/urls';
export const getHelpWithApplicationFeeReferenceContents = (feeTypeFlag: boolean) => {
  const pageBuilder=new PageSectionBuilder();
  if(feeTypeFlag){
    pageBuilder.addMicroText('PAGES.GENERAL_APPLICATION.PAY_ADDITIONAL_FEE.HEADING');
  } else{
    pageBuilder .addMicroText('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING');
  }
  pageBuilder.addMainTitle('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.TITLE')
    .addTitle('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.REFERENCE_NUMBER.TITLE');
  return pageBuilder.build();
};
export const getButtonsContents = (claimId: string, gaAppId: string) => {
  return new PageSectionBuilder()
    .addButtonWithCancelLink('COMMON.BUTTONS.CONTINUE', '', false, constructResponseUrlWithIdAndAppIdParams(claimId, gaAppId, GA_APPLY_HELP_WITH_FEE_SELECTION))
    .build();
};
