import {toCUIMediationCarm} from 'services/translation/convertToCUI/convertToCUIMediationCarm';
import {CcdMediationCarm} from 'models/ccdResponse/ccdMediationCarm';
import {YesNo, YesNoUpperCamelCase} from 'form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';
import {AlternativeContactPerson} from 'form/models/mediation/alternativeContactPerson';
import {AlternativeEmailAddress} from 'form/models/mediation/AlternativeEmailAddress';
import {AlternativeTelephone} from 'form/models/mediation/AlternativeTelephone';

describe('toCUIMediationCarm', () => {
  it('should return undefined when ccd mediation carm is missing', () => {
    expect(toCUIMediationCarm(undefined)).toBeUndefined();
  });

  it('should translate ccd mediation carm fields to cui model', () => {
    const ccdMediationCarm: CcdMediationCarm = {
      isMediationContactNameCorrect: YesNoUpperCamelCase.NO,
      alternativeMediationContactPerson: 'Alt Person',
      isMediationEmailCorrect: YesNoUpperCamelCase.NO,
      alternativeMediationEmail: 'alt@example.com',
      isMediationPhoneCorrect: YesNoUpperCamelCase.YES,
      alternativeMediationTelephone: '07123456789',
      hasUnavailabilityNextThreeMonths: YesNoUpperCamelCase.YES,
    };

    const result = toCUIMediationCarm(ccdMediationCarm);

    expect(result.isMediationContactNameCorrect).toEqual(new GenericYesNo(YesNo.NO));
    expect(result.alternativeMediationContactPerson).toEqual(new AlternativeContactPerson('Alt Person'));
    expect(result.isMediationEmailCorrect).toEqual(new GenericYesNo(YesNo.NO));
    expect(result.alternativeMediationEmail).toEqual(new AlternativeEmailAddress('alt@example.com'));
    expect(result.isMediationPhoneCorrect).toEqual(new GenericYesNo(YesNo.YES));
    expect(result.alternativeMediationTelephone).toEqual(new AlternativeTelephone('07123456789'));
    expect(result.hasUnavailabilityNextThreeMonths).toEqual(new GenericYesNo(YesNo.YES));
  });
});
