import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {HEARING_FEE_CANCEL_JOURNEY} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

export const getButtonsContents  = (claimId : string) => {
  return new PageSectionBuilder()
    .addButtonWithCancelLink('COMMON.BUTTONS.CONTINUE', '',false, constructResponseUrlWithIdParams(claimId, HEARING_FEE_CANCEL_JOURNEY))
    .build();
};
