import config from 'config';
import nock from 'nock';
import {app} from '../../../../../main/app';
import {CP_UPLOAD_FILE} from 'routes/urls';
import Module from 'module';
import { TypeOfDocumentSectionMapper } from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
const session = require('supertest-session');
const testSession = session(app);
const citizenRoleToken: string = config.get('citizenRoleToken');

export const USER_DETAILS = {
  accessToken: citizenRoleToken,
  roles: ['citizen'],
};
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/app/auth/user/oidc', () => ({
  ...jest.requireActual('../../../../../main/app/auth/user/oidc') as Module,
  getUserDetails: jest.fn(() => USER_DETAILS),
}));
const file = {
  fieldname: 'file',
  originalname: 'test.txt',
  mimetype: 'text/plain',
  size: 123,
  buffer: Buffer.from('Test file content'),
};
describe('"upload File controller test', () => {
  const idamUrl: string = config.get('idamUrl');

  nock(idamUrl)
    .post('/o/token')
    .reply(200, {id_token: citizenRoleToken});

  beforeAll((done) => {
    testSession
      .get('/oauth2/callback')
      .query('code=ABC')
      .expect(302)
      .end(function (err: Error) {
        if (err) {
          return done(err);
        }
        return done();
      });
  });

  describe('on post', () => {
    it('should return file and http 200 ', async () => {
      //given
      TypeOfDocumentSectionMapper.mapToSingleFile = jest.fn(() => {
        return file;
      });

      //When
      const response = await testSession
        .post(CP_UPLOAD_FILE)
        .attach('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });

      //Then
      expect(response.status).toBe(200);
      expect(response.body.document).toBeDefined();
    });

    it('should return exception error http 500 ', async () => {
      //given
      const error = new Error('Test error');

      TypeOfDocumentSectionMapper.mapToSingleFile = jest.fn().mockImplementation(() => {
        throw error;
      });

      //When
      const response = await testSession
        .post(CP_UPLOAD_FILE)
        .attach('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });

      //Then
      expect(response.status).toBe(500);
      expect(response.text).toBe('{"errors":"Test error"}');
    });
  });

  it('should return validation http 400 ', async () => {
    //given

    TypeOfDocumentSectionMapper.mapToSingleFile = jest.fn(() => {
      return new FileUpload();
    });
    //When
    const response = await testSession
      .post(CP_UPLOAD_FILE)
      .attach('file', Buffer.from(''));

    //Then
    expect(response.status).toBe(400);
    expect(response.text).toBe('{"errors":["Document must be Word, Excel, PowerPoint, PDF, RTF, TXT, CSV, JPG, JPEG, PNG, BMP, TIF, TIFF"]}');
  });

});

