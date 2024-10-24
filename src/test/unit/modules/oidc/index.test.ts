import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../main/app';
import {
  ASSIGN_CLAIM_URL,
  CALLBACK_URL, CLAIM_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID, CLAIMANT_TASK_LIST_URL, DASHBOARD_URL,
  FIRST_CONTACT_SIGNPOSTING_URL,
  SIGN_IN_URL,
  SIGN_OUT_URL, UNAUTHORISED_URL,
} from 'routes/urls';

import {getOidcResponse, getSessionIssueTime, getUserDetails, OidcResponse} from '../../../../main/app/auth/user/oidc';
import {Session} from 'express-session';
import {TestMessages} from '../../../utils/errorMessageTestConstants';

jest.mock('../../../../main/modules/draft-store');
const mockDraftStoreClient = {
  set: jest.fn(),
  expireat: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
};
app.locals.draftStoreClient = mockDraftStoreClient;
const mockGetUserDetails = getUserDetails as jest.Mock;
const mockGetOidcResponse = getOidcResponse as jest.Mock;
const mockGetSessionIssueTime = getSessionIssueTime as jest.Mock;

const citizenRoleToken: string = config.get('citizenRoleToken');
const idamServiceUrl: string = config.get('services.idam.authorizationURL');
const signOutUrl = idamServiceUrl.replace('/login', '/o/endSession');
const userDetails = {accessToken: citizenRoleToken, email:'dfkdh', id: 'jfkdljfd', familyName:'masslover', givenName:'tatiana', roles:['citizen']};

jest.mock('../../../../main/app/auth/user/oidc');

describe('OIDC middleware', () => {
  describe('Sign out', () => {
    beforeEach(() => {
      nock(idamServiceUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.user = {
        idToken: 'token',
        givenName: 'Joe',
        familyName: 'Bloggs',
      };
    });

    it('should unset user', async () => {
      await request(app).get(SIGN_OUT_URL).expect(() => {
        expect(app.locals.user).toBeUndefined();
      });
    });

    it('should redirect to idam sign out', async () => {
      await request(app).get(SIGN_OUT_URL).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.text).toContain(signOutUrl);
      });
    });
  });
  describe('public pages', () => {
    it('should not redirect to login for first contact pages', async () => {
      await request(app).get(FIRST_CONTACT_SIGNPOSTING_URL).expect((res) => {
        expect(res.status).toBe(200);
      });
    });
  });
  describe('assign claim to defendant', () => {
    it('should save claim id and redirect to sign in url when user is not logged in', async () => {
      await request(app).get(ASSIGN_CLAIM_URL).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.text).toContain(SIGN_IN_URL);
      });
      expect(app.locals.assignClaimURL).toBe(ASSIGN_CLAIM_URL);
    });
    it('should redirect to assign claim url when claim id is set', async () => {
      mockGetOidcResponse.mockReturnValue(Promise.resolve({id_token: '1', access_token: ''} as OidcResponse));
      mockGetUserDetails.mockReturnValue(userDetails);
      mockGetSessionIssueTime.mockReturnValue(1234);
      await request(app).get(CALLBACK_URL)
        .query({code: 'string'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
      expect(app.locals.assignClaimURL).toBeUndefined();
    });
    it('should redirect to dashboard when user is logged in and claim is not set', async () => {
      mockGetOidcResponse.mockReturnValue(Promise.resolve({id_token: '1', access_token: ''} as OidcResponse));
      mockGetUserDetails.mockReturnValue(userDetails);
      mockGetSessionIssueTime.mockReturnValue(1234);
      await request(app).get(CALLBACK_URL)
        .query({code: 'string'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(DASHBOARD_URL);
        });
    });
    it('should redirect to unauthorised when user is logged in but has no citizen role', async ()=> {
      userDetails.roles = [];
      mockGetOidcResponse.mockReturnValue(Promise.resolve({id_token: '1', access_token: ''} as OidcResponse));
      mockGetUserDetails.mockReturnValue(userDetails);
      mockGetSessionIssueTime.mockReturnValue(1234);
      await request(app).get(CALLBACK_URL)
        .query({code: 'string'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(UNAUTHORISED_URL);
        });
    });
    it ('should redirect to dashboard when query type is not string', async () => {
      await request(app).get(CALLBACK_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(DASHBOARD_URL);
        });
    });
    it('should redirect to dashboard when query is string and user has citizen role', async () => {
      userDetails.roles = ['citizen'];
      mockGetOidcResponse.mockReturnValue(Promise.resolve({id_token: '1', access_token: ''} as OidcResponse));
      mockGetUserDetails.mockReturnValue(userDetails);
      mockGetSessionIssueTime.mockReturnValue(1234);
      await request(app).get(CALLBACK_URL)
        .query({code: 'string'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(DASHBOARD_URL);
        });
    });
  });

  describe('claim issue task-list', () => {
    it('should claimIssueTasklist and redirect to sign in url when user is not logged in', async () => {
      await request(app).get(CLAIMANT_TASK_LIST_URL ).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.text).toContain(SIGN_IN_URL);
      });
      expect(app.locals.claimIssueTasklist).toBe(true);
    });
    it('should redirect to claim issue task-list url when claimIssueTasklist is true', async () => {
      mockGetOidcResponse.mockReturnValue(Promise.resolve({id_token: '1', access_token: ''} as OidcResponse));
      mockGetUserDetails.mockReturnValue(userDetails);
      mockGetSessionIssueTime.mockReturnValue(1234);
      await request(app).get(CALLBACK_URL)
        .query({code: 'string'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
      expect(app.locals.claimIssueTasklist).toBeUndefined();
    });
    it('should redirect to dashboard when user is logged in and claimIssueTasklist is not set', async () => {
      mockGetOidcResponse.mockReturnValue(Promise.resolve({id_token: '1', access_token: ''} as OidcResponse));
      mockGetUserDetails.mockReturnValue(userDetails);
      mockGetSessionIssueTime.mockReturnValue(1234);
      await request(app).get(CALLBACK_URL)
        .query({code: 'string'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(DASHBOARD_URL);
        });
    });
  });

  describe('should redirect back to payment confirmation url after login', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should store original url in local if user details expired', async () => {
      mockDraftStoreClient.get.mockResolvedValueOnce('123456789');

      await request(app).get(CLAIM_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID.replace(':id', '123456789')).expect((res) => {
        expect(res.status).toBe(302);
        expect(mockDraftStoreClient.set).toHaveBeenCalledWith('123456789' + 'userIdForPayment', CLAIM_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID.replace(':id', '123456789'));
        expect(res.text).toContain(SIGN_IN_URL);
      });
    });

    it('should redirect back to payment confirmation url after login', async () => {
      userDetails.roles = ['citizen'];
      app.locals.paymentConfirmationUrl = CLAIM_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID;
      mockGetOidcResponse.mockReturnValue(Promise.resolve({id_token: '1', access_token: ''} as OidcResponse));
      mockGetUserDetails.mockReturnValue(userDetails);
      mockGetSessionIssueTime.mockReturnValue(1234);
      app.request['session'] = {user: {id: 'jfkdljfd'}} as unknown as Session;
      mockDraftStoreClient.get.mockResolvedValueOnce(CLAIM_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID);

      await request(app).get(CALLBACK_URL)
        .query({code: 'string'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(CLAIM_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID);
        });
    });
    
    it('should throw error if issue in getting confirmation url', async () => {
      userDetails.roles = ['citizen'];
      app.locals.paymentConfirmationUrl = CLAIM_FEE_PAYMENT_CONFIRMATION_URL_WITH_UNIQUE_ID;
      mockGetOidcResponse.mockReturnValue(Promise.resolve({id_token: '1', access_token: ''} as OidcResponse));
      mockGetUserDetails.mockReturnValue(userDetails);
      mockGetSessionIssueTime.mockReturnValue(1234);
      app.request['session'] = {user: {id: 'jfkdljfd'}} as unknown as Session;
      mockDraftStoreClient.get.mockRejectedValueOnce(new Error('error in getting the value'));

      await request(app).get(CALLBACK_URL)
        .query({code: 'string'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
