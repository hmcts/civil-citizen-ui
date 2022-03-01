import { app } from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import { CitizenAddress } from '../../../../../../main/common/form/models/citizenAddress';
import { CitizenCorrespondenceAddress } from '../../../../../../main/common/form/models/citizenCorrespondenceAddress';
jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Confirm Details page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  test('should return your details page', async () => {
    await request(app)
      .get('/case/12334/response/your-details')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Confirm your details');
      });
  });

  test('POST/Citizen details', async () => {
    const mockDraftStore = {
      set: jest.fn(() => Promise.resolve({ data: {} })),
    };
    app.locals.draftStoreClient = mockDraftStore;
    await request(app)
      .post('/case/12334/response/your-details')
      .send({
        primaryAddressLine1: 'Flat 3A Middle Road',
        primaryAddressLine2: 'Flat 3A Middle Road',
        primaryAddressLine3: '',
        primaryCity: 'London',
        primaryPostCode: 'SW1H 9AJ',
        correspondenceAddressLine1: '',
        correspondenceAddressLine2: '',
        correspondenceAddressLine3: '',
        correspondenceCity: '',
        correspondencePostCode: '',
      })
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toContain('case/1643033241924739/response/your-dob');
      });
  });

  test('GET/Citizen details', async () => {
    const mockDraftStore = {
      get: jest.fn(() => Promise.resolve({ data: {} })),
    };
    app.locals.draftStoreClient = mockDraftStore;

    const citizenFullName = {
      individualTitle: 'Mr',
      individualFirstName: 'Richards',
      individualLastName: 'Mary',
    };

    let formAddressModel = new CitizenAddress(
      'Flat 3A Middle Road',
      '',
      '',
      'London',
      'SW1H 9AJ');

    let formCorrespondenceModel = new CitizenCorrespondenceAddress(
      '',
      '',
      '',
      '',
      '');

    await request(app)
      .get('/case/12334/response/your-details')
      .send({
        citizenFullName: citizenFullName,
        citizenAddress: formAddressModel,
        citizenCorrespondenceAddress: formCorrespondenceModel,
        isCorrespondenceAddressToBeValidated: false,
      })
      .expect((res) => {
        expect(res.status).toBe(200);
      });
  });
});
