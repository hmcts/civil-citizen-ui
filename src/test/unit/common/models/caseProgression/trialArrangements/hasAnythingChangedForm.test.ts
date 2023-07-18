import {HasAnythingChangedForm} from 'common/models/caseProgression/trialArrangements/hasAnythingChangedForm';
import {YesNo} from 'form/models/yesNo';

describe('hasAnythingChangedForm', () => {
  describe('option', () => {
    it('should be defined when constructed with a valid option', async () => {
      //Given
      const validOption = YesNo.YES;

      //when
      const hasAnythingChangedForm = new HasAnythingChangedForm(validOption);

      //Then
      expect(hasAnythingChangedForm.option).toBe(validOption);
    });
  });
});
