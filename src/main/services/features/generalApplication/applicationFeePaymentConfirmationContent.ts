import { Claim } from 'common/models/claim';
import {convertToPoundsFilter, currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {PaymentSuccessfulSectionBuilder} from 'services/features/claim/paymentSuccessfulSectionBuilder';
import { getLng } from 'common/utils/languageToggleUtils';
import { ApplicationTypeOption } from 'common/models/generalApplication/applicationType';
import { CaseProgressionHearing } from 'common/models/caseProgression/caseProgressionHearing';

const daysForHearingAdjournWithoutFee =14;

export const getGaPaymentSuccessfulPanelContent = (claim: Claim, lng?: string) => {
  const panelBuilder = new PaymentSuccessfulSectionBuilder();
  if (isApplicationSubmittedWithoutFee(claim.generalApplication.applicationTypes[claim.generalApplication.applicationTypes.length - 1]?.option, claim.caseProgressionHearing)) {
    panelBuilder.addPanelForConfirmation('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.APPLICATION_SUBMITTED', lng);
  } else {
    panelBuilder.addPanel(claim.generalApplication?.applicationFeePaymentDetails?.paymentReference, lng);
  }
  return panelBuilder.build();
};

export const getGaPaymentSuccessfulBodyContent = (claim: Claim, calculatedAmountInPence : string, isAdditionalFee: boolean, lng?: string) => {
  const withoutFee = isApplicationSubmittedWithoutFee(claim.generalApplication?.applicationTypes[claim.generalApplication.applicationTypes.length - 1]?.option, claim.caseProgressionHearing);
  const contentBuilder = new PaymentSuccessfulSectionBuilder()
    .addParagraph('PAGES.PAYMENT_CONFIRMATION.SUCCESSFUL.CONFIRMATION', { lng: getLng(lng) })
    .addTitle('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT',{ lng: getLng(lng) });
  if (isAdditionalFee) {
    contentBuilder
      .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_5', {lng: getLng(lng)})
      .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_6', {lng: getLng(lng)})
      .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_3', {lng: getLng(lng)})
      .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_4', {lng: getLng(lng)});
  } else {
    if (withoutFee) {
      contentBuilder
        .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_5', {lng: getLng(lng)});
    } else {
      contentBuilder
        .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_1', { lng: getLng(lng) });
    }
    contentBuilder
      .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_2', {lng: getLng(lng)})
      .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_3', {lng: getLng(lng)})
      .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.WHAT_HAPPENS_NEXT_PARA_4', {lng: getLng(lng)});
    if (!withoutFee) {
      contentBuilder
        .addTitle('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.CHOOSEN_NOT_TO_INFORM_OTHER_PARTY', {lng: getLng(lng)})
        .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.CHOOSEN_NOT_TO_INFORM_OTHER_PARTY_PARA_1', {lng: getLng(lng)})
        .addParagraph('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.CHOOSEN_NOT_TO_INFORM_OTHER_PARTY_PARA_2', {lng: getLng(lng)});
    }
  }

  contentBuilder.addTitle('PAGES.GENERAL_APPLICATION.GA_PAYMENT_SUCCESSFUL.PAYMENT_SUMMARY_TITLE', { lng: getLng(lng) })
    .addSummary(currencyFormatWithNoTrailingZeros(convertToPoundsFilter(
      calculatedAmountInPence)),
    isAdditionalFee ? 'COMMON.MICRO_TEXT.ADDITIONAL_APPLICATION_FEE' : 'COMMON.MICRO_TEXT.APPLICATION_FEE',
    lng);
  return contentBuilder.build();
};

export const getGaPaymentSuccessfulButtonContent = (redirectUrl : string) => {
  return new PaymentSuccessfulSectionBuilder()
    .addButton('COMMON.BUTTONS.CLOSE_AND_RETURN_TO_DASHBOARD', redirectUrl)
    .build();
};

const isApplicationSubmittedWithoutFee = (applicationType: ApplicationTypeOption, caseProgressionHearing: CaseProgressionHearing) => {
  const caseProgressionHearingDetails = Object.assign(new CaseProgressionHearing(), caseProgressionHearing);
  return applicationType === ApplicationTypeOption.ADJOURN_HEARING && (caseProgressionHearingDetails.getDurationOfDaysForHearing() >= daysForHearingAdjournWithoutFee || !caseProgressionHearingDetails.hearingDate);
};
