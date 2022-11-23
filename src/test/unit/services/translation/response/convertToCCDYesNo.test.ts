import {toCCDYesNo} from '../../../../../main/services/translation/response/convertToCCDYesNo';
import {YesNo, YesNoUpperCamelCase} from '../../../../../main/common/form/models/yesNo';

describe('translate YesNo to CCD model', () => {

  it('should return Yes', () => {
    const yesNoResponseCCD = toCCDYesNo(YesNo.YES);
    expect(yesNoResponseCCD).toBe(YesNoUpperCamelCase.YES);
  });

  it('should return No', () => {
    const yesNoResponseCCD = toCCDYesNo(YesNo.NO);
    expect(yesNoResponseCCD).toBe(YesNoUpperCamelCase.NO);
  });
});
