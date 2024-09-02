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
import {YesNo } from 'form/models/yesNo';
import {getListOfUnavailableDate} from 'services/features/directionsQuestionnaire/hearing/unavailableDatesCalculation';
const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

export const buildMediationSection = (claim: Claim, claimId: string, lang: string , isClaimantResponse: boolean): SummarySection => {
  let mediationSection: SummarySection = null;
  if(isClaimantResponse ? !claim.claimantResponse.mediationCarm : !claim.mediationCarm) {
    return mediationSection;
  }

  mediationSection = summarySection({
    title: t('COMMON.AVAILABILITY_FOR_MEDIATION', {lng: getLng(lang)}),
    summaryRows: [],
  });
  //CONTACT NAME SECTION
  if (isClaimantResponse ? claim.isClaimantBusiness() : claim.isBusiness()) {
    let contactPerson;
    if (isClaimantResponse) {
      if (claim.isClaimantBusiness()) {
        contactPerson = claim.applicant1AdditionalLipPartyDetails.contactPerson;
      }
    } else {
      if (claim.isBusiness()) {
        contactPerson = claim.respondent1.partyDetails.contactPerson;
      }
    }
    const isContactPersonCorrectOption = isClaimantResponse ? claim.claimantResponse.mediationCarm.isMediationContactNameCorrect.option : claim.mediationCarm.isMediationContactNameCorrect.option;
    mediationSection.summaryList.rows.push(summaryRow(t('PAGES.MEDIATION_CONTACT_PERSON_CONFIRMATION.PAGE_TEXT', {
      lng: getLng(lang),
      partyContactPerson: contactPerson,
    }),
    t(`COMMON.VARIATION.${isContactPersonCorrectOption.toUpperCase()}`, {lng: getLng(lang)}),
    constructResponseUrlWithIdParams(claimId, MEDIATION_CONTACT_PERSON_CONFIRMATION_URL), changeLabel(lang)));

    if (isContactPersonCorrectOption === YesNo.NO) {
      mediationSection.summaryList.rows.push(summaryRow(t('COMMON.CONTACT_NAME', {lng: getLng(lang)}),
        isClaimantResponse ? claim.claimantResponse.mediationCarm.alternativeMediationContactPerson.alternativeContactPerson : claim.mediationCarm.alternativeMediationContactPerson.alternativeContactPerson,
        constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL), changeLabel(lang)));
    }
  }

  //PHONE SECTION
  const isPhoneCorrectOption = isClaimantResponse ? claim.claimantResponse.mediationCarm.isMediationPhoneCorrect.option : claim.mediationCarm.isMediationPhoneCorrect.option;
  mediationSection.summaryList.rows.push(summaryRow(t('PAGES.MEDIATION_PHONE_CONFIRMATION.PAGE_TEXT', {
    lng: getLng(lang),
    partyPhone: isClaimantResponse ? claim.applicant1.partyPhone.phone : claim.respondent1.partyPhone.phone,
  }),
  t(`COMMON.VARIATION.${isPhoneCorrectOption.toUpperCase()}`, {lng: getLng(lang)}),
  constructResponseUrlWithIdParams(claimId, MEDIATION_PHONE_CONFIRMATION_URL), changeLabel(lang)));
  if (isPhoneCorrectOption === YesNo.NO) {
    mediationSection.summaryList.rows.push(summaryRow(t('COMMON.CONTACT_NUMBER', {lng: getLng(lang)}),
      isClaimantResponse ? claim.claimantResponse.mediationCarm.alternativeMediationTelephone.alternativeTelephone : claim.mediationCarm.alternativeMediationTelephone.alternativeTelephone,
      constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_PHONE_URL), changeLabel(lang)));
  }
  //EMAIL SECTION
  const isMediationEmailCorrectOption = isClaimantResponse ? claim.claimantResponse.mediationCarm.isMediationEmailCorrect.option : claim.mediationCarm.isMediationEmailCorrect.option;
  mediationSection.summaryList.rows.push(summaryRow(t('PAGES.MEDIATION_EMAIL_CONFIRMATION.PAGE_TEXT', {
    lng: getLng(lang),
    partyEmail: isClaimantResponse ? claim.applicant1.emailAddress.emailAddress : claim.respondent1.emailAddress.emailAddress,
  }),
  t(`COMMON.VARIATION.${isMediationEmailCorrectOption.toUpperCase()}`, {lng: getLng(lang)}),
  constructResponseUrlWithIdParams(claimId, MEDIATION_EMAIL_CONFIRMATION_URL), changeLabel(lang)));
  if (isMediationEmailCorrectOption === YesNo.NO) {
    mediationSection.summaryList.rows.push(summaryRow(t('COMMON.CONTACT_EMAIL', {lng: getLng(lang)}),
      isClaimantResponse ? claim.claimantResponse.mediationCarm.alternativeMediationEmail.alternativeEmailAddress : claim.mediationCarm.alternativeMediationEmail.alternativeEmailAddress,
      constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_EMAIL_URL), changeLabel(lang)));
  }
  //UNAVAILABILITY SECTION
  const hasUnavailabilityOption = isClaimantResponse ? claim.claimantResponse.mediationCarm.hasUnavailabilityNextThreeMonths.option : claim.mediationCarm.hasUnavailabilityNextThreeMonths.option;
  mediationSection.summaryList.rows.push(summaryRow(t('PAGES.UNAVAILABILITY_NEXT_THREE_MONTHS_MEDIATION_CONFIRMATION.PAGE_TEXT', {lng: getLng(lang)}),
    t(`COMMON.VARIATION.${hasUnavailabilityOption.toUpperCase()}`, {lng: getLng(lang)}),
    constructResponseUrlWithIdParams(claimId, MEDIATION_NEXT_3_MONTHS_URL), changeLabel(lang)));
  if (hasUnavailabilityOption === YesNo.YES) {
    const hasUnavailableDatesMediation = isClaimantResponse ? getListOfUnavailableDate(claim.claimantResponse.mediationCarm.unavailableDatesForMediation, getLng(lang)) : getListOfUnavailableDate(claim.mediationCarm.unavailableDatesForMediation, getLng(lang));
    mediationSection.summaryList.rows.push(summaryRow(
      t('COMMON.UNAVAILABLE_DATES', {lng: getLng(lang)}),
      ` ${[...hasUnavailableDatesMediation].join('<br>')}`,
      constructResponseUrlWithIdParams(claimId, MEDIATION_UNAVAILABLE_SELECT_DATES_URL),
      changeLabel(lang),
    ));
  }

  return mediationSection;
};

