import {Claim} from 'common/models/claim';
import {Mediation} from 'models/mediation/mediation';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {toCCDMediation} from 'services/translation/response/convertToCCDMediation';
import {CCDMediation} from 'models/ccdResponse/ccdMediation';

describe('translate Mediation to CCD model', () => {
  const claim = new Claim();
  claim.mediation= new Mediation({ option: YesNo.NO, mediationPhoneNumber: '666555444' }, { option: YesNo.YES }, {iDoNotWantMediationReason: 'test', otherReason: 'reason'}, {option: YesNo.YES, mediationPhoneNumberConfirmation: '111222333', mediationContactPerson: 'lawyer', mediationPhoneNumber: '222444666'});

  it('should return undefined if mediation doesnt exist', () => {
    const claimEmpty = new Claim();
    const mediationResponseCCD = toCCDMediation(claimEmpty.mediation);
    expect(mediationResponseCCD).toBe(undefined);
  });

  it('should translate CUI Mediation model to CCD Mediation model', () => {
    const mediationCCD: CCDMediation=
      {
        canWeUseMediationLiP: YesNoUpperCamelCase.NO,
        canWeUseMediationPhoneLiP: '666555444',
        mediationDisagreementLiP: YesNoUpperCamelCase.YES,
        noMediationReasonLiP: 'test',
        noMediationOtherReasonLiP: 'reason',
        companyTelephoneOptionMediationLiP: YesNoUpperCamelCase.YES,
        companyTelephoneConfirmationMediationLiP: '111222333',
        companyTelephoneContactPersonMediationLiP: 'lawyer',
        companyTelephonePhoneNumberMediationLiP: '222444666',
      };
    const mediationResponseCCD = toCCDMediation(claim.mediation);
    expect(mediationResponseCCD).toMatchObject(mediationCCD);
  });
});
