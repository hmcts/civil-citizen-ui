import {
  getEmploymentForm,
  saveEmploymentData,
} from 'services/features/response/statementOfMeans/employment/employmentService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from '../common/models/claim';
import {StatementOfMeans} from '../common/models/statementOfMeans';
import {
  EmploymentCategory,
} from '../common/form/models/statementOfMeans/employment/employmentCategory';
import {EmploymentForm} from '../common/form/models/statementOfMeans/employment/employmentForm';
import {YesNo} from '../common/form/models/yesNo';
import {GenericForm} from '../common/form/models/genericForm';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');

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
      expect(result.model.option).toBeUndefined();
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
      expect(result.model.option).toBeTruthy();
      expect(result.model.employmentCategory.length).toBe(1);
    });
  });
  describe('save employment data', () => {
    it('should save data successfully', async () => {
      //Given
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveEmploymentData('123', new GenericForm(new EmploymentForm(YesNo.YES, [EmploymentCategory.EMPLOYED])));
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
