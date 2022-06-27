import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_DEPENDANTS_URL,
} from '../../../../../../routes/urls';
import {YesNo} from '../../../../../../common/form/models/yesNo';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', { lng: getLng(lang) });

export const addDependants = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string | unknown) => {
  const yourDependantsHref = CITIZEN_DEPENDANTS_URL.replace(':id', claimId);
  const dependants = claim.statementOfMeans?.dependants?.declared ? YesNo.YES : YesNo.NO;
  const numberOfChildren = claim.statementOfMeans?.dependants?.numberOfChildren;
  const numberOfChildrenLivingWithYou = claim.statementOfMeans?.numberOfChildrenLivingWithYou;

  financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CHILDREN', { lng: getLng(lang) }), '', yourDependantsHref, changeLabel(lang)));
  financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CHILDREN_DO_YOU_HAVE_ANY_LIVE_WITH_YOU', { lng: getLng(lang) }), dependants.charAt(0).toUpperCase() + dependants.slice(1), yourDependantsHref, changeLabel(lang)));

  if (dependants === YesNo.YES) {
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CHILDREN_UNDER_11', { lng: getLng(lang) }), numberOfChildren.under11.toString(), '', changeLabel(lang)));
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CHILDREN_UNDER_11_TO_15', { lng: getLng(lang) }), numberOfChildren.between11and15.toString(), '', changeLabel(lang)));
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CHILDREN_UNDER_16_TO_19', { lng: getLng(lang) }), numberOfChildren.between11and15.toString(), '', changeLabel(lang)));
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CHILDREN_AGED_16_19_FT_EDUCATION', { lng: getLng(lang) }), numberOfChildrenLivingWithYou.toString(), yourDependantsHref, changeLabel(lang)));
  }
};
