import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {FullNameValidator} from 'form/validators/fullNameValidator';

describe('FullNameValidator', () => {
  const validator = new FullNameValidator();

  describe('validate', () => {
    it('should return true for a 70 char full name and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      //When
      const result = await validator.validate(' ', {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: 70}
        , property: '', targetName: '', value: undefined});
      //Then
      expect(result).toEqual(true);
    });
    it('should return false for a 71 char full name and flag ON', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(true);
      //When
      const result1 = await validator.validate(' ', {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: 71}
        , property: '', targetName: '', value: undefined});
      const defaultMessage = await validator.defaultMessage();
      //Then
      expect(result1).toEqual(false);
      expect(defaultMessage).toEqual('ERRORS.TEXT_TOO_MANY');
    });
    it('should return true for a 71 char full name and flag OFF', async () => {
      //Given
      jest.spyOn(launchDarkly, 'isJudgmentOnlineLive').mockResolvedValue(false);
      //When
      const result1 = await validator.validate(' ', {
        constraints: ['nameLength', 'ERRORS.TEXT_TOO_MANY'], object: {nameLength: 71}
        , property: '', targetName: '', value: undefined});
      //Then
      expect(result1).toEqual(true);
    });
  });
});
