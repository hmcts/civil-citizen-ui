import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_RESIDENCE_URL,
} from '../../../../../../routes/urls';
import {ResidenceType} from '../../../../../../common/form/models/statementOfMeans/residenceType';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', { lng: getLng(lang) });

export const addResidence = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string | unknown) => {
  const yourResidenceTypeHref = CITIZEN_RESIDENCE_URL.replace(':id', claimId);
  const residence = claim.statementOfMeans?.residence;
  const residenceType = claim.statementOfMeans?.residence?.type?.value === ResidenceType.OTHER.value ? residence?.housingDetails : residence?.type?.displayValue;
  financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHERE_DO_YOU_LIVE', { lng: getLng(lang) }), translateResidenceType(residenceType, lang), yourResidenceTypeHref, changeLabel(lang)));
};

const translateResidenceType = (residence: string, lng: string | unknown): string => {
  switch (residence) {
    case 'Council or housing association home':
      return t('PAGES.RESIDENCE.ASSOCIATION_HOME', {lng: getLng(lng)});
    case 'Jointly-owned home (or jointly mortgaged home)':
      return t('PAGES.RESIDENCE.JOIN_HOME', {lng: getLng(lng)});
    case 'Home you own yourself (or pay a mortgage on)':
      return t('PAGES.RESIDENCE.OWN_HOME', {lng: getLng(lng)});
    case 'Private rental':
      return t('PAGES.RESIDENCE.RENTAL_HOME', {lng: getLng(lng)});
    default:
      return residence;
  }
};
