import {UserDetails} from 'models/AppRequest';

export const userInfo: UserDetails = {
  accessToken: 'accessToken',
  idToken: 'idToken',
  id: '1',
  email: 'email@email.com',
  givenName: 'givenName',
  familyName: 'familyName',
  roles: [],
};

export const req = {
  session: {
    user: userInfo,
  },
};
