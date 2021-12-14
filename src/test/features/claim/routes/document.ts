import { expect } from 'chai';
import request from 'supertest';
import config from 'config';

import { attachDefaultHooks } from 'test/routes/hooks';
import 'test/routes/expectations';
import { checkAuthorizationGuards } from 'test/features/offer/routes/checks/authorization-check';

import { app } from 'main/app';

import { idamServiceMock } from 'test/http-mocks/idam';
import { claimStoreServiceMock } from 'test/http-mocks/claim-store';
import { Paths } from 'claim/paths';
import { getDocumentPath } from "claim/routes/document";

const cookieName: string = config.get<string>('session.cookieName');

const externalId = claimStoreServiceMock.sampleClaimObj.externalId;

const claimDocuments = {
  claimDocumentCollection: {
    claimDocuments: [
      {
        id: '3f1813ee-5b60-43fd-9160-fa92605dfd6e',
        documentName: '000MC258-claim-form.pdf',
        documentType: 'SEALED_CLAIM',
        createdDatetime: '2020-02-26T14:56:49.264',
        createdBy: 'OCMC',
        size: 79777,
      },
      {
        id: '08c030fb-f260-446e-8633-8bbc75cd03f8',
        documentName: '000MC258-claimant-hearing-questions.pdf',
        documentType: 'CLAIMANT_DIRECTIONS_QUESTIONNAIRE',
        createdDatetime: '2020-02-26T15:10:13.601',
        createdBy: 'OCMC',
        size: 11205,
      },
    ],
  },
};

const pathTestData = [
  {
    path: "path/to/file",
    expectedLastElement: "file",
  },
  {
    path: "path_to/file.ext",
    expectedLastElement: "file.ext",
  },
];

describe('Document Download', () => {
  attachDefaultHooks(app);

  describe('on GET', () => {
    checkAuthorizationGuards(app, 'get', Paths.documentPage.evaluateUri({
      externalId,
      documentURI: 'sealed-claim',
    }));

    describe('for authorized user', () => {
      beforeEach(() => {
        idamServiceMock.resolveRetrieveUserFor('1', 'citizen');
      });

      it('should return 500 and render error page when cannot retrieve claim by external id', async () => {
        claimStoreServiceMock.rejectRetrieveClaimByExternalId();
        await request(app)
          .get(Paths.documentPage.evaluateUri({ externalId, documentURI: 'sealed-claim' }))
          .set('Cookie', `${cookieName}=ABC`)
          .expect(res => expect(res).to.be.serverError.withText('Error'));
      });

      it('should return 500 and render error page when cannot generate PDF', async () => {
        claimStoreServiceMock.resolveRetrieveClaimByExternalId(claimDocuments);
        claimStoreServiceMock.rejectRetrieveDocument('Something went wrong');

        await request(app)
          .get(Paths.documentPage.evaluateUri({ externalId, documentURI: 'sealed-claim' }))
          .set('Cookie', `${cookieName}=ABC`)
          .expect(res => expect(res).to.be.serverError.withText('Error'));
      });

      it('should return receipt when everything is fine', async () => {
        claimStoreServiceMock.resolveRetrieveClaimByExternalId(claimDocuments);
        claimStoreServiceMock.resolveRetrieveDocument();

        await request(app)
          .get(Paths.documentPage.evaluateUri({ externalId, documentURI: 'sealed-claim' }))
          .set('Cookie', `${cookieName}=ABC`)
          .expect(res => expect(res).to.be.successful);
      });
    });
  });

  describe('for path variable input', () => {

    pathTestData.forEach(test =>
      it(`should extract last element of '${test.path}'`, () => {
        const actualLastElement: string = getDocumentPath(test.path);
        expect(actualLastElement).to.be.deep.equal(test.expectedLastElement);
      }),
    );
  });
});
