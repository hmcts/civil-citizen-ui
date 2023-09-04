import { app } from '../../../../../../main/app';
import config from 'config';
import request from 'supertest';
import { POSTCODE_LOOKUP_URL } from '../../../../../../main/routes/urls';
import { getOSPlacesClientInstance } from 'modules/ordance-survey-key/ordanceSurveyKey';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
const nock = require('nock');

const mockPostcodeServer = 'https://api.os.uk';
const mockPostcodePath = /\/search\/places\/v1\/postcode\?.+/;

const mockPostcodeLookupResponse = {
  'header': {
    'uri': 'https://api.os.uk/search/names/v1/find?offset=0&dataset=DPA,LPI&postcode=SW2%201AN',
    'query': 'postcode=SW2 1AN',
    'offset': 0,
    'totalresults': 33,
    'format': 'JSON',
    'dataset': 'DPA',
    'lr': 'EN,CY',
    'maxresults': 100,
    'epoch': '64',
    'output_srs': 'EPSG:27700',
  },
  'results': [
    {
      'DPA': {
        'UPRN': '100070660705',
        'UDPRN': '23779778',
        'ADDRESS': '2, DALBERG ROAD, LONDON, SW2 1AN',
        'BUILDING_NUMBER': '2',
        'THOROUGHFARE_NAME': 'DALBERG ROAD',
        'POST_TOWN': 'COVENTRY',
        'POSTCODE': 'CV5 6GQ',
        'RPC': '2',
        'X_COORDINATE': 431895,
        'Y_COORDINATE': 278312,
        'STATUS': 'APPROVED',
        'LOGICAL_STATUS_CODE': '1',
        'CLASSIFICATION_CODE': 'RD04',
        'CLASSIFICATION_CODE_DESCRIPTION': 'Terraced',
        'LOCAL_CUSTODIAN_CODE': 5660,
        'LOCAL_CUSTODIAN_CODE_DESCRIPTION': 'LAMBETH',
        'POSTAL_ADDRESS_CODE': 'D',
        'POSTAL_ADDRESS_CODE_DESCRIPTION': 'A record which is linked to PAF',
        'BLPU_STATE_CODE_DESCRIPTION': 'Unknown/Not applicable',
        'TOPOGRAPHY_LAYER_TOID': 'osgb1000005715271',
        'LAST_UPDATE_DATE': '10/02/2016',
        'ENTRY_DATE': '19/03/2001',
        'LANGUAGE': 'EN',
        'MATCH': 1,
        'MATCH_DESCRIPTION': 'EXACT',
      },
    },
  ],
};

const mockAddessResponse = {
  isValid: true, addresses: [{
    'UPRN': '100070660705',
    'UDPRN': '23779778',
    'ADDRESS': '2, DALBERG ROAD, LONDON, SW2 1AN',
    'BUILDING_NUMBER': '2',
    'THOROUGHFARE_NAME': 'DALBERG ROAD',
    'POST_TOWN': 'COVENTRY',
    'POSTCODE': 'CV5 6GQ',
    'RPC': '2',
    'X_COORDINATE': 431895,
    'Y_COORDINATE': 278312,
    'STATUS': 'APPROVED',
    'LOGICAL_STATUS_CODE': '1',
    'CLASSIFICATION_CODE': 'RD04',
    'CLASSIFICATION_CODE_DESCRIPTION': 'Terraced',
    'LOCAL_CUSTODIAN_CODE': 5660,
    'LOCAL_CUSTODIAN_CODE_DESCRIPTION': 'LAMBETH',
    'POSTAL_ADDRESS_CODE': 'D',
    'POSTAL_ADDRESS_CODE_DESCRIPTION': 'A record which is linked to PAF',
    'BLPU_STATE_CODE_DESCRIPTION': 'Unknown/Not applicable',
    'TOPOGRAPHY_LAYER_TOID': 'osgb1000005715271',
    'LAST_UPDATE_DATE': '10/02/2016',
    'ENTRY_DATE': '19/03/2001',
    'LANGUAGE': 'EN',
    'MATCH': 1,
    'MATCH_DESCRIPTION': 'EXACT',
  }],
};

jest.mock('modules/ordance-survey-key/ordanceSurveyKey', () => ({
  createOSPlacesClientInstance: jest.fn(),
  getOSPlacesClientInstance: jest.fn(() => ({
    lookupByPostcodeAndDataSet: jest.fn(),
  })),
}));

describe('Postcode Lookup Controller - HTTP 500', () => {
  beforeAll(() => {
    nock(mockPostcodeServer)
      .get(mockPostcodePath)
      .reply(500, { status: 500, message: 'Error with OS Places service' });
  });

  it('should return 500 as postcode incomplete', async () => {
    const mockError = new Error('Mocked rejection');
    const mockLookupByPostcodeAndDataSet = jest.fn().mockRejectedValue(mockError);

    (getOSPlacesClientInstance as jest.Mock).mockReturnValue({
      lookupByPostcodeAndDataSet: mockLookupByPostcodeAndDataSet,
    });

    await request(app)
      .get(POSTCODE_LOOKUP_URL + '?postcode=BT')
      .expect((res) => {
        expect(res.status).toBe(500);
      });
  });
});

describe('Postcode Lookup Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    nock(mockPostcodeServer)
      .get(mockPostcodePath)
      .reply(200, mockPostcodeLookupResponse);

  });

  it('should return list of addresses', async () => {
    const mockLookupByPostcodeAndDataSet = jest.fn().mockResolvedValue(mockAddessResponse);

    (getOSPlacesClientInstance as jest.Mock).mockReturnValue({
      lookupByPostcodeAndDataSet: mockLookupByPostcodeAndDataSet,
    });
    await request(app)
      .get(POSTCODE_LOOKUP_URL + '?postcode=CV56GQ')
      .expect((req) => {
        expect(req.text).toContain('100070660705'); // uprn
        expect(req.text).toContain('2, DALBERG ROAD, LONDON, SW2 1AN'); // buildingNumber and thoroughfareName
        expect(req.text).toContain('COVENTRY'); // postTown
        expect(req.text).toContain('CV5 6GQ'); // postcode
        expect(req.text).toContain('D'); // postcodeType
        expect(req.text).toContain('431895'); // lat coordinates
        expect(req.text).toContain('278312'); // log coordinates
      });
  });

  it('should return 400 as postcode not provided', async () => {
    await request(app)
      .get(POSTCODE_LOOKUP_URL + '?postcode=')
      .expect((res) => {
        expect(res.status).toBe(400);
        expect(res.text).toContain('Postcode not provided');
      });
  });
});
