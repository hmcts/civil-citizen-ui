import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_DEPENDANTS_URL,
} from '../../../../../../routes/urls';
import {YesNoUpperCase} from '../../../../../../common/form/models/yesNo';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

export const addDependants = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string ) => {
  const yourDependantsHref = CITIZEN_DEPENDANTS_URL.replace(':id', claimId);
  const dependants = claim.statementOfMeans?.dependants?.declared ? YesNoUpperCase.YES : YesNoUpperCase.NO;
  const numberOfChildren = claim.statementOfMeans?.dependants?.numberOfChildren;
  const numberOfChildrenLivingWithYou = claim.statementOfMeans?.numberOfChildrenLivingWithYou;

  financialSection.summaryList.rows.push(summaryRow(t('COMMON.CHILDREN', { lng: getLng(lang) }), '', yourDependantsHref, changeLabel(lang)));
  financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CHILDREN_DO_YOU_HAVE_ANY_LIVE_WITH_YOU', { lng: getLng(lang) }), t(`COMMON.${dependants}`, {lng: getLng(lang)}), yourDependantsHref, changeLabel(lang)));

  if(numberOfChildren?.under11) financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CHILDREN_UNDER_11', { lng: getLng(lang) }), numberOfChildren.under11.toString(), '', changeLabel(lang)));
  if(numberOfChildren?.between11and15) financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CHILDREN_BETWEEN_11_TO_15', { lng: getLng(lang) }), numberOfChildren.between11and15.toString(), '', changeLabel(lang)));
  if(numberOfChildren?.between16and19) financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CHILDREN_BETWEEN_16_TO_19', { lng: getLng(lang) }), numberOfChildren.between16and19.toString(), '', changeLabel(lang)));
  if(numberOfChildren?.between16and19 && numberOfChildrenLivingWithYou) financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.CHILDREN_AGED_16_19_FT_EDUCATION', { lng: getLng(lang) }), numberOfChildrenLivingWithYou.toString(), yourDependantsHref, changeLabel(lang)));
};
