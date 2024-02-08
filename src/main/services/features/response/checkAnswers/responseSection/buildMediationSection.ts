import {SummarySection, summarySection} from 'models/summaryList/summarySections';
import {Claim} from 'models/claim';
import {summaryRow} from 'models/summaryList/summaryList';
import {t} from 'i18next';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL,
  MEDIATION_ALTERNATIVE_EMAIL_URL,
  MEDIATION_ALTERNATIVE_PHONE_URL,
  MEDIATION_CONTACT_PERSON_CONFIRMATION_URL,
  MEDIATION_EMAIL_CONFIRMATION_URL,
  MEDIATION_NEXT_3_MONTHS_URL,
  MEDIATION_PHONE_CONFIRMATION_URL, MEDIATION_UNAVAILABLE_SELECT_DATES_URL,
} from 'routes/urls';
import {YesNo} from 'form/models/yesNo';
import {getListOfUnavailableDate} from 'services/features/directionsQuestionnaire/hearing/unavailableDatesCalculation';
const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

export const buildMediationSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {
  let mediationSection: SummarySection = null;
  if(!claim.mediationCarm) {
    return mediationSection;
  }

  mediationSection = summarySection({
    title: t('COMMON.AVAILABILITY_FOR_MEDIATION', {lng: getLng(lang)}),
    summaryRows: [],
  });
  //CONTACT NAME SECTION
  if (claim.isBusiness()) {
    mediationSection.summaryList.rows.push(summaryRow(t('PAGES.MEDIATION_CONTACT_PERSON_CONFIRMATION.PAGE_TEXT_DEFENDANT', {
      lng: getLng(lang),
      defendantContactPerson: claim.respondent1.partyDetails.contactPerson,
    }),
    t(`COMMON.VARIATION_2.${claim.mediationCarm.isMediationContactNameCorrect.option.toUpperCase()}`, {lng: getLng(lang)}),
    constructResponseUrlWithIdParams(claimId, MEDIATION_CONTACT_PERSON_CONFIRMATION_URL), changeLabel(lang)));

    if (claim.mediationCarm.isMediationContactNameCorrect.option === YesNo.NO) {
      mediationSection.summaryList.rows.push(summaryRow(t('COMMON.CONTACT_NAME', {lng: getLng(lang)}),
        claim.mediationCarm.alternativeMediationContactPerson.alternativeContactPerson,
        constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL), changeLabel(lang)));
    }
  }

  //PHONE SECTION
  mediationSection.summaryList.rows.push(summaryRow(t('PAGES.MEDIATION_PHONE_CONFIRMATION.PAGE_TEXT', {
    lng: getLng(lang),
    defendantPhone: claim.respondent1.partyPhone.phone,
  }),
  t(`COMMON.VARIATION_2.${claim.mediationCarm.isMediationPhoneCorrect.option.toUpperCase()}`, {lng: getLng(lang)}),
  constructResponseUrlWithIdParams(claimId, MEDIATION_PHONE_CONFIRMATION_URL), changeLabel(lang)));
  if (claim.mediationCarm.isMediationPhoneCorrect.option === YesNo.NO) {
    mediationSection.summaryList.rows.push(summaryRow(t('COMMON.CONTACT_NUMBER', {lng: getLng(lang)}),
      claim.mediationCarm.alternativeMediationTelephone.alternativeTelephone,
      constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_PHONE_URL), changeLabel(lang)));
  }
  //EMAIL SECTION
  mediationSection.summaryList.rows.push(summaryRow(t('PAGES.MEDIATION_EMAIL_CONFIRMATION.PAGE_TEXT', {
    lng: getLng(lang),
    defendantEmail: claim.respondent1.emailAddress.emailAddress,
  }),
  t(`COMMON.VARIATION_2.${claim.mediationCarm.isMediationEmailCorrect.option.toUpperCase()}`, {lng: getLng(lang)}),
  constructResponseUrlWithIdParams(claimId, MEDIATION_EMAIL_CONFIRMATION_URL), changeLabel(lang)));
  if (claim.mediationCarm.isMediationEmailCorrect.option === YesNo.NO) {
    mediationSection.summaryList.rows.push(summaryRow(t('COMMON.CONTACT_EMAIL', {lng: getLng(lang)}),
      claim.mediationCarm.alternativeMediationEmail.alternativeEmailAddress,
      constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_EMAIL_URL), changeLabel(lang)));
  }
  //UNAVAILABILITY SECTION
  mediationSection.summaryList.rows.push(summaryRow(t('PAGES.UNAVAILABILITY_NEXT_THREE_MONTHS_MEDIATION_CONFIRMATION.PAGE_TEXT', {lng: getLng(lang)}),
    t(`COMMON.VARIATION_2.${claim.mediationCarm.hasUnavailabilityNextThreeMonths.option.toUpperCase()}`, {lng: getLng(lang)}),
    constructResponseUrlWithIdParams(claimId, MEDIATION_NEXT_3_MONTHS_URL), changeLabel(lang)));
  if (claim.mediationCarm.hasUnavailabilityNextThreeMonths.option === YesNo.YES) {
    const hasUnavailableDatesMediation = getListOfUnavailableDate(claim.mediationCarm.unavailableDatesForMediation, getLng(lang));
    mediationSection.summaryList.rows.push(summaryRow(
      t('COMMON.UNAVAILABLE_DATES', {lang}),
      ` ${[...hasUnavailableDatesMediation].join('<br>')}`,
      constructResponseUrlWithIdParams(claimId, MEDIATION_UNAVAILABLE_SELECT_DATES_URL),
      changeLabel(lang),
    ));
  }

  return mediationSection;
};

