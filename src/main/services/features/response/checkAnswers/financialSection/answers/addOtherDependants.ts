import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_OTHER_DEPENDANTS_URL,
} from '../../../../../../routes/urls';
import {YesNo} from '../../../../../../common/form/models/yesNo';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

export const addOtherDependants = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string ) => {
  const yourOtherDependantsHref = CITIZEN_OTHER_DEPENDANTS_URL.replace(':id', claimId);
  const otherDependantsOption = claim.statementOfMeans?.otherDependants?.option === YesNo.YES ? YesNo.YES : YesNo.NO;
  const otherDependants = claim.statementOfMeans?.otherDependants;

  if (otherDependantsOption === YesNo.YES) {
    financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.SUPPORT_ANYONE_ELSE_FINANCIALLY', { lng: getLng(lang) }), '', yourOtherDependantsHref, changeLabel(lang)));
    financialSection.summaryList.rows.push(summaryRow(t('COMMON.NUMBER_OF_PEOPLE', { lng: getLng(lang) }), otherDependants.numberOfPeople.toString(), '', changeLabel(lang)));
    financialSection.summaryList.rows.push(summaryRow(t('COMMON.GIVE_DETAILS', { lng: getLng(lang) }), otherDependants.details, '', changeLabel(lang)));
  }
};
