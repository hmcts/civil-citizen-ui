import {SummarySection} from '../../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../../common/models/claim';
import {summaryRow} from '../../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {getLng} from '../../../../../../common/utils/languageToggleUtils';
import {
  CITIZEN_RESIDENCE_URL,
} from '../../../../../../routes/urls';
import {ResidenceType} from '../../../../../../common/form/models/statementOfMeans/residence/residenceType';

const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', { lng: getLng(lang) });

export const addResidence = (claim: Claim, financialSection: SummarySection, claimId: string, lang: string ) => {
  const yourResidenceTypeHref = CITIZEN_RESIDENCE_URL.replace(':id', claimId);
  const residence = claim.statementOfMeans?.residence;
  const residenceType = claim.statementOfMeans?.residence?.type === ResidenceType.OTHER ? residence?.housingDetails : residence?.type;
  financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHERE_DO_YOU_LIVE', { lng: getLng(lang) }), translateResidenceType(residenceType, lang), yourResidenceTypeHref, changeLabel(lang)));
};

const translateResidenceType = (residence: string, lng: string ): string => {
  switch (residence) {
    case 'COUNCIL_OR_HOUSING_ASSN_HOME':
      return t('PAGES.RESIDENCE.ASSOCIATION_HOME', {lng: getLng(lng)});
    case 'JOINT_OWN_HOME':
      return t('PAGES.RESIDENCE.JOIN_HOME', {lng: getLng(lng)});
    case 'OWN_HOME':
      return t('PAGES.RESIDENCE.OWN_HOME', {lng: getLng(lng)});
    case 'PRIVATE_RENTAL':
      return t('PAGES.RESIDENCE.RENTAL_HOME', {lng: getLng(lng)});
    default:
      return residence;
  }
};
