import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {RejectAllOfClaimType} from '../../../../../common/form/models/rejectAllOfClaimType';
import {
  CITIZEN_RESPONSE_TYPE_URL,
  CITIZEN_ALREADY_PAID_URL,
  CITIZEN_REJECT_ALL_CLAIM_URL,
} from '../../../../../routes/urls';
import {YesNo,YesNoUpperCase} from '../../../../../common/form/models/yesNo';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

const getRejectAllOfClaimOptionKey = (claim: Claim) => {
  const page = 'PAGES.CITIZEN_RESPONSE_TYPE.REJECT_ALL_CLAIM_TYPE.';
  switch (claim.rejectAllOfClaim.option) {
    case RejectAllOfClaimType.ALREADY_PAID:
      return page + 'ALREADY_PAID';
    case RejectAllOfClaimType.DISPUTE:
      return page + 'DISPUTE';
    case RejectAllOfClaimType.COUNTER_CLAIM:
      return page + 'COUNTER_CLAIM';
  }
};

export const buildYourResponseToClaimSection = (claim: Claim, claimId: string, lang: string): SummarySection => {
  const yourResponseToClaimHref = constructResponseUrlWithIdParams(claimId, CITIZEN_RESPONSE_TYPE_URL);
  const yourPaymentAdmittedToClaimantHref = constructResponseUrlWithIdParams(claimId, CITIZEN_ALREADY_PAID_URL);
  const rejectAllClaimUrl = constructResponseUrlWithIdParams(claimId, CITIZEN_REJECT_ALL_CLAIM_URL);
  const alreadyPaid = claim.partialAdmission?.alreadyPaid?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  let yourResponseToClaimSection: SummarySection = null;

  yourResponseToClaimSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE', {lng: getLng(lang)}),
    summaryRows: [],
  });

  yourResponseToClaimSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY', { lng: getLng(lang) }), t(`COMMON.RESPONSE_TYPE.${claim.respondent1.responseType}`, { lng: getLng(lang) }), yourResponseToClaimHref, changeLabel(lang)));

  if(claim.isPartialAdmission()) {
    yourResponseToClaimSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_HAVE_YOU_PAID_THE_CLAIMANT', { lng: getLng(lang) }), t(`COMMON.VARIATION_2.${alreadyPaid}`, {lng: getLng(lang)}), yourPaymentAdmittedToClaimantHref, changeLabel(lang)));
  } else if (claim.isFullDefence()) {
    yourResponseToClaimSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_WHY_DO_YOU_REJECT_ALL_OF_THIS_CLAIM', { lng: getLng(lang) }), t(getRejectAllOfClaimOptionKey(claim), {lng: getLng(lang)}), rejectAllClaimUrl, changeLabel(lang)));
  }

  return yourResponseToClaimSection;
};
