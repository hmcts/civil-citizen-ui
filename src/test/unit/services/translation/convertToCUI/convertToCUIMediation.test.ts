import {Mediation} from 'models/mediation/mediation';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDMediation} from 'models/ccdResponse/ccdMediation';
import {toCUIMediation} from 'services/translation/convertToCUI/convertToCUIMediation';
import {CCDRespondentLiPResponse} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {GenericYesNo} from 'form/models/genericYesNo';
import {NoMediationReason} from 'form/models/mediation/noMediationReason';
import {CompanyTelephoneNumber} from 'form/models/mediation/companyTelephoneNumber';
describe('translate CCDMediation to CUI Mediation model', () => {

  it('should return undefined if CCDmediation doesnt exist', () => {
    const respondent1LiPResponse : CCDRespondentLiPResponse = {
      respondent1MediationLiPResponse : undefined,
    };
    const mediationCUI = toCUIMediation(respondent1LiPResponse.respondent1MediationLiPResponse);
    expect(mediationCUI).toBe(undefined);
  });

  it('should translate CCD Mediation model to CUI Mediation model', () => {
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

    const mediation : Mediation = new Mediation();
    mediation.canWeUse = { option: YesNo.NO, mediationPhoneNumber: '666555444' };
    mediation.mediationDisagreement = new GenericYesNo(YesNo.YES);
    mediation.noMediationReason = new NoMediationReason('test', 'reason');
    mediation.companyTelephoneNumber = new CompanyTelephoneNumber(YesNo.YES, '222444666', 'lawyer', '111222333');

    const mediationCUI = toCUIMediation(mediationCCD);
    expect(mediationCUI).toMatchObject(mediation);
  });
});

