import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import {MEDIATION_UPLOAD_DOCUMENTS} from 'routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {
  TypeOfDocuments,
  TypeOfMediationDocuments,
  UploadDocuments,
} from 'models/mediation/uploadDocuments/uploadDocuments';
import {DateInputFields} from 'models/caseProgression/uploadDocumentsUserForm';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');

const typeOfDocuments = Array.of(
  new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true),
  new TypeOfDocuments(2, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, true),
);

describe('Mediation upload documents controller - multipart uploads', () => {
  beforeAll(() => {
    nock(config.get<string>('idamUrl'))
      .post('/o/token')
      .reply(200, {id_token: config.get<string>('citizenRoleToken')});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockImplementation(async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.partyDetails = {firstName: 'John', lastName: 'Smith'};
      claim.mediationUploadDocuments = new UploadDocuments(typeOfDocuments);
      return claim;
    });
  });

  it('should show the wrong file type error when a spoofed file is sent without its upload action', async () => {
    const validDate = new DateInputFields('12', '11', '2020');

    await request(app)
      .post(MEDIATION_UPLOAD_DOCUMENTS)
      .field('action', 'add_another-yourStatement')
      .field('documentsForYourStatement[0][dateInputFields]', JSON.stringify(validDate))
      .field('documentsForYourStatement[0][yourName]', 'test document')
      .attach('documentsForYourStatement[0][fileUpload]', Buffer.from('This is not a real PDF.\n'), {
        filename: 'spoofed.pdf',
        contentType: 'application/pdf',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Document must be Word, Excel, PowerPoint, PDF');
      });
  });
});
