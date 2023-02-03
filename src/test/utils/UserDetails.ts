import {UserDetails} from 'models/AppRequest';

export const userInfo: UserDetails = {
  accessToken: 'accessToken',
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
