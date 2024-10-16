import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {MaxLengthValidator} from 'form/validators/maxLengthValidator';

const string51charLong = 'This is a 51 char address aAbBcCdDeEfFgGhHiIjJkKlLm';
const string50charLong = 'This is a 50 char address aAbBcCdDeEfFgGhHiIjJkKlL';
const string36charLong = 'This is a 36 char address aAbBcCdDeE';
const string35charLong = ' This is a 35 char address aAbBcCdDe ';

describe('MaxLengthValidator', () => {
  const validator = new MaxLengthValidator();
  describe('isJudgmentOnlineLive flag OFF', () => {
    it('should return true for addressLine1 with 51 chars and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result = await validator.validate(string50charLong, {
        constraints: [''], object: undefined
        , property: 'addressLine1', targetName: '', value: undefined});
      //Then
      expect(result).toEqual(true);
    });
    it('should return true for addressLine2 with 50 chars and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result = await validator.validate(string50charLong, {
        constraints: [''], object: undefined
        , property: 'addressLine2', targetName: '', value: undefined});
      //Then
      expect(result).toEqual(true);
    });
    it('should return true for addressLine3 with 0 chars and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result = await validator.validate('', {
        constraints: [''], object: undefined
        , property: 'addressLine3', targetName: '', value: undefined});
      //Then
      expect(result).toEqual(true);
    });
    it('should return true for city with 50 chars and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result = await validator.validate(string50charLong, {
        constraints: [''], object: undefined
        , property: 'city', targetName: '', value: undefined});
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for addressLine2 with 51 chars and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result = await validator.validate(string51charLong, {
        constraints: [''], object: undefined
        , property: 'addressLine2', targetName: '', value: undefined});
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY');
    });
    it('should return false for addressLine3 with 51 chars and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result = await validator.validate(string51charLong, {
        constraints: [''], object: undefined
        , property: 'addressLine3', targetName: '', value: undefined});
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY');
    });
    it('should return false for city with 51 chars and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result = await validator.validate(string51charLong, {
        constraints: [''], object: undefined
        , property: 'city', targetName: '', value: undefined});
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.TOWN_CITY_TOO_MANY');
    });
  });

  describe('isJudgmentOnlineLive flag ON', () => {
    it('should return true for addressLine1 with 35 chars and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      //When
      const result = await validator.validate(string35charLong, {
        constraints: [''], object: undefined
        , property: 'addressLine1', targetName: '', value: undefined});
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for addressLine1 with 36 chars and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      //When
      const result = await validator.validate(string36charLong, {
        constraints: [''], object: undefined
        , property: 'addressLine1', targetName: '', value: undefined});
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.ADDRESS_LINE_TOO_MANY_JO');
    });
    it('should return false for city with 36 chars and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      //When
      const result = await validator.validate(string36charLong, {
        constraints: [''], object: undefined
        , property: 'city', targetName: '', value: undefined});
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.TOWN_CITY_TOO_MANY_JO');
    });
  });
});
