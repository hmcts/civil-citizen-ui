import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {FullNameValidator} from 'form/validators/fullNameValidator';

const string36charLong = 'This is a 36 char address aAbBcCdDeE';
const string35charLong = 'This is a 35 char address aAbBcCdDe';
const string256charLong = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' +
  'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, ' +
  'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in';
const string255charLong = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' +
  'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, ' +
  'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor i';

describe('FullNameValidator', () => {
  const validator = new FullNameValidator();
  describe('isJudgmentOnlineLive flag OFF', () => {
    it('should return true for a 35 char title and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result1 = await validator.validate(string35charLong, {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: undefined}
        , property: 'title', targetName: '', value: ''});
      //Then
      expect(result1).toEqual(true);
    });
    it('should return true for a 255 char firstName and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result1 = await validator.validate(string255charLong, {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: 71}
        , property: 'firstName', targetName: '', value: 'text'});
      //Then
      expect(result1).toEqual(true);
    });
    it('should return true for a 255 char lastName and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result1 = await validator.validate(string255charLong, {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: undefined}
        , property: 'lastName', targetName: '', value: ''});
      //Then
      expect(result1).toEqual(true);
    });

    it('should return false for a 36 char title and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result1 = await validator.validate(string36charLong, {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: undefined}
        , property: 'title', targetName: '', value: ''});
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result1).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.ENTER_VALID_TITLE');
    });
    it('should return false for a 256 char firstName and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result1 = await validator.validate(string256charLong, {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: undefined}
        , property: 'firstName', targetName: '', value: ''});
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result1).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.TEXT_TOO_MANY');
    });
    it('should return false for a 256 char lastName and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result1 = await validator.validate(string256charLong, {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: undefined}
        , property: 'lastName', targetName: '', value: ''});
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result1).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.TEXT_TOO_MANY');
    });
  });

  describe('isJudgmentOnlineLive flag ON', () => {
    it('should return true for a 35 char title and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      //When
      const result1 = await validator.validate(string35charLong, {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: undefined}
        , property: 'title', targetName: '', value: ''});
      //Then
      expect(result1).toEqual(true);
    });
    it('should return true for a 70 char full name and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      //When
      const result = await validator.validate(' ', {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: 70}
        , property: '', targetName: '', value: 'text'});
      //Then
      expect(result).toEqual(true);
    });

    it('should return false for a 36 char title and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      //When
      const result1 = await validator.validate(string36charLong, {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: undefined}
        , property: 'title', targetName: '', value: ''});
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result1).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.ENTER_VALID_TITLE');
    });
    it('should return false for a 71 char full name and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      //When
      const result1 = await validator.validate(' ', {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: 71}
        , property: 'firstName', targetName: '', value: 'text'});
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result1).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.TEXT_TOO_MANY');
    });
  });
});
