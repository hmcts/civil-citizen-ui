import {Mediation} from 'models/mediation/mediation';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';
import {NoMediationReason} from 'form/models/mediation/noMediationReason';
import {NoMediationReasonOptions} from 'form/models/mediation/noMediationReasonOptions';
import {toCCDClaimantMediation} from 'services/translation/claimantResponse/convertToCCDClaimantMediation';

describe('claimant mediation CCD translation', () => {
  it('distinguishes an absent mediation model', () => {
    expect(toCCDClaimantMediation(undefined)).toBeUndefined();
  });

  it('keeps the complete individual contact and agreement payload', () => {
    const mediation = new Mediation();
    mediation.canWeUse = {option: YesNo.YES, mediationPhoneNumber: '07700900000'};
    mediation.mediationDisagreement = new GenericYesNo(YesNo.NO);
    expect(toCCDClaimantMediation(mediation)).toEqual({
      canWeUseMediationLiP: YesNoUpperCamelCase.YES,
      canWeUseMediationPhoneLiP: '07700900000',
      mediationDisagreementLiP: YesNoUpperCamelCase.NO,
      noMediationReasonLiP: undefined,
      noMediationOtherReasonLiP: undefined,
      companyTelephoneOptionMediationLiP: undefined,
      companyTelephoneConfirmationMediationLiP: undefined,
      companyTelephoneContactPersonMediationLiP: undefined,
      companyTelephonePhoneNumberMediationLiP: undefined,
      hasAgreedFreeMediation: YesNoUpperCamelCase.YES,
    });
  });

  it('preserves the refusal reason and ordinary text without introducing contact fields', () => {
    const mediation = new Mediation();
    mediation.mediationDisagreement = new GenericYesNo(YesNo.YES);
    mediation.noMediationReason = new NoMediationReason(NoMediationReasonOptions.OTHER, 'I need an interpreter & advice');
    expect(toCCDClaimantMediation(mediation)).toEqual({
      canWeUseMediationLiP: undefined,
      canWeUseMediationPhoneLiP: undefined,
      mediationDisagreementLiP: YesNoUpperCamelCase.YES,
      noMediationReasonLiP: 'OTHER',
      noMediationOtherReasonLiP: 'I need an interpreter & advice',
      companyTelephoneOptionMediationLiP: undefined,
      companyTelephoneConfirmationMediationLiP: undefined,
      companyTelephoneContactPersonMediationLiP: undefined,
      companyTelephonePhoneNumberMediationLiP: undefined,
      hasAgreedFreeMediation: YesNoUpperCamelCase.NO,
    });
  });
});
