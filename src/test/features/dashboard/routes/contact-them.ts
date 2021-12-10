import { expect } from 'chai';
import request from 'supertest';
import config from 'config';

import { attachDefaultHooks } from 'test/routes/hooks';
import 'test/routes/expectations';

import { Paths } from 'dashboard/paths';

import { app } from 'main/app';

import { idamServiceMock } from 'test/http-mocks/idam';
import { claimStoreServiceMock } from 'test/http-mocks/claim-store';
import { checkAuthorizationGuards } from 'test/features/dashboard/routes/checks/authorization-check';

const cookieName: string = config.get<string>('session.cookieName');

const contactThemPage = Paths.contactThemPage.evaluateUri({ externalId: 'b17af4d2-273f-4999-9895-bce382fa24c8' });

describe('Dashboard - Contact-them page', () => {
  attachDefaultHooks(app);

  describe('on GET', () => {
    checkAuthorizationGuards(app, 'get', contactThemPage);

    context('when user authorised', () => {
      beforeEach(() => {
        idamServiceMock.resolveRetrieveUserFor('1', 'citizen');
      });

      it('should return 500 and render error page when cannot retrieve address', async () => {
        claimStoreServiceMock.rejectRetrieveClaimByExternalId('HTTP error');

        await request(app)
          .get(contactThemPage)
          .set('Cookie', `${cookieName}=ABC`)
          .expect(res => expect(res).to.be.serverError.withText('Error'));
      });

      context('when at least one claim issued', () => {
        beforeEach(() => {
          claimStoreServiceMock.resolveRetrieveClaimByExternalId();
        });

        it('should render page when everything is fine', async () => {
          await request(app)
            .get(contactThemPage)
            .set('Cookie', `${cookieName}=ABC`)
            .expect(res => expect(res).to.be.successful.withText('Address'));
        });
      });
    });

  });
});
