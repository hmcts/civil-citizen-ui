import {CivilServiceClient} from '../../../../main/app/client/civilServiceClient';

import axios, {AxiosInstance} from 'axios';
import {Claim} from '../../../../main/common/models/claim';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DocumentManagementClient', () => {
  it('creates documents', async () => {
    const mockResponse: object = {
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
    };
    const mockGet = jest.fn().mockResolvedValue({data: mockResponse});
    mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);

    const civilServiceClient = new CivilServiceClient('http://localhost');

    const actualClaims: Claim[] = await civilServiceClient.retrieveByDefendantId();

    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost',
    });

    expect(mockGet.mock.calls[0][0]).toEqual('/cases');
    expect(actualClaims.length).toEqual(1);
    expect(actualClaims[0].legacyCaseReference).toEqual('000MC003');
    expect(actualClaims[0].applicant1.individualFirstName).toEqual('Jane');
    expect(actualClaims[0].applicant1.individualLastName).toEqual('Clark');
    expect(actualClaims[0].formattedResponseDeadline()).toEqual('24 January 2022');
  });
});
