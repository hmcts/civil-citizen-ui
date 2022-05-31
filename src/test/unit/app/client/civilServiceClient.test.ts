import {CivilServiceClient} from '../../../../main/app/client/civilServiceClient';
import axios, {AxiosInstance} from 'axios';
import {Claim} from '../../../../main/common/models/claim';
import * as requestModels from '../../../../main/common/models/AppRequest';
import {CivilClaimResponse} from '../../../../main/common/models/civilClaimResponse';
import config from 'config';
import {CIVIL_SERVICE_CASES_URL} from '../../../../main/app/client/civilServiceUrls';
import {CounterpartyType} from '../../../../main/common/models/counterpartyType';


jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const baseUrl:string = config.get('baseUrl');
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
        type : CounterpartyType.INDIVIDUAL,
      };
    claim.totalClaimAmount = 1500;

    const mockResponse: CivilClaimResponse = {
      id:'1',
      case_data: claim,
    };

    const mockPost = jest.fn().mockResolvedValue({data: {cases: [mockResponse]}});
    mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
    const civilServiceClient = new CivilServiceClient(baseUrl);
    const actualClaims: CivilClaimResponse[] = await civilServiceClient.retrieveByDefendantId(mockedAppRequest);
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: baseUrl,
    });
    expect(mockPost.mock.calls[0][0]).toEqual(CIVIL_SERVICE_CASES_URL);
    expect(actualClaims.length).toEqual(1);
    expect(actualClaims[0].case_data.legacyCaseReference).toEqual('000MC003');
    expect(actualClaims[0].case_data.applicant1?.individualFirstName).toEqual('Jane');
    expect(actualClaims[0].case_data.applicant1?.individualLastName).toEqual('Clark');
  });
});
