import {YesNo, YesNoUpperCase} from "common/form/models/yesNo";
import {Claim} from "common/models/claim";
import {SummaryRow, summaryRow} from "common/models/summaryList/summaryList";
import {SummarySection, summarySection} from "common/models/summaryList/summarySections";
import {changeLabel} from "common/utils/checkYourAnswer/changeButton";
import {getLng} from "common/utils/languageToggleUtils";
import {constructResponseUrlWithIdParams} from "common/utils/urlFormatter";
import {t} from "i18next";
import {CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL, CLAIMANT_RESPONSE_REJECTION_REASON_URL, CLAIMANT_RESPONSE_SETTLE_CLAIM_URL} from "routes/urls";

export const buildYourResponseSection = (claim: Claim, claimId: string, lang: string| unknown): SummarySection => {

  const lng = getLng(lang);
  const yourResponse = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', {lng}),
    summaryRows: [],
  });

  yourResponse.summaryList.rows.push(getDoYouAgreeDefendantPaid(claim, claimId, lng));
  yourResponse.summaryList.rows.push(getDoYouWantToSettlePaid(claim, claimId, lng));

  if (claim.claimantResponse?.hasPartPaymentBeenAccepted?.option === YesNo.NO) {
    yourResponse.summaryList.rows.push(getReasonForRejecting(claim, claimId, lng));
  }

  return yourResponse;
};

export const getDoYouAgreeDefendantPaid = ( claim : Claim, claimId: string, lng: string): SummaryRow => {

  const option = claim.claimantResponse?.hasDefendantPaidYou?.option === YesNo.YES
  ? YesNoUpperCase.YES
  : YesNoUpperCase.NO;

  let paidAmount: number;
  if (claim.isFullDefence()) {
    paidAmount = claim.isRejectAllOfClaimAlreadyPaid();
  } else if (claim.isPartialAdmissionPaid()) {
    paidAmount = claim.partialAdmissionPaidAmount();
  }

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_AGREE_PAID', {lng, paidAmount}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL),
    changeLabel(lng),
  );
};

export const getDoYouWantToSettlePaid = ( claim : Claim, claimId: string, lng: string): SummaryRow => {

  const option = claim.claimantResponse?.hasPartPaymentBeenAccepted?.option === YesNo.YES
  ? YesNoUpperCase.YES
  : YesNoUpperCase.NO;

  const paidAmount = claim.isFullDefence() 
    ? claim.isRejectAllOfClaimAlreadyPaid()
    : claim.partialAdmissionPaidAmount();

  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_WANT_TO_SETTLE_PAID', {lng, paidAmount}),
    t(`COMMON.${option}`, {lng}),
    constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_CLAIM_URL),
    changeLabel(lng),
  );
};

export const getReasonForRejecting = (claim : Claim, claimId: string, lng: string): SummaryRow => {
  return summaryRow(
    t('PAGES.CHECK_YOUR_ANSWER.REASON_FOR_REJECTING', {lng}),
    claim.claimantResponse?.rejectionReason?.text,
    constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_REJECTION_REASON_URL),
    changeLabel(lng),
  );
};
