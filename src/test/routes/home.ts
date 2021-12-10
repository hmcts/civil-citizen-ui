import { expect } from 'chai';
import request from 'supertest';
import config from 'config';
import mock from 'nock';

import 'test/routes/expectations';

import { Paths as AppPaths } from 'paths';

import { app } from 'main/app';

import { idamServiceMock } from 'test/http-mocks/idam';

const cookieName: string = config.get<string>('session.cookieName');

describe('Home page', () => {
  beforeEach(() => {
    mock.cleanAll();
  });

  describe('on GET', () => {
    it('should redirect to start claim page', async () => {
      idamServiceMock.resolveRetrieveUserFor('1', 'citizen');

      await request(app)
        .get(AppPaths.homePage.uri)
        .set('Cookie', `${cookieName}=ABC`)
        .expect(res => expect(res).to.be.redirect.toLocation(AppPaths.receiver.uri));
    });
  });
});
