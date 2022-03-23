import {saveFormToDraftStore} from '../../../../../main/modules/statementOfMeans/dependants/dependantTeenagersService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {
  DependantTeenagers,
} from '../../../../../main/common/form/models/statementOfMeans/dependants/dependantTeenagers';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
describe('dependent teenagers service test', () => {
  describe('saveFormToDraftStore', () => {
    it('should save data successfully', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveFormToDraftStore('123', new DependantTeenagers(3, 4));
      //Then
      expect(spySave).toBeCalled();
    });
  });
});
