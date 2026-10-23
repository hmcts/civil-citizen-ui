import {getEmployers, saveEmployers} from 'services/features/response/statementOfMeans/employment/employerService';
import * as draftStoreService from '../../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {Employer} from 'form/models/statementOfMeans/employment/employer';
import {Employers} from 'form/models/statementOfMeans/employment/employers';

jest.mock('../../../../../../../main/modules/draft-store/draftStoreService', () => ({getCaseDataFromStore: jest.fn(), saveDraftClaim: jest.fn()}));

const claimId = '123';

describe('employerService', () => {
  let writes: {key: string; claim: Claim}[];

  beforeEach(() => {
    jest.resetAllMocks();
    writes = [];
    jest.mocked(draftStoreService.saveDraftClaim).mockImplementation(async (key, claim) => {
      writes.push({key, claim: structuredClone(claim)});
    });
  });
  describe('getEmployers', () => {
    it('should return empty employer row when no data', async () => {
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockResolvedValue(new Claim());

      const result = await getEmployers(claimId);

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].employerName).toBeUndefined();
    });

    it('should return employers when data exists', async () => {
      const claim = new Claim();
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.employers = new Employers([
        new Employer('Acme', 'Developer'),
        new Employer('Beta', 'Manager'),
      ]);
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockResolvedValue(claim);

      const result = await getEmployers(claimId);

      expect(result.rows).toHaveLength(2);
      expect(result.rows[0].employerName).toEqual('Acme');
      expect(result.rows[0].jobTitle).toEqual('Developer');
      expect(result.rows[1].employerName).toEqual('Beta');
      expect(result.rows[1].jobTitle).toBe('Manager');
    });

    it('should rethrow error when store fails', async () => {
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockRejectedValue(new Error('Redis failure'));

      await expect(getEmployers(claimId)).rejects.toThrow('Redis failure');
    });
  });

  describe('saveEmployers', () => {
    it('should filter empty employers and save', async () => {
      const claim = new Claim();
      claim.id = claimId;
      claim.totalClaimAmount = 1300;
      claim.statementOfMeans = new StatementOfMeans();
      claim.statementOfMeans.employers = new Employers([new Employer('Previous employer', 'Previous role')]);
      const expected = structuredClone(claim);
      expected.statementOfMeans.employers = structuredClone(new Employers([new Employer('Acme', 'Developer')]));
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockResolvedValue(claim);

      await saveEmployers(claimId, new Employers([
        new Employer('Acme', 'Developer'),
        new Employer('', ''),
        new Employer('Beta', ''),
      ]));

      expect(writes).toEqual([{key: claimId, claim: expected}]);
      expect(draftStoreService.saveDraftClaim).toHaveBeenCalledTimes(1);
      expect(claim.statementOfMeans.employers.rows).toHaveLength(1);
      expect(claim.statementOfMeans.employers.rows).toEqual([new Employer('Acme', 'Developer')]);
    });

    it('should create statementOfMeans when missing', async () => {
      const claim = new Claim();
      claim.id = claimId;
      claim.totalClaimAmount = 1300;
      const expected = structuredClone(claim);
      expected.statementOfMeans = structuredClone(new StatementOfMeans());
      expected.statementOfMeans.employers = structuredClone(new Employers([new Employer('Acme', 'Dev')]));
      const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
      mockGetCaseData.mockResolvedValue(claim);

      await saveEmployers(claimId, new Employers([new Employer('Acme', 'Dev')]));

      expect(writes).toEqual([{key: claimId, claim: expected}]);
      expect(draftStoreService.saveDraftClaim).toHaveBeenCalledTimes(1);
      expect(claim.statementOfMeans.employers.rows[0].employerName).toEqual('Acme');
    });

    it('should rethrow error when save fails', async () => {
      jest.mocked(draftStoreService.getCaseDataFromStore).mockResolvedValue(new Claim());
      jest.mocked(draftStoreService.saveDraftClaim).mockRejectedValue(new Error('Save failure'));

      await expect(saveEmployers(claimId, new Employers([new Employer('A', 'B')])))
        .rejects.toThrow('Save failure');
    });
  });
});
