import {SummarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {currencyFormatWithNoTrailingZeros} from 'common/utils/currencyFormat';
import {CLAIM_AMOUNT_URL} from 'routes/urls';
import {ClaimAmountBreakup} from 'form/models/claimDetails';

const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

export const addClaimAmounts = (claim: Claim, claimAmountSection: SummarySection, lang: string | unknown) => {
  if (claim.claimAmountBreakup) {
    const claimAmounts: ClaimAmountBreakup[] = claim.claimAmountBreakup;
    for (const element of claimAmounts) {
      claimAmountSection.summaryList.rows.push(
        summaryRow(element.value.claimReason, currencyFormatWithNoTrailingZeros(Number(element.value.claimAmount)), CLAIM_AMOUNT_URL, changeLabel({lang: lang})),
      );
    }
  }
};
