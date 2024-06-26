import {
  createClaimWithMediationSectionWithOption, createClaimWithMediationSectionWithOptionClaimantResponse,
} from '../../../../../../utils/mockClaimForCheckAnswers';
import * as constVal from '../../../../../../utils/checkAnswersConstants';

import {YesNo} from 'form/models/yesNo';
import {buildMediationSection} from 'services/features/response/checkAnswers/responseSection/buildMediationSection';
import {summarySection} from 'models/summaryList/summarySections';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {summaryRow} from 'models/summaryList/summaryList';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL, MEDIATION_ALTERNATIVE_EMAIL_URL, MEDIATION_ALTERNATIVE_PHONE_URL,
  MEDIATION_CONTACT_PERSON_CONFIRMATION_URL, MEDIATION_EMAIL_CONFIRMATION_URL, MEDIATION_NEXT_3_MONTHS_URL,
  MEDIATION_PHONE_CONFIRMATION_URL, MEDIATION_UNAVAILABLE_SELECT_DATES_URL,
} from 'routes/urls';
import {getListOfUnavailableDate} from 'services/features/directionsQuestionnaire/hearing/unavailableDatesCalculation';
import {Claim} from 'models/claim';

jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Mediation Section', () => {

  describe('defendant response', () => {

    it('should return response mediation when all option are no and carm is applicable', async () => {
      //When
      const claim = createClaimWithMediationSectionWithOption(YesNo.NO);
      const expectedMediationSection = getMediationSection(claim, constVal.CLAIM_ID, 'en', false);
      const summarySections =  buildMediationSection(claim, constVal.CLAIM_ID, 'en', false);
      //Then
      expect(expectedMediationSection).toStrictEqual(summarySections);
    });

    it('should return response mediation when all option are yes and carm is applicable', async () => {
      //When
      const claim = createClaimWithMediationSectionWithOption(YesNo.YES);
      const expectedMediationSection = getMediationSection(claim, constVal.CLAIM_ID, 'en', false);
      const summarySections =  buildMediationSection(claim, constVal.CLAIM_ID, 'en', false);
      //Then
      expect(expectedMediationSection).toStrictEqual(summarySections);
    });

    it('should return response mediation when all option are no and carm is applicable when defendant is company', async () => {
      //When
      const claim = createClaimWithMediationSectionWithOption(YesNo.NO, true);
      const expectedMediationSection = getMediationSection(claim, constVal.CLAIM_ID, 'en', false);
      const summarySections =  buildMediationSection(claim, constVal.CLAIM_ID, 'en', false);
      //Then
      expect(expectedMediationSection).toStrictEqual(summarySections);
    });

    it('should return response mediation when all option are yes and carm is applicable when defendant is company', async () => {
      //When
      const claim = createClaimWithMediationSectionWithOption(YesNo.YES, true);
      const expectedMediationSection = getMediationSection(claim, constVal.CLAIM_ID, 'en', false);
      const summarySections =  buildMediationSection(claim, constVal.CLAIM_ID, 'en', false);
      //Then
      expect(expectedMediationSection).toStrictEqual(summarySections);
    });
  });

  describe('claimant response', () => {

    it('should return response mediation when all option are no and carm is applicable', async () => {
      //When
      const claim = createClaimWithMediationSectionWithOptionClaimantResponse(YesNo.NO);
      const expectedMediationSection = getMediationSection(claim, constVal.CLAIM_ID, 'en', true);
      const summarySections =  buildMediationSection(claim, constVal.CLAIM_ID, 'en', true);
      //Then
      expect(expectedMediationSection).toStrictEqual(summarySections);
    });

    it('should return response mediation when all option are yes and carm is applicable', async () => {
      //When
      const claim = createClaimWithMediationSectionWithOptionClaimantResponse(YesNo.YES);
      const expectedMediationSection = getMediationSection(claim, constVal.CLAIM_ID, 'en', true);
      const summarySections =  buildMediationSection(claim, constVal.CLAIM_ID, 'en', true);
      //Then
      expect(expectedMediationSection).toStrictEqual(summarySections);
    });

    it('should return response mediation when all option are no and carm is applicable when claimant is company', async () => {
      //When
      const claim = createClaimWithMediationSectionWithOptionClaimantResponse(YesNo.NO, true);
      const expectedMediationSection = getMediationSection(claim, constVal.CLAIM_ID, 'en', true);
      const summarySections =  buildMediationSection(claim, constVal.CLAIM_ID, 'en', true);
      //Then
      expect(expectedMediationSection).toStrictEqual(summarySections);
    });

    it('should return response mediation when all option are yes and carm is applicable when claimant is company', async () => {
      //When
      const claim = createClaimWithMediationSectionWithOptionClaimantResponse(YesNo.YES, true);
      const expectedMediationSection = getMediationSection(claim, constVal.CLAIM_ID, 'en', true);
      const summarySections =  buildMediationSection(claim, constVal.CLAIM_ID, 'en', true);
      //Then
      expect(expectedMediationSection).toStrictEqual(summarySections);
    });
  });
});

const getMediationSection = (claim: Claim, claimId: string, lang: string, isClaimantResponse: boolean) => {
  const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

  const mediationSection = summarySection({
    title: t('COMMON.AVAILABILITY_FOR_MEDIATION', {lng: getLng(lang)}),
    summaryRows: [],
  });
    //CONTACT NAME SECTION
  if (isClaimantResponse ? claim.isClaimantBusiness() : claim.isBusiness()) {
    const contactPersonOption = isClaimantResponse ? claim.claimantResponse.mediationCarm.isMediationContactNameCorrect.option : claim.mediationCarm.isMediationContactNameCorrect.option;
    mediationSection.summaryList.rows.push(summaryRow(t('PAGES.MEDIATION_CONTACT_PERSON_CONFIRMATION.PAGE_TEXT', {
      lng: getLng(lang),
      partyContactPerson: isClaimantResponse ? claim.applicant1AdditionalLipPartyDetails.contactPerson : claim.respondent1.partyDetails.contactPerson,
    }),
    t(`COMMON.VARIATION.${contactPersonOption.toUpperCase()}`, {lng: getLng(lang)}),
    constructResponseUrlWithIdParams(claimId, MEDIATION_CONTACT_PERSON_CONFIRMATION_URL), changeLabel(lang)));
    if (contactPersonOption === YesNo.NO) {
      mediationSection.summaryList.rows.push(summaryRow(t('COMMON.CONTACT_NAME', {lng: getLng(lang)}),
        isClaimantResponse ? claim.claimantResponse.mediationCarm.alternativeMediationContactPerson.alternativeContactPerson : claim.mediationCarm.alternativeMediationContactPerson.alternativeContactPerson,
        constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL), changeLabel(lang)));
    }
  }
  //PHONE SECTION
  const phoneOption = isClaimantResponse ? claim.claimantResponse.mediationCarm.isMediationPhoneCorrect.option : claim.mediationCarm.isMediationPhoneCorrect.option;
  mediationSection.summaryList.rows.push(summaryRow(t('PAGES.MEDIATION_PHONE_CONFIRMATION.PAGE_TEXT', {
    lng: getLng(lang),
    partyPhone: isClaimantResponse ? claim.applicant1.partyPhone.phone : claim.respondent1.partyPhone.phone,
  }),
  t(`COMMON.VARIATION.${phoneOption.toUpperCase()}`, {lng: getLng(lang)}),
  constructResponseUrlWithIdParams(claimId, MEDIATION_PHONE_CONFIRMATION_URL), changeLabel(lang)));
  if (phoneOption === YesNo.NO) {
    mediationSection.summaryList.rows.push(summaryRow(t('COMMON.CONTACT_NUMBER', {lng: getLng(lang)}),
      isClaimantResponse ? claim.claimantResponse.mediationCarm.alternativeMediationTelephone.alternativeTelephone : claim.mediationCarm.alternativeMediationTelephone.alternativeTelephone,
      constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_PHONE_URL), changeLabel(lang)));
  }
  //EMAIL SECTION
  const emailOption = isClaimantResponse ? claim.claimantResponse.mediationCarm.isMediationEmailCorrect.option : claim.mediationCarm.isMediationEmailCorrect.option;
  mediationSection.summaryList.rows.push(summaryRow(t('PAGES.MEDIATION_EMAIL_CONFIRMATION.PAGE_TEXT', {
    lng: getLng(lang),
    partyEmail: isClaimantResponse ? claim.applicant1.emailAddress.emailAddress : claim.respondent1.emailAddress.emailAddress,
  }),
  t(`COMMON.VARIATION.${emailOption.toUpperCase()}`, {lng: getLng(lang)}),
  constructResponseUrlWithIdParams(claimId, MEDIATION_EMAIL_CONFIRMATION_URL), changeLabel(lang)));
  if (emailOption === YesNo.NO) {
    mediationSection.summaryList.rows.push(summaryRow(t('COMMON.CONTACT_EMAIL', {lng: getLng(lang)}),
      isClaimantResponse ? claim.claimantResponse.mediationCarm.alternativeMediationEmail.alternativeEmailAddress : claim.mediationCarm.alternativeMediationEmail.alternativeEmailAddress,
      constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_EMAIL_URL), changeLabel(lang)));
  }
  //UNAVAILABILITY SECTION
  const unavailabilityOption = isClaimantResponse ? claim.claimantResponse.mediationCarm.hasUnavailabilityNextThreeMonths.option : claim.mediationCarm.hasUnavailabilityNextThreeMonths.option;
  mediationSection.summaryList.rows.push(summaryRow(t('PAGES.UNAVAILABILITY_NEXT_THREE_MONTHS_MEDIATION_CONFIRMATION.PAGE_TEXT', {lng: getLng(lang)}),
    t(`COMMON.VARIATION.${unavailabilityOption.toUpperCase()}`, {lng: getLng(lang)}),
    constructResponseUrlWithIdParams(claimId, MEDIATION_NEXT_3_MONTHS_URL), changeLabel(lang)));
  if (unavailabilityOption === YesNo.YES) {
    const hasUnavailableDatesMediation = isClaimantResponse ? getListOfUnavailableDate(claim.claimantResponse.mediationCarm.unavailableDatesForMediation, getLng(lang))
      : getListOfUnavailableDate(claim.mediationCarm.unavailableDatesForMediation, getLng(lang));
    mediationSection.summaryList.rows.push(summaryRow(
      t('COMMON.UNAVAILABLE_DATES', {lang}),
      ` ${[...hasUnavailableDatesMediation].join('<br>')}`,
      constructResponseUrlWithIdParams(claimId, MEDIATION_UNAVAILABLE_SELECT_DATES_URL),
      changeLabel(lang),
    ));
  }
  return mediationSection;
};
