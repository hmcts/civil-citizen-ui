import * as fs from 'fs';
import * as urls from '../../main/routes/urls';
import config from 'config';
import nock from 'nock';
import {IGNORED_URLS} from './ignored-urls';
import CivilClaimResponseMock from '../utils/mocks/civilClaimResponseMock.json';
import {CIVIL_SERVICE_CALCULATE_DEADLINE} from '../../main/app/client/civilServiceUrls';
import request from 'supertest';
import {app} from '../../main/app';
import {translateUrlToFilePath} from '../utils/mocks/a11y/urlToFileName';
import {mockCivilClaim, mockResponseFullAdmitPayBySetDate} from '../utils/mockDraftStore';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {CivilClaimResponse, ClaimFeeData} from 'models/civilClaimResponse';
import * as courtLocationCache from 'modules/draft-store/courtLocationCache';

const urlsList = Object.values(urls).filter(url => !IGNORED_URLS.includes(url));
jest.mock('../../main/modules/oidc');
jest.mock('../../main/modules/draft-store/draftStoreService');

describe('Accessibility', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  //const idamUrl: string = config.get('idamUrl');

  const claimFeeData = {  calculatedAmountInPence: 12000,
    code: 'Fee06',
    version: 1,
  } as ClaimFeeData;

  beforeEach(() => {
    nock('http://localhost:5000')
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock('http://localhost:4000')
      .post(CIVIL_SERVICE_CALCULATE_DEADLINE)
      .reply(200, new Date(2022, 9, 31));
    nock('http://localhost:4000')
      .get('/cases/:id')
      .reply(200, CivilClaimResponseMock)
      .get('/cases/1645882162449409')
      .reply(200, CivilClaimResponseMock)
      .get('/cases/undefined')
      .reply(200, CivilClaimResponseMock);
    nock('http://localhost:4000')
      .get('/fees/:id/claim/110')
      .reply(200, claimFeeData)
      .get('/fees/1645882162449409/claim/110')
      .reply(200, claimFeeData)
      .get('/fees/undefined/claim/110')
      .reply(200, claimFeeData);
    nock('http://localhost:4000')
      .get('/fees/:id/hearing/110')
      .reply(200, claimFeeData)
      .get('/fees/1645882162449409/hearing/110')
      .reply(200, claimFeeData)
      .get('/fees/undefined/hearing/110')
      .reply(200, claimFeeData);
    nock('http://localhost:4000')
      .get('/cases/:id/userCaseRoles')
      .reply(200, [])
      .get('/cases/1645882162449409/userCaseRoles')
      .reply(200, [])
      .get('/cases/undefined/userCaseRoles')
      .reply(200, []);
    nock('http://localhost:4502')
      .post('/lease')
      .reply(200, {});
    nock('http://localhost:8765')
      .get('/drafts')
      .reply(200, {});
    app.request.cookies = {eligibilityCompleted: true};

    const jsonData = JSON.parse(JSON.stringify(CivilClaimResponseMock));
    const civilClaimResponse = Object.assign(new CivilClaimResponse(), jsonData);

    const claim: Claim = new Claim();
    Object.assign(claim, civilClaimResponse?.case_data);
    claim.id = civilClaimResponse?.id;

    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('1645882162449409');
    jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockReturnValue(Promise.resolve(claim));
    jest.spyOn(courtLocationCache, 'getCourtLocationsFromCache').mockReturnValue(Promise.resolve([{code: 'code', label: 'label'}]));
  });

  scraper(urlsList).then();
});

async function scraper(urlsList: string[]) {
  const start = Date.now();

  console.log(`for loop start: ${Date.now() - start}ms`);

  for (const url of urlsList) {
    if(url.includes(urls.STATEMENT_OF_MEANS_URL)){
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
    } else {
      app.locals.draftStoreClient = mockCivilClaim;
    }

    it('Scraping '+url, async () => {
      await request(app).get(url).expect((res) => {
        const fileName = translateUrlToFilePath(url);
        fs.writeFileSync(fileName, res.text);
      });
    });
  }

  console.log(`for loop end: ${Date.now() - start}ms`);
}
