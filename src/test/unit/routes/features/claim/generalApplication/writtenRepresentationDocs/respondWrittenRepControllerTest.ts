import config from 'config';
import nock from 'nock';
import request from 'supertest';
import { app } from '../../../../../../../main/app';
import { Claim } from 'common/models/claim';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {
  GA_PROVIDE_MORE_INFORMATION_URL,
} from 'routes/urls';
import * as draftService from 'modules/draft-store/draftStoreService';
import * as draftServiceGA from 'modules/draft-store/draftGADocumentService';
import * as generalApplicationResponseStoreService from 'services/features/generalApplication/response/generalApplicationResponseStoreService';
import {UploadGAFiles} from 'models/generalApplication/uploadGAFiles';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/draft-store/draftGADocumentService');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  getDraftGARespondentResponse: jest.fn(),
  saveDraftGARespondentResponse: jest.fn(),
}));

describe('General Application - uploadDocumentsForWrittenRepController', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockDataFromStore = jest.spyOn(draftService, 'getCaseDataFromStore');
  const mockGADocDataFromStore = jest.spyOn(draftServiceGA, 'getGADocumentsFromDraftStore');
  const mockGADocResponseStoreService = jest.spyOn(generalApplicationResponseStoreService, 'getDraftGARespondentResponse');
  let claim: Claim;
  let uploadDocuments: UploadGAFiles[];
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  beforeEach(() => {
    claim = new Claim();
    claim.id ='id';
    claim.generalApplication = new GeneralApplication();
    mockDataFromStore.mockResolvedValue(claim);
    mockGADocDataFromStore.mockResolvedValue(uploadDocuments);
    const response = new GaResponse();
    response.writtenRepText = 'Written Rep';
    mockGADocResponseStoreService.mockResolvedValue(response);
  });

  afterEach(
    () => {
      jest.clearAllMocks();
    },
  );

  describe('on GET', () => {
    it('should return respond page', async () => {
      await request(app)
        .get(GA_PROVIDE_MORE_INFORMATION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Provide more information to the court');
        });
    });
  });

  it('should return errors on no input', async () => {

    await request(app)
      .post(GA_PROVIDE_MORE_INFORMATION_URL)
      .send({option: null, writtenRepText: null})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('You need to either enter the information requested in the box or select Yes to upload documents to support your response.');
      });
  });

  it('should return errors on undefined input', async () => {

    await request(app)
      .post(GA_PROVIDE_MORE_INFORMATION_URL)
      .send({})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('You need to either enter the information requested in the box or select Yes to upload documents to support your response.');
      });
  });

  it('should return errors on error input', async () => {

    await request(app)
      .post(GA_PROVIDE_MORE_INFORMATION_URL)
      .send({option: 'no', writtenRepText: null})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('You need to either enter the information requested in the box or select Yes to upload documents to support your response.');
      });
  });

  it('should  return errors on empty input', async () => {

    await request(app)
      .post(GA_PROVIDE_MORE_INFORMATION_URL)
      .send({option: null, writtenRepText: 'written rep'})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('You need to tell us if you want to upload documents to support your response. Choose option: Yes or No.');
      });
  });

  it('should save the value and redirect', async () => {
    await request(app)
      .post(GA_PROVIDE_MORE_INFORMATION_URL)
      .send({ option: 'yes' })
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });
});
