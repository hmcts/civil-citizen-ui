import {Claim} from 'models/claim';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {t} from 'i18next';
import {summaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL} from 'routes/urls';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';
import {YesNo, YesNoUpperCase} from 'form/models/yesNo';
import {ClaimResponseStatus} from 'models/claimResponseStatus';
import {RESPONSEFORNOTPAIDPAYIMMEDIATELY} from 'models/claimantResponse/checkAnswers';

export const buildYourResponseSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {

  const intentionToProceedHref = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL);
  const partAdmitAcceptedHref = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL);

  let yourResponseToClaimSection: SummarySection = null;

  yourResponseToClaimSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', {lang}),
    summaryRows: [],
  });

  if (claim.isFullDefence() && claim.isRejectAllOfClaimDispute()) {
    const intentionToProceed = claim.claimantResponse?.intentionToProceed?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
    yourResponseToClaimSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PROCEED_WITH_CLAIM', {lang}), t(`COMMON.${intentionToProceed}`, {lang}), intentionToProceedHref, changeLabel(lang)));
  }

  if (claim.isPartialAdmission() && claim?.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY) {
    const selectedOption = claim?.claimantResponse?.hasPartAdmittedBeenAccepted?.option;
    yourResponseToClaimSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_OR_REJECT_THE_DEFENDANTS_ADMISSION', { lang }), t(RESPONSEFORNOTPAIDPAYIMMEDIATELY[selectedOption], { lang }), partAdmitAcceptedHref, changeLabel(lang)));
  }

  return yourResponseToClaimSection;
};
