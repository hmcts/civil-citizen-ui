import {
  getEmploymentForm,
  saveEmploymentData,
} from '../../../../../main/modules/statementOfMeans/employment/employmentService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {StatementOfMeans} from '../../../../../main/common/models/statementOfMeans';
import {
  EmploymentCategory,
} from '../../../../../main/common/form/models/statementOfMeans/employment/employmentCategory';
import {EmploymentStatus} from '../../../../../main/common/form/models/statementOfMeans/employment/employmentStatus';
import {YesNo} from '../../../../../main/common/form/models/yesNo';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('employment service', () => {
  describe('get employment form model', () => {
    it('should return an empty form model when no data retrieved', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      //When
      const result = await getEmploymentForm('123');
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result.option).toBeUndefined();
    });
    it('should return populated form model when data exists', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      const claim = createClaim();
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockImplementation(async () => {
        return claim;
      });
      //When
      const result = await getEmploymentForm('123');
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(result).not.toBeNull();
      expect(result.option).toBeTruthy();
      expect(result.employmentCategory.length).toBe(1);
    });
  });
  describe('save employment data', () => {
    it('should save data successfully', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveEmploymentData('123', new EmploymentStatus(YesNo.YES, [EmploymentCategory.EMPLOYED]));
      //Then
      expect(spySave).toBeCalled();
    });
  });
});

function createClaim() {
  const claim = new Claim();
  const statementOfMeans = new StatementOfMeans();
  statementOfMeans.employment = {
    declared: true,
    employmentType: [EmploymentCategory.EMPLOYED],
  };
  claim.statementOfMeans = statementOfMeans;
  return claim;
}
