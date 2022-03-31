import {convertFromYesNo, convertToYesNo} from '../../../../main/common/utils/yesNoOptionConverter';
import {YesNo} from '../../../../main/common/form/models/yesNo';

describe('yes no option converter', () => {
  describe('convertToYesNo', () => {
    it('should return undefined when boolean parameter is undefined', () => {
      //When
      const result = convertToYesNo(undefined);
      //Then
      expect(result).toBeUndefined();
    });
    it('should return YES when boolean parameter is true', () => {
      //When
      const result = convertToYesNo(true);
      //Then
      expect(result).toBe(YesNo.YES);
    });
    it('should return NO when boolean parameter is false', () => {
      //When
      const result = convertToYesNo(false);
      //Then
      expect(result).toBe(YesNo.NO);
    });
  });
  describe('convertFromYesNo', () => {
    it('should return true when option is Yes', () => {
      //When
      const result = convertFromYesNo(YesNo.YES);
      //Then
      expect(result).toBeTruthy();
    });
    it('should return false when option is No', () => {
      //When
      const result = convertFromYesNo(YesNo.NO);
      //Then
      expect(result).toBeFalsy();
    });
    it('should return undefined when option is undefined', () => {
      //When
      const result = convertFromYesNo(undefined);
      //Then
      expect(result).toBeUndefined();
    });
  });
});
