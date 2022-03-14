import {CivilServiceClient} from '../../../../../main/app/client/civilServiceClient';

import axios, {AxiosInstance} from 'axios';
import {Claim} from '../../../../../main/common/models/claim';
import * as requestModels from '../../../../../main/common/models/AppRequest';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;

describe('Claim Details', () => {
  it('retrieve claim details', async () => {
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

    const actualClaims: Claim = await civilServiceClient.retrieveClaimDetails('1643033241924739', mockedAppRequest);

    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost',
    });

    expect(actualClaims.legacyCaseReference).toEqual(mockResponse.legacyCaseReference);
    expect(actualClaims.totalClaimAmount).toEqual(mockResponse.totalClaimAmount);
    expect(actualClaims.detailsOfClaim).toEqual(mockResponse.detailsOfClaim);
  });
});

