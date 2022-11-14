import {toAgreedMediation} from '../../../../../main/services/translation/response/convertToCCDAgreedMediation';
import {YesNo, YesNoUpperCamelCase} from '../../../../../main/common/form/models/yesNo';

describe('translate mediation option to ccd version', ()=> {
  it('should transfer mediation to ccd version if can we use is yes', ()=> {
    //Given
    const mediation = {
      canWeUse: {option: YesNo.YES},
      companyTelephoneNumber: {},
    };
    //When
    const result = toAgreedMediation(mediation);
    //Then
    expect(result).toBe(YesNoUpperCamelCase.YES);
  });
  it('should transfer mediation to ccd version if disagree is yes', ()=> {
    //Given
    const mediation = {
      canWeUse: {},
      mediationDisagreement: {option: YesNo.YES},
      companyTelephoneNumber: {},
    };
    //When
    const result = toAgreedMediation(mediation);
    //Then
    expect(result).toBe(YesNoUpperCamelCase.NO);
  });
  it('should transfer mediation to ccd version if there is phone number', ()=> {
    //Given
    const mediation = {
      canWeUse: {},
      mediationDisagreement: {},
      companyTelephoneNumber: {
        mediationContactPerson : 'test',
        mediationPhoneNumber : '123',
      },
    };
    //When
    const result = toAgreedMediation(mediation);
    //Then
    expect(result).toBe(YesNoUpperCamelCase.YES);
  });
  it('should transfer mediation to ccd version if there is no phone number', ()=> {
    //Given
    const mediation = {
      canWeUse: {},
      mediationDisagreement: {},
      companyTelephoneNumber: {},
    };
    //When
    const result = toAgreedMediation(mediation);
    //Then
    expect(result).toBe(YesNoUpperCamelCase.YES);
  });
});
