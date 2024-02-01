import {
  createClaimWithMediationSectionWithOption,
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

  it('should return response mediation when all option are no and carm is applicable', async () => {
    //When
    const claim = createClaimWithMediationSectionWithOption(YesNo.NO);
    const expectedMediationSection = getMediationSection(claim, constVal.CLAIM_ID, 'en');
    const summarySections =  buildMediationSection(claim, constVal.CLAIM_ID, 'en');
    //Then
    expect(expectedMediationSection).toStrictEqual(summarySections);
  });

  it('should return response mediation when all option are yes and carm is applicable', async () => {
    //When
    const claim = createClaimWithMediationSectionWithOption(YesNo.YES);
    const expectedMediationSection = getMediationSection(claim, constVal.CLAIM_ID, 'en');
    const summarySections =  buildMediationSection(claim, constVal.CLAIM_ID, 'en');
    //Then
    expect(expectedMediationSection).toStrictEqual(summarySections);
  });

  it('should return response mediation when all option are no and carm is applicable when defendant is company', async () => {
    //When
    const claim = createClaimWithMediationSectionWithOption(YesNo.NO, true);
    const expectedMediationSection = getMediationSection(claim, constVal.CLAIM_ID, 'en');
    const summarySections =  buildMediationSection(claim, constVal.CLAIM_ID, 'en');
    //Then
    expect(expectedMediationSection).toStrictEqual(summarySections);
  });

  it('should return response mediation when all option are yes and carm is applicable when defendant is company', async () => {
    //When
    const claim = createClaimWithMediationSectionWithOption(YesNo.YES, true);
    const expectedMediationSection = getMediationSection(claim, constVal.CLAIM_ID, 'en');
    const summarySections =  buildMediationSection(claim, constVal.CLAIM_ID, 'en');
    //Then
    expect(expectedMediationSection).toStrictEqual(summarySections);
  });
});

const getMediationSection = (claim: Claim, claimId: string, lang: string) => {
  const changeLabel = (lang: string): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});

  const mediationSection = summarySection({
    title: t('COMMON.AVAILABILITY_FOR_MEDIATION', {lng: getLng(lang)}),
    summaryRows: [],
  });
    //CONTACT NAME SECTION
  if (claim.isBusiness()) {
    mediationSection.summaryList.rows.push(summaryRow(t('PAGES.MEDIATION_CONTACT_PERSON_CONFIRMATION.PAGE_TEXT_DEFENDANT', {
      lng: getLng(lang),
      defendantContactPerson: claim.respondent1.partyDetails.contactPerson,
    }),
    t(`COMMON.VARIATION_2.${claim.mediation.isMediationContactNameCorrect.option.toUpperCase()}`, {lng: getLng(lang)}),
    constructResponseUrlWithIdParams(claimId, MEDIATION_CONTACT_PERSON_CONFIRMATION_URL), changeLabel(lang)));
    if (claim.mediation.isMediationContactNameCorrect.option === YesNo.NO) {
      mediationSection.summaryList.rows.push(summaryRow(t('COMMON.CONTACT_NAME', {lng: getLng(lang)}),
        claim.mediation.alternativeMediationContactPerson.alternativeContactPerson,
        constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL), changeLabel(lang)));
    }
  }
  //PHONE SECTION
  mediationSection.summaryList.rows.push(summaryRow(t('PAGES.MEDIATION_PHONE_CONFIRMATION.PAGE_TEXT', {
    lng: getLng(lang),
    defendantPhone: claim.respondent1.partyPhone.phone,
  }),
  t(`COMMON.VARIATION_2.${claim.mediation.isMediationPhoneCorrect.option.toUpperCase()}`, {lng: getLng(lang)}),
  constructResponseUrlWithIdParams(claimId, MEDIATION_PHONE_CONFIRMATION_URL), changeLabel(lang)));
  if (claim.mediation.isMediationPhoneCorrect.option === YesNo.NO) {
    mediationSection.summaryList.rows.push(summaryRow(t('COMMON.CONTACT_NUMBER', {lng: getLng(lang)}),
      claim.mediation.alternativeMediationTelephone.alternativeTelephone,
      constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_PHONE_URL), changeLabel(lang)));
  }
  //EMAIL SECTION
  mediationSection.summaryList.rows.push(summaryRow(t('PAGES.MEDIATION_EMAIL_CONFIRMATION.PAGE_TEXT', {
    lng: getLng(lang),
    defendantEmail: claim.respondent1.emailAddress.emailAddress,
  }),
  t(`COMMON.VARIATION_2.${claim.mediation.isMediationEmailCorrect.option.toUpperCase()}`, {lng: getLng(lang)}),
  constructResponseUrlWithIdParams(claimId, MEDIATION_EMAIL_CONFIRMATION_URL), changeLabel(lang)));
  if (claim.mediation.isMediationEmailCorrect.option === YesNo.NO) {
    mediationSection.summaryList.rows.push(summaryRow(t('COMMON.CONTACT_EMAIL', {lng: getLng(lang)}),
      claim.mediation.alternativeMediationEmail.alternativeEmailAddress,
      constructResponseUrlWithIdParams(claimId, MEDIATION_ALTERNATIVE_EMAIL_URL), changeLabel(lang)));
  }
  //UNAVAILABILITY SECTION
  mediationSection.summaryList.rows.push(summaryRow(t('PAGES.UNAVAILABILITY_NEXT_THREE_MONTHS_MEDIATION_CONFIRMATION.PAGE_TEXT', {lng: getLng(lang)}),
    t(`COMMON.VARIATION_2.${claim.mediation.hasUnavailabilityNextThreeMonths.option.toUpperCase()}`, {lng: getLng(lang)}),
    constructResponseUrlWithIdParams(claimId, MEDIATION_NEXT_3_MONTHS_URL), changeLabel(lang)));
  if (claim.mediation.hasUnavailabilityNextThreeMonths.option === YesNo.YES) {
    const hasUnavailableDatesMediation = getListOfUnavailableDate(claim.mediation.unavailableDatesForMediation, getLng(lang));
    mediationSection.summaryList.rows.push(summaryRow(
      t('COMMON.UNAVAILABLE_DATES', {lang}),
      ` ${[...hasUnavailableDatesMediation].join('<br>')}`,
      constructResponseUrlWithIdParams(claimId, MEDIATION_UNAVAILABLE_SELECT_DATES_URL),
      changeLabel(lang),
    ));
  }
  return mediationSection;
};
