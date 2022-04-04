import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {getSelfEmployedAsForm, saveSelfEmployedAsData} from '../../../../../main/modules/statementOfMeans/employment/selfEmployed/selfEmployedAsService'; // saveSelfEmployedAsData
import {Claim} from '../../../../../main/common/models/claim';
import {StatementOfMeans} from '../../../../../main/common/models/statementOfMeans';
import { SelfEmployedAs } from '../../../../../main/common/form/models/statementOfMeans/employment/selfEmployed/selfEmployedAs';
import {REDIS_FAILURE} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const JOB_TITLE = 'Developer';
const ANNUAL_TURNOVER = 70000.22;

describe('Self Employed Service', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  describe('getSelfEmployedAsForm', () => {
    it('should return an empty form when no data exists', async () => {
      //Given
      const spyGetCaseDataFromStore = jest.spyOn(draftStoreService, 'getCaseDataFromStore');
      //When
      const form = await getSelfEmployedAsForm('123');
      //Then
      expect(spyGetCaseDataFromStore).toBeCalled();
      expect(form.jobTitle).toBeUndefined();
      expect(form.annualTurnover).toBeUndefined();
    });
    it('should return an empty form when selfEmployedAs does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        const claim = new Claim();
        claim.statementOfMeans = new StatementOfMeans();
        return claim;
      });
      //When
      const form = await getSelfEmployedAsForm('123');
      //Then
      expect(form.jobTitle).toBeUndefined();
      expect(form.annualTurnover).toBeUndefined();
    });
    it('should return an empty form when when statement of means does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      //When
      const form = await getSelfEmployedAsForm('123');
      //Then
      expect(form.jobTitle).toBeUndefined();
      expect(form.annualTurnover).toBeUndefined();
    });
    it('should return populated form when selfEmployedAs exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return createClaimWithTaxPayments();
      });
      //When
      const form = await getSelfEmployedAsForm('123');
      //Then
      expect(form.jobTitle).toBe(JOB_TITLE);
      expect(form.annualTurnover).toBe(ANNUAL_TURNOVER);
    });
    it('should rethrow error when error occurs', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(REDIS_FAILURE);
      });
      //Then
      await expect(getSelfEmployedAsForm('123')).rejects.toThrow(REDIS_FAILURE);
    });
  });

  describe('saveSelfEmployedAsData', () => {
    it('should save selfEmployedAs data successfully when claim does not exist', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return undefined;
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveSelfEmployedAsData('123', new SelfEmployedAs(JOB_TITLE, ANNUAL_TURNOVER));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should save selfEmployedAs data successfully when claim exists but no statement of means', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await saveSelfEmployedAsData('123', new SelfEmployedAs(JOB_TITLE, ANNUAL_TURNOVER));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should rethrow error when error occurs on get claim', async () => {
      //When
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(REDIS_FAILURE);
      });
      //Then
      await expect(saveSelfEmployedAsData('123', new SelfEmployedAs(JOB_TITLE, ANNUAL_TURNOVER))).rejects.toThrow(REDIS_FAILURE);
    });
    it('should rethrow error when error occurs on save claim', async () => {
      //Given
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(REDIS_FAILURE);
      });
      //Then
      await expect(saveSelfEmployedAsData('123', new SelfEmployedAs(JOB_TITLE, ANNUAL_TURNOVER))).rejects.toThrow(REDIS_FAILURE);
    });
  });

});

function createClaimWithTaxPayments(): Claim {
  const claim = new Claim();
  const statementOfMeans = new StatementOfMeans();
  statementOfMeans.selfEmployedAs = new SelfEmployedAs(JOB_TITLE, ANNUAL_TURNOVER);
  claim.statementOfMeans = statementOfMeans;
  return claim;
}
