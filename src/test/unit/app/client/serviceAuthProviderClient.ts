import axios, {AxiosInstance} from 'axios';
import config from 'config';
import {ServiceAuthProviderClient} from '../../../../main/app/client/serviceAuthProviderClient'


jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const baseUrl: string = config.get('baseUrl');

describe('Service Authorisation Provider Client', () => {
  it('return service aurhorisation token', async () => {

    const mockResponse = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ4dWlfd2ViYXBwIiwiZXhwIjoxNjU1MTUxNjUzfQ.AAara6z3N4hsvlaZdP_Xi8e9PnQHHBB4HpBBrEkZSk1_9eesnLXn6-r-4VoVBihFoin2DSand4_NqTkahCAF9g';

    const mockPost = jest.fn().mockResolvedValue({data: mockResponse });
    mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);
    const serviceAuthProviderClient = new ServiceAuthProviderClient(baseUrl);
    const actualToken: string = await serviceAuthProviderClient.getServiceAuthorisationToken();
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: baseUrl,
    });
    expect(mockPost.mock.calls[0][0]).toEqual('/testing-support/lease');
    expect(actualToken.length).toEqual(mockResponse.length);
  });
});
