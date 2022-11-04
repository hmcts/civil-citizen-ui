import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {t} from 'i18next';
import {getLng} from '../../../../../common/utils/languageToggleUtils';

export const buildClaimSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {

  const lng = getLng(lang);
  const claimSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.DETAILS_TITLE_CLAIMANT', {lng}),
    summaryRows: [],
  });

  return claimSection;
};
