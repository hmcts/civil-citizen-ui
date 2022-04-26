import Axios, { AxiosResponse } from 'axios';
import config from 'config';
import jwt_decode from 'jwt-decode';
import {UserDetails} from '../../../common/models/AppRequest';


export const getUserDetails = async (
  callbackUrl: string,
  rawCode: string,
): Promise<UserDetails> => {
  const id: string = config.get('services.idam.clientID');
  const secret: string = config.get('services.idam.clientSecret');
  const tokenUrl: string = config.get('services.idam.tokenURL');
  console.log('services.idam.clientID: ' + id);
  console.log('services.idam.clientSecret: ' + secret);
  console.log('services.idam.tokenURL: ' + tokenUrl);

  const code = encodeURIComponent(rawCode);
  const data = `client_id=${id}&client_secret=${secret}&grant_type=authorization_code&redirect_uri=${callbackUrl}&code=${code}`;
  const headers = { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' };
  const response: AxiosResponse<OidcResponse> = await Axios.post(tokenUrl, data, { headers });
  const jwt = jwt_decode(response.data.id_token) as IdTokenJwtPayload;

  return {
    accessToken: response.data.access_token,
    id: jwt.uid,
    email: jwt.sub,
    givenName: jwt.given_name,
    familyName: jwt.family_name,
    roles: jwt.roles,
  };
};

interface IdTokenJwtPayload {
  uid: string;
  sub: string;
  given_name: string;
  family_name: string;
  roles: string[];
}

export interface OidcResponse {
  id_token: string;
  access_token: string;
}
