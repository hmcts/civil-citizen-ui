import {Claim} from 'models/claim';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';
import {t} from 'i18next';
import {getCancelUrl, isConfirmYouPaidCCJAppType} from 'services/features/generalApplication/generalApplicationService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION} from 'routes/urls';
import {HTTPError} from '../../../HttpError';

// id is the parent claim's application collection-item ID, not the linked GA case reference.
// A missing pair must be recovered by the controller, never reconstructed from another draft.
export const getConfirmationParameters = (query: {id?: unknown; appFee?: unknown}): {genAppId: string; applicationFee: number} | undefined => {
  if (typeof query.id !== 'string' || typeof query.appFee !== 'string'
    || !/^[a-zA-Z0-9_-]+$/.test(query.id) || /^(undefined|null)$/i.test(query.id)
    || !/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(query.appFee)) {
    return undefined;
  }
  const applicationFee = Number(query.appFee);
  return Number.isFinite(applicationFee) ? {genAppId: query.id, applicationFee} : undefined;
};

const getPaymentUrl = (claimId: string, genAppId: string, applicationFee: number): string => {
  const parameters = getConfirmationParameters({id: genAppId, appFee: String(applicationFee)});
  if (!parameters) {
    const error = new HTTPError('Application confirmation requires an application ID and a valid fee');
    error.status = 400;
    throw error;
  }
  const query = new URLSearchParams({id: parameters.genAppId, appFee: String(parameters.applicationFee)});
  return `${constructResponseUrlWithIdParams(claimId, GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION)}?${query}`;
};

export const getGeneralApplicationConfirmationContent = (async (claimId: string, genAppId: string, claim: Claim, lng: string, applicationFee: number) => {
  const dashboardUrl = await getCancelUrl(claimId, claim);
  const payApplicationFeeUrl = getPaymentUrl(claimId, genAppId, applicationFee);
  const isCoScGeneralApplication = isConfirmYouPaidCcjDebtGA(claim);
  if (isCoScGeneralApplication) {
    return new PageSectionBuilder()
      .addTitle('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_PAY_FEE')
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLICATION_SAVE', {applicationFee})
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLY_HELP_WITH_FEES')
      .addTitle('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.WHAT_NEXT')
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_APPLICATION_SUBMITTED')
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_APPLICATION_SUBMITTED_NEXT')
      .addButton(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.PAY_FEE_BUTTON', {lng}), payApplicationFeeUrl)
      .addLink(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.RETURN_CASE_DETAILS', {lng}), dashboardUrl)
      .build();
  } else {
    return new PageSectionBuilder()
      .addTitle('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.WHAT_NEXT')
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLICATION_SAVE', {applicationFee})
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.UNTIL_PAY_FEE')
      .addParagraph('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.APPLY_HELP_WITH_FEES')
      .addButton(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.PAY_FEE_BUTTON', {lng}), payApplicationFeeUrl)
      .addLink(t('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.RETURN_CASE_DETAILS', {lng}), dashboardUrl)
      .build();
  }
});

export const getCoScGeneralApplicationConfirmationContent = (async (claimId: string, genAppId: string, claim: Claim, lng: string, applicationFee: number) => {
  const dashboardUrl = await getCancelUrl(claimId, claim);
  const payApplicationFeeUrl = getPaymentUrl(claimId, genAppId, applicationFee);
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
});

function isConfirmYouPaidCcjDebtGA(claim: Claim): boolean {
  return isConfirmYouPaidCCJAppType(claim);
}
