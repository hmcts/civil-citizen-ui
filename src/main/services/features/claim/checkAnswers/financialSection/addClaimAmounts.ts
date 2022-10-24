import {SummarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {currencyFormatWithNoTrailingZeros} from '../../../../../common/utils/currencyFormat';
import {CLAIM_AMOUNT_URL} from 'routes/urls';
import {ClaimAmountBreakup} from '../../../../../common/form/models/claimDetails';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', {lng: getLng(lang)});

export const addClaimAmounts = (claim: Claim, claimAmountSection: SummarySection, claimId: string, lang: string | unknown) => {
  if (claim.claimAmountBreakup) {
    const claimAmounts: ClaimAmountBreakup[] = claim.claimAmountBreakup;
    for (let i = 0; i < claimAmounts.length; i++) {
      claimAmountSection.summaryList.rows.push(
        summaryRow(claimAmounts[i].value.claimReason, currencyFormatWithNoTrailingZeros(Number(claimAmounts[i].value.claimAmount)), CLAIM_AMOUNT_URL, changeLabel(lang)),
      );
    }
  }
};
