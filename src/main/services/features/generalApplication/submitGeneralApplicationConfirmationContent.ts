import {Claim} from 'models/claim';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';
import {getCancelUrl, getLast} from 'services/features/generalApplication/generalApplicationService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION} from 'routes/urls';
import {isCoScEnabled} from '../../../app/auth/launchdarkly/launchDarklyClient';
import {selectedApplicationType, selectedApplicationTypeDescription} from 'models/generalApplication/applicationType';

export const getGeneralApplicationConfirmationContent = (async (claimId: string, genAppId: string, claim: Claim, lng: string, applicationFee: number) => {
  const dashboardUrl = await getCancelUrl(claimId, claim);
  let payApplicationFeeUrl = constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION);
  payApplicationFeeUrl = genAppId ? payApplicationFeeUrl + `?id=${genAppId}` : payApplicationFeeUrl;
  payApplicationFeeUrl = payApplicationFeeUrl + '&appFee=' + applicationFee;
  const isCertOfScEnabled = await isCoScEnabled();
  const isCoScGeneralApplication = isConfirmYouPaidCcjDebtGA(isCertOfScEnabled, claim);
  if (isCoScGeneralApplication) {
    return new PageSectionBuilder()
      .addTitle('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_PAY_FEE')
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLICATION_SAVE', {applicationFee})
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLY_HELP_WITH_FEES')
      .addTitle('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT')
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_APPLICATION_SUBMITTED')
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_APPLICATION_SUBMITTED_NEXT')
      .addButton(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.PAY_FEE_BUTTON', {lng}), payApplicationFeeUrl)
      .addLink(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.RETURN_CASE_DETAILS', {lng}), dashboardUrl)
      .build();
  } else {
    return new PageSectionBuilder()
      .addTitle('PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT')
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLICATION_SAVE', {applicationFee})
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.UNTIL_PAY_FEE')
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLY_HELP_WITH_FEES')
      .addButton(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.PAY_FEE_BUTTON', {lng}), payApplicationFeeUrl)
      .addLink(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.RETURN_CASE_DETAILS', {lng}), dashboardUrl)
      .build();
  }
});

function isConfirmYouPaidCcjDebtGA(isCertOfSOrCEnabled: boolean, claim: Claim): boolean {
  return isCertOfSOrCEnabled &&
    selectedApplicationType[getLast(claim.generalApplication?.applicationTypes)?.option]
              === selectedApplicationTypeDescription.CONFIRM_YOU_PAID_CCJ_DEBT;
}

