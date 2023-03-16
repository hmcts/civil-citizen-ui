import {PartyType} from 'models/partyType';
import {PartyTypeSelection} from 'common/form/models/claim/partyTypeSelection';

describe('PartyTypeSelection', () => {
  describe('option', () => {
    it('should be defined when constructed with a valid option', async () => {
      //Given
      const validOption = PartyType.INDIVIDUAL;

      //when
      const partyTypeSelection = new PartyTypeSelection(validOption);

      //Then
      expect(partyTypeSelection.option).toBe(validOption);
    });
  });
});
