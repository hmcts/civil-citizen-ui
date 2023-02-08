import {translateBreathingSpaceToCCD} from 'services/translation/breathingSpace/ccdTranslation';
import {BreathingSpace} from 'models/breathingSpace';
import {req} from '../../../../utils/UserDetails';
import {AppRequest} from 'models/AppRequest';

describe('translate breathing space enter to ccd version', () => {
  it('should translate breathing space to ccd', () => {
    //Given
    const breathingSpace = new BreathingSpace();
    breathingSpace.debtRespiteReferenceNumber = {
      referenceNumber: '0000',
    };
    //When
    const ccdClaim = translateBreathingSpaceToCCD(breathingSpace, req as AppRequest);
    //Then
    expect(ccdClaim.enterBreathing.reference).toBe('0000');
  });

});
