import config from 'config';
import {CivilServiceClient} from '../../../../../../main/app/client/civilServiceClient';
import axios, {AxiosInstance} from 'axios';
import { Claim } from '../../../../../../main/common/models/claim';

const nock = require('nock');

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Confirm Details page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    it('should return your claim details page', async () => {
      const mockResponse = {
        legacyCaseReference: '497MC585',
        applicant1:
          {
            type: 'INDIVIDUAL',
            individualTitle: 'Mrs',
            individualLastName: 'Clark',
            individualFirstName: 'Jane',
          },
        totalClaimAmount: 110,
        respondent1ResponseDeadline: '2022-01-24T15:59:59',
        detailsOfClaim: 'the reason i have given',
      };

      const mockGet = jest.fn().mockResolvedValue({data: mockResponse});
      mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);

      const civilServiceClient = new CivilServiceClient('http://localhost');

      const actualClaims: Claim = await civilServiceClient.retrieveClaimDetails('1643033241924739');

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost',
      });

      nock('http://localhost')
        .get('/case/1643033241924739/response/claim-details')
        .reply(200, { mockResponse: mockResponse });

      expect(mockGet.mock.calls[0][0]).toEqual('/cases/1643033241924739');
      expect(actualClaims.legacyCaseReference).toEqual(mockResponse.legacyCaseReference);
      expect(actualClaims.totalClaimAmount).toEqual(mockResponse.totalClaimAmount);
      expect(actualClaims.detailsOfClaim).toEqual(mockResponse.detailsOfClaim);
    });
  });
});
