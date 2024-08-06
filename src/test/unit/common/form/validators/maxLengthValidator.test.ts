import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {MaxLengthValidator} from 'form/validators/maxLengthValidator';

const string51charLong = 'This is a 51 char address aAbBcCdDeEfFgGhHiIjJkKlLm';
const string50charLong = 'This is a 50 char address aAbBcCdDeEfFgGhHiIjJkKlL';
const string36charLong = 'This is a 36 char address aAbBcCdDeE';
const string35charLong = 'This is a 35 char address aAbBcCdDe';

describe('MaxLengthValidator', () => {
  const validator = new MaxLengthValidator();

  describe('validate', () => {
    it('should return true for a string with 50 chars and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result = await validator.validate(string50charLong, {
        constraints: ['','CUSTOM_MESSAGE'], object: undefined
        , property: '', targetName: '', value: undefined});
      //Then
      expect(result).toEqual(true);
    });
    it('should return true for a string with 35 chars and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      //When
      const result = await validator.validate(string35charLong, {
        constraints: ['','CUSTOM_MESSAGE'], object: undefined
        , property: '', targetName: '', value: undefined});
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for a string with 51 chars and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result = await validator.validate(string51charLong, {
        constraints: ['','CUSTOM_MESSAGE'], object: undefined
        , property: '', targetName: '', value: undefined});
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result).toEqual(false);
      expect(defaultMessage).toEqual('CUSTOM_MESSAGE');
    });
    it('should return false for a string with 36 chars and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      //When
      const result = await validator.validate(string36charLong, {
        constraints: ['','CUSTOM_MESSAGE'], object: undefined
        , property: '', targetName: '', value: undefined});
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result).toEqual(false);
      expect(defaultMessage).toEqual('CUSTOM_MESSAGE');
    });
  });
});
