import {SummarySection, summarySection} from '../../../../../common/models/summaryList/summarySections';
import {Claim} from '../../../../../common/models/claim';
import {summaryRow} from '../../../../../common/models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from '../../../../../common/utils/urlFormatter';
import {getLng} from '../../../../../common/utils/languageToggleUtils';
import {CAN_WE_USE_URL, CITIZEN_PHONE_NUMBER_URL} from '../../../../../routes/urls';
import {YesNo} from '../../../../../common/form/models/yesNo';

const changeLabel = (lang: string | unknown): string => t('PAGES.CHECK_YOUR_ANSWER.CHANGE', {lng: getLng(lang)});

export const buildFreeTelephoneMediationSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  const freeMediationHref = constructResponseUrlWithIdParams(claimId, CAN_WE_USE_URL);
  const contactNumberHref = constructResponseUrlWithIdParams(claimId, CITIZEN_PHONE_NUMBER_URL);
  const canWeUse = claim.mediation.mediationDisagreement.option === YesNo.YES ? YesNo.YES : YesNo.NO;
  let freeTelephoneMediationSection: SummarySection = null;

  freeTelephoneMediationSection = summarySection({
    title: t('PAGES.FREE_TELEPHONE_MEDIATION.PAGE_TITLE', {lng: getLng(lang)}),
    summaryRows: [],
  });

  freeTelephoneMediationSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_MEDIATION', {lng: getLng(lang)}), t(`COMMON.${canWeUse}`, {lng: getLng(lang)}), freeMediationHref, changeLabel(lang)));

  freeTelephoneMediationSection.summaryList.rows.push(summaryRow(t('PAGES.CHECK_YOUR_ANSWER.FREE_TELEPHONE_CONTACT', {lng: getLng(lang)}), `${claim.mediation.canWeUse.mediationPhoneNumber}`, contactNumberHref, changeLabel(lang)));


  return freeTelephoneMediationSection;
};
