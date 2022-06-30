import axios, {AxiosInstance} from 'axios';
import config from 'config';
import {generateServiceToken, ServiceAuthProviderClient} from '../../../../main/app/client/serviceAuthProviderClient';
import {authenticator} from 'otplib';

jest.mock('axios');
jest.mock('otplib');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const baseUrl: string = config.get('baseUrl');

describe('Service Authorisation Provider Client', () => {
  it('return service authorisation token', async () => {

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

  it('should throw error when service token generation fails', async () => {
    //When
    (authenticator.generate as jest.Mock).mockImplementation(() => {
      throw new Error('OTP Generation Error');
    });

    //Then
    await expect(
      generateServiceToken('microservice','s2sSecret')).rejects.toThrow('OTP Generation Error');
  });
});
