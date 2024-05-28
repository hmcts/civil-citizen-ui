import Axios, { AxiosStatic } from 'axios';
import {
  getOidcResponse,
  getSessionIssueTime,
  getUserDetails,
  OidcResponse,
} from '../../../../../main/app/auth/user/oidc';

jest.mock('axios');

const mockedAxios = Axios as jest.Mocked<AxiosStatic>;

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwiZ2l2ZW5fbmFtZSI6IkpvaG4iLCJmYW1pbHlfbm'
  + 'FtZSI6IkRvcmlhbiIsInVpZCI6IjEyMyIsImlhdCI6MTcwOTgzMDU2OX0.nOvy4uQ5EKrZWCJ6_PMKwii2m0DkABggblDAVwT_DD8';

describe('getUserDetails', () => {

  const mockResponse: OidcResponse = {
    access_token: token,
    id_token: token,
  };

  it('should exchange a code for a token', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        access_token: mockResponse.access_token,
        id_token: mockResponse.id_token,
      },
    });

    const result = await  getOidcResponse('https://localhost/oauth2/callback', '123');
    expect(result).toStrictEqual(mockResponse);
  });

  it('should exchange a code for a token and decode a JWT to get the user details', async () => {

    const result = getUserDetails(mockResponse);
    expect(result).toStrictEqual({
      accessToken: token,
      email: 'test@test.com',
      givenName: 'John',
      familyName: 'Dorian',
      id: '123',
      roles: undefined,
    });
  });

  it('should exchange a code for a token a', async () => {

    const result = getSessionIssueTime(mockResponse);
    expect(result).toStrictEqual(1709830569);
  });
});
