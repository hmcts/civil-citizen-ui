import {
  toCCDYesNo,
  toCCDYesNoFromBoolean,
  toCCDYesNoFromGenericYesNo, toCCDYesNoReverse,
} from 'services/translation/response/convertToCCDYesNo';
import {YesNo, YesNoUpperCamelCase} from 'common/form/models/yesNo';
import {GenericYesNo} from 'form/models/genericYesNo';

describe('translate YesNo to CCD model', () => {

  it('should return Yes', () => {
    const yesNoResponseCCD = toCCDYesNo(YesNo.YES);
    expect(yesNoResponseCCD).toBe(YesNoUpperCamelCase.YES);
  });

  it('should return No', () => {
    const yesNoResponseCCD = toCCDYesNo(YesNo.NO);
    expect(yesNoResponseCCD).toBe(YesNoUpperCamelCase.NO);
  });

  it('should return undefined', () => {
    const yesNoResponseCCD = toCCDYesNo(undefined);
    expect(yesNoResponseCCD).toBe(undefined);
  });
});

describe('translate YesNo to CCD model From Boolean', () => {

  it('should return Yes', () => {
    const yesNoResponseCCD = toCCDYesNoFromBoolean(true);
    expect(yesNoResponseCCD).toBe(YesNoUpperCamelCase.YES);
  });

  it('should return No', () => {
    const yesNoResponseCCD = toCCDYesNoFromBoolean(false);
    expect(yesNoResponseCCD).toBe(YesNoUpperCamelCase.NO);
  });

  it('should return undefined', () => {
    const yesNoResponseCCD = toCCDYesNoFromBoolean(undefined);
    expect(yesNoResponseCCD).toBe(undefined);
  });
});

describe('translate YesNo to CCD model From Generic YesNo', () => {

  it('should return Yes', () => {
    const genericYes = new GenericYesNo(YesNo.YES);
    const yesNoResponseCCD = toCCDYesNoFromGenericYesNo(genericYes);
    expect(yesNoResponseCCD).toBe(YesNoUpperCamelCase.YES);
  });

  it('should return No', () => {
    const genericNo = new GenericYesNo(YesNo.NO);
    const yesNoResponseCCD = toCCDYesNoFromGenericYesNo(genericNo);
    expect(yesNoResponseCCD).toBe(YesNoUpperCamelCase.NO);
  });

  it('should return undefined', () => {
    const yesNoResponseCCD = toCCDYesNoFromGenericYesNo(undefined);
    expect(yesNoResponseCCD).toBe(undefined);
  });

  describe('translate YesNo to CCD model Reverse', () => {

    it('should return Yes', () => {
      const yesNoResponseCCD = toCCDYesNoReverse(YesNo.YES);
      expect(yesNoResponseCCD).toBe(YesNoUpperCamelCase.NO);
    });

    it('should return No', () => {
      const yesNoResponseCCD = toCCDYesNoReverse(YesNo.NO);
      expect(yesNoResponseCCD).toBe(YesNoUpperCamelCase.YES);
    });

    it('should return undefined', () => {
      const yesNoResponseCCD = toCCDYesNoReverse(undefined);
      expect(yesNoResponseCCD).toBe(undefined);
    });
  });
});

