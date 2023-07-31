import {IsCaseReadyForm} from 'common/models/caseProgression/trialArrangements/isCaseReadyForm';
import {YesNo} from 'form/models/yesNo';

describe('isCaseReadyForm', () => {
  describe('option', () => {
    it('should be defined when constructed with a valid option', async () => {
      //Given
      const validOption = YesNo.YES;

      //when
      const isCaseReadyForm = new IsCaseReadyForm(validOption);

      //Then
      expect(isCaseReadyForm.option).toBe(validOption);
    });
  });
});
