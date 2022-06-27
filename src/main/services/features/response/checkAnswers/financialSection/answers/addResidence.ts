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
  let residenceType = '';
  residenceType = claim.statementOfMeans?.residence?.type === ResidenceType.OTHER ? residence.housingDetails : residence.type?.displayValue;
  financialSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.WHERE_DO_YOU_LIVE', { lng: getLng(lang) }), residenceType, yourResidenceTypeHref, changeLabel(lang)));
};
