import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {ResponseType} from '../../../../../common/form/models/responseType';
import {
  CITIZEN_RESPONSE_TYPE_URL,
} from '../../../../../routes/urls';
import {YesNo} from '../../../../../common/form/models/yesNo';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', { lng: getLng(lang) });

export const buildYourResponseToClaimSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const yourResponseToClaimHref = constructResponseUrlWithIdParams(claimId, CITIZEN_RESPONSE_TYPE_URL);
  const alreadyPaid = claim.partialAdmission?.alreadyPaid?.option === YesNo.YES ? YesNo.YES : YesNo.NO;
  let yourResponseToClaimSection: SummarySection = null;

  yourResponseToClaimSection = summarySection({
    title: t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE', {lng: getLng(lang)}),
    summaryRows: [],
  });

  yourResponseToClaimSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.OWE_MONEY', { lng: getLng(lang) }), t(`COMMON.RESPONSE_TYPE.${claim.respondent1?.responseType}`, { lng: getLng(lang) }), yourResponseToClaimHref, changeLabel(lang)));

  if (claim.respondent1?.responseType === ResponseType.PART_ADMISSION) {
    yourResponseToClaimSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_HAVE_YOU_PAID_THE_CLAIMANT', { lng: getLng(lang) }), alreadyPaid.charAt(0).toUpperCase() + alreadyPaid.slice(1), yourResponseToClaimHref, changeLabel(lang)));
  }

  return yourResponseToClaimSection;
};
