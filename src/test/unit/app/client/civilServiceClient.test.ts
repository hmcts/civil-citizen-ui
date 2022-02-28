import {CivilServiceClient} from '../../../../main/app/client/civilServiceClient';
import axios, {AxiosInstance} from 'axios';
import {Claim} from '../../../../main/common/models/claim';
import * as requestModels from '../../../../main/common/models/AppRequest';
import {CivilClaimResponse} from '../../../../main/common/models/civilClaimResponse';


jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;

describe('Civil Service Client', () => {
  it('retrieve cases', async () => {
    const claim = new Claim();
    claim.legacyCaseReference = '000MC003';
    claim.applicant1 =
      {
        individualTitle: 'Mrs',
        individualLastName: 'Clark',
        individualFirstName: 'Jane',
      };
    claim.totalClaimAmount = 1500;

    const mockResponse: CivilClaimResponse = {
      case_data: claim,
    };

    const mockPost = jest.fn().mockResolvedValue({data: {cases: [mockResponse]}});
    mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
    const civilServiceClient = new CivilServiceClient('http://localhost');
    const actualClaims: Claim[] = await civilServiceClient.retrieveByDefendantId(mockedAppRequest);
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost',
    });
    expect(mockPost.mock.calls[0][0]).toEqual('/cases/');
    expect(actualClaims.length).toEqual(1);
    expect(actualClaims[0].legacyCaseReference).toEqual('000MC003');
    expect(actualClaims[0].applicant1.individualFirstName).toEqual('Jane');
    expect(actualClaims[0].applicant1.individualLastName).toEqual('Clark');
  });
});
