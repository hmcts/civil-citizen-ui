import {HasAnythingChangedForm} from 'common/models/caseProgression/trialArrangements/hasAnythingChangedForm';
import {YesNo} from 'form/models/yesNo';

describe('hasAnythingChangedForm', () => {
  describe('option and textArea', () => {
    it('should be defined when constructed with a valid option and textArea', async () => {
      //Given
      const validOption = YesNo.YES;
      const validTextArea = 'some text';

      //when
      const hasAnythingChangedForm = new HasAnythingChangedForm(validOption,validTextArea);

      //Then
      expect(hasAnythingChangedForm.option).toBe(validOption);
      expect(hasAnythingChangedForm.textArea).toBe(validTextArea);
    });
  });
});
