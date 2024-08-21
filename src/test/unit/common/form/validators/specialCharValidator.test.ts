import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {SpecialCharValidator} from 'form/validators/specialCharValidator';

describe('SpecialCharValidator', () => {
  const validator = new SpecialCharValidator();
  describe('isJudgmentOnlineLive flag OFF', () => {
    it('should return true for a string with invalid characters and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result = await validator.validate('Invalid ˆ ` ´ ¨ chars');
      //Then
      expect(result).toEqual(true);
    });
  });

  describe('isJudgmentOnlineLive flag ON', () => {
    it('should return true for a string with valid characters and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      //When
      const result = await validator.validate('Valid string');
      //Then
      expect(result).toEqual(true);
    });
    it('should return false for a string with invalid characters and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      //When
      const result = await validator.validate('Invalid ˆ ` ´ ¨ chars');
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.SPECIAL_CHARACTERS');
    });
  });
});
