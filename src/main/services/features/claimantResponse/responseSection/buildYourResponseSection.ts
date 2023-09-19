import {Claim} from 'models/claim';
import {summarySection, SummarySection} from 'models/summaryList/summarySections';
import {t} from 'i18next';
import {summaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL} from 'routes/urls';
import {changeLabel} from 'common/utils/checkYourAnswer/changeButton';
import {YesNo, YesNoUpperCase} from 'form/models/yesNo';

export const buildYourResponseSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {

  const intentionToProceedHref = constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL);
  const intentionToProceed = claim.claimantResponse?.intentionToProceed?.option === YesNo.YES ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  let yourResponseToClaimSection: SummarySection = null;

  yourResponseToClaimSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.YOUR_RESPONSE', {lang}),
    summaryRows: [],
  });

  if (claim.isFullDefence() && claim.isRejectAllOfClaimDispute()) {
    yourResponseToClaimSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.PROCEED_WITH_CLAIM', {lang}), t(`COMMON.${intentionToProceed}`, {lang}), intentionToProceedHref, changeLabel(lang)));
  }

  return yourResponseToClaimSection;
};
