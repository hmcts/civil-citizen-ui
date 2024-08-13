import Axios, { AxiosResponse } from 'axios';
import config from 'config';
import jwt_decode from 'jwt-decode';
import {UserDetails} from '../../../common/models/AppRequest';

export const getOidcResponse = async(
  callbackUrl: string,
  rawCode: string,
): Promise<OidcResponse> => {
  const id: string = config.get('services.idam.clientID');
  const secret: string = config.get('services.idam.clientSecret');
  const tokenUrl: string = config.get('services.idam.tokenURL');
  const code = encodeURIComponent(rawCode);

  const data = `client_id=${id}&client_secret=${secret}&grant_type=authorization_code&redirect_uri=${callbackUrl}&code=${code}`;
  const headers = {
    'Accept' : 'application/json',
    'Content-Type' : 'application/x-www-form-urlencoded',
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS',
  };
  const response: AxiosResponse<OidcResponse> = await Axios.post(tokenUrl, data, { headers });
  return response.data;
};

export const getUserDetails = (
  responseData: OidcResponse,
): UserDetails => {

  const jwt: IdTokenJwtPayload = jwt_decode(responseData.id_token);

  return {
    accessToken: responseData.access_token,
    id: jwt.uid,
    email: jwt.sub,
    givenName: jwt.given_name,
    familyName: jwt.family_name,
    roles: jwt.roles,
  };
};

export const getSessionIssueTime = (
  responseData: OidcResponse,
): number => {

  const jwt: IdTokenJwtPayload = jwt_decode(responseData.id_token);

  return jwt.iat;
};

interface IdTokenJwtPayload {
  uid: string;
  sub: string;
  given_name: string;
  family_name: string;
  roles: string[];
  iat?: number;
}

export interface OidcResponse {
  id_token: string;
  access_token: string;
}
