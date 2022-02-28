import {CivilServiceClient} from '../../../../main/app/client/civilServiceClient';

import axios, {AxiosInstance} from 'axios';
import {Claim} from '../../../../main/common/models/claim';
import {CASES_URL} from '../../../../main/routes/urls';
import {AppRequest, AppSession} from '../../../../main/common/models/AppRequest';



jest.mock('axios');
jest.mock('AppRequest');
jest.mock('AppSession');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const user : object = {
  accessToken : 'abc',
  id: 'id',
  email: 'dummy@gmail.com',
  givenName: 'John',
  familyName: 'Doe',
  roles: ['civil', 'citizen'],
};


const mockedAppRequest = jest.fn<AppRequest, []>(() => {
  return jest.fn().mockResolvedValue({session : user});
});

describe('Civil Service Client', () => {
  it('retrieve cases', async () => {
    const mockResponse: object = [{
      legacyCaseReference: '000MC003',
      applicant1:
        {
          type: 'INDIVIDUAL',
          individualTitle: 'Mrs',
          individualLastName: 'Clark',
          individualFirstName: 'Jane',
        },
      totalClaimAmount: 1500,
      respondent1ResponseDeadline: '2022-01-24T15:59:59',
    }];
    const mockGet = jest.fn().mockResolvedValue({data: mockResponse});
    mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
    const civilServiceClient = new CivilServiceClient('http://localhost');
    const actualClaims: Claim[] = await civilServiceClient.retrieveByDefendantId(mockedAppRequest);
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost',
    });
    expect(mockGet.mock.calls[0][0]).toEqual(CASES_URL);
    expect(actualClaims.length).toEqual(1);
    expect(actualClaims[0].legacyCaseReference).toEqual('000MC003');
    expect(actualClaims[0].applicant1.individualFirstName).toEqual('Jane');
    expect(actualClaims[0].applicant1.individualLastName).toEqual('Clark');
    expect(actualClaims[0].formattedResponseDeadline()).toEqual('24 January 2022');
    expect(actualClaims[0].formattedTotalClaimAmount()).toEqual('£1,500.00');
  });
});
