import {CivilServiceClient} from '../../../../../main/app/client/civilServiceClient';

import axios, {AxiosInstance} from 'axios';
import {Claim} from '../../../../../main/common/models/claim';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Claim Details', () => {
  it('retrieve claim details', async () => {
    const mockResponse = {
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
      detailsOfClaim: 'A strong sense of entitlement that would explain my reasons of the claim, that the Roof work and leaks that followed were done below standards set by the council inspector',
    };


    const mockGet = jest.fn().mockResolvedValue({data: mockResponse});
    mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);

    const civilServiceClient = new CivilServiceClient('http://localhost');

    const actualClaims: Claim = await civilServiceClient.retrieveClaimDetails('1643033241924739');

    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost',
    });

    expect(actualClaims.legacyCaseReference).toEqual(mockResponse.legacyCaseReference);
    expect(actualClaims.totalClaimAmount).toEqual(mockResponse.totalClaimAmount);
    expect(actualClaims.detailsOfClaim).toEqual(mockResponse.detailsOfClaim);
  });
});

