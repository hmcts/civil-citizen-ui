import {Mediation} from 'models/mediation/mediation';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';
import {NoMediationReason} from 'form/models/mediation/noMediationReason';
import {CompanyTelephoneNumber} from 'form/models/mediation/companyTelephoneNumber';
import {toCUIClaimantMediation} from 'services/translation/convertToCUI/convertToCUIClaimantMediation';
import {CCDClaimantMediationLip} from 'models/claimantResponse/ccdClaimantResponse';
describe('translate CCDMediation to CUI Mediation model', () => {

  it('should return undefined if CCDClaimantMediation doesnt exist', () => {
    const mediationCCD: CCDClaimantMediationLip = undefined;
    const claimantMediationCUI = toCUIClaimantMediation(mediationCCD);
    expect(claimantMediationCUI).toBe(undefined);
  });

  it('should translate CCD Mediation model to CUI Mediation model', () => {
    const mediationCCD: CCDClaimantMediationLip=
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

    const mediation : Mediation = new Mediation();
    mediation.canWeUse = { option: YesNo.NO, mediationPhoneNumber: '666555444' };
    mediation.mediationDisagreement = new GenericYesNo(YesNo.YES);
    mediation.noMediationReason = new NoMediationReason('test', 'reason');
    mediation.companyTelephoneNumber = new CompanyTelephoneNumber(YesNo.YES, '222444666', 'lawyer', '111222333');

    const claimantMediationCUI = toCUIClaimantMediation(mediationCCD);
    expect(claimantMediationCUI).toMatchObject(mediation);
  });
});

