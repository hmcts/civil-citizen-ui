import config from 'config';
import {CivilServiceClient} from '../../../../../../main/app/client/civilServiceClient';
import axios, {AxiosInstance} from 'axios';
import { Claim } from '../../../../../../main/common/models/claim';
import { Respondent } from '../../../../../../main/common/models/respondent';

import { app } from '../../../../../../main/app';
import request from 'supertest';
import { CLAIM_DETAILS_URL } from '../../../../../../main/routes/urls';

const nock = require('nock');

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;


const respondent1: Respondent = {
  primaryAddress: {
    county: 'Greater London',
    country: 'UK',
    postCode: 'SW1H 9AJ',
    postTown: 'London',
    addressLine1: 'Flat 3A Middle Road',
    addressLine2: '',
    addressLine3: '',
  },
  correspondenceAddress: {
    county: '',
    country: '',
    postCode: '',
    postTown: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
  },
  individualTitle: 'Mrs.',
  individualLastName: 'Mary',
  individualFirstName: 'Richards',
  telephoneNumber: '0208339922',
  dateOfBirth: new Date('2022-01-24T15:59:59'),
  responseType: '',
};
const mockResponse: Claim = {
  legacyCaseReference: '497MC585',
  applicant1:
    {
      individualTitle: 'Mrs',
      individualLastName: 'Clark',
      individualFirstName: 'Jane',
    },
  totalClaimAmount: 110,
  respondent1ResponseDeadline: new Date('2022-01-24T15:59:59'),
  detailsOfClaim: 'the reason i have given',
  respondent1: respondent1,
  individualTitle: 'string',
  individualLastName: 'string',
  individualFirstName: 'string',
  formattedResponseDeadline: function (): string {
    throw new Error('Function not implemented.');
  },
  formattedTotalClaimAmount: function (): string {
    throw new Error('Function not implemented.');
  },
};

describe('Confirm Details page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    it('should return claim data', async () => {

      const mockGet = jest.fn().mockResolvedValue({data: mockResponse});
      mockedAxios.create.mockReturnValueOnce({ get: mockGet } as unknown as AxiosInstance);

      const civilServiceClient = new CivilServiceClient('http://localhost/case/1643033241924739/response/claim-details');

      const actualClaims: Claim = await civilServiceClient.retrieveClaimDetails('1643033241924739');

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost/case/1643033241924739/response/claim-details',
      });

      nock('http://localhost')
        .get('/case/1643033241924739/response/claim-details')
        .reply(200, { mockResponse: mockResponse });

      expect(actualClaims.legacyCaseReference).toEqual(mockResponse.legacyCaseReference);
      expect(actualClaims.totalClaimAmount).toEqual(mockResponse.totalClaimAmount);
      expect(actualClaims.detailsOfClaim).toEqual(mockResponse.detailsOfClaim);

    });
  });

  describe('on Get', () => {
    test('should return your claim details page', async () => {
      await request(app)
        .get(CLAIM_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claim details');
        });
    });
  });
});
