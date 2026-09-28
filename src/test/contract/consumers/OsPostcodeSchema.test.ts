import Ajv from 'ajv';
import config from 'config';
import nock from 'nock';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {AssertionError} from 'assert';
import {lookupByPostcodeAndDataSet} from 'modules/ordance-survey-key/ordanceSurveyKeyService';

const apiUrl = 'https://os-places.synthetic.test';
const apiKey = 'synthetic-os-api-key';
const postcode = 'SW1A 1AA';
const dpaAddress = {
  UPRN: 100000000001,
  UDPRN: 200000001,
  ADDRESS: 'SYNTHETIC HOUSE, 10, SAMPLE STREET, LONDON, SW1A 1AA',
  ORGANISATION_NAME: 'SYNTHETIC HOUSE',
  BUILDING_NUMBER: 10,
  THOROUGHFARE_NAME: 'SAMPLE STREET',
  POST_TOWN: 'LONDON',
  POSTCODE: postcode,
  POSTAL_ADDRESS_CODE: 'D',
  X_COORDINATE: 529000,
  Y_COORDINATE: 180000,
  COUNTRY_CODE: 'E',
};
const lpiAddress = {
  UPRN: 100000000002,
  ADDRESS: 'COMMUNITY HALL, VILLAGE GREEN, SAMPLETON, SY1 2ZZ',
  PAO_TEXT: 'COMMUNITY HALL',
  STREET_DESCRIPTION: 'VILLAGE GREEN',
  TOWN_NAME: 'SAMPLETON',
  POSTCODE_LOCATOR: 'SY1 2ZZ',
  POSTAL_ADDRESS_CODE: 'N',
  X_COORDINATE: 350000,
  Y_COORDINATE: 320000,
  COUNTRY_CODE: 'W',
};
const response = {results: [{DPA: dpaAddress}, {LPI: lpiAddress}]};
type OsResponseFixture = {results: Array<{DPA?: Record<string, unknown>; LPI?: Record<string, unknown>}>};
const schema = JSON.parse(readFileSync(resolve(__dirname, '../fixtures/os-postcode-response.schema.json'), 'utf8'));

const getConfig = jest.spyOn(config, 'get');
beforeEach(() => {
  getConfig.mockImplementation(((key: string) => {
    if (key === 'services.postcodeLookup.ordnanceSurveyApiKey') return apiKey;
    if (key === 'services.postcodeLookup.ordnanceSurveyApiUrl') return apiUrl;
    return jest.requireActual('config').get(key);
  }) as typeof config.get);
});
afterEach(() => {
  nock.cleanAll();
  getConfig.mockReset();
});
afterAll(() => {
  getConfig.mockRestore();
});

describe('OS Places postcode consumer schema and HTTP boundary', () => {
  test('accepts the documented DPA and LPI shapes and rejects an incompatible consumed field type', () => {
    const validate = new Ajv({allErrors: true}).compile(schema);
    expect(validate(response)).toBe(true);

    const incompatible = structuredClone(response) as OsResponseFixture;
    const incompatibleDpa = incompatible.results[0].DPA;
    expect(incompatibleDpa).toBeDefined();
    if (!incompatibleDpa) {
      throw new Error('DPA fixture is required for the incompatible-field check');
    }
    incompatibleDpa.UPRN = '100000000001';
    expect(validate(incompatible)).toBe(false);
  });

  test('calls the postcode endpoint with both datasets and maps consumed DPA and LPI fields', async () => {
    const scope = nock(apiUrl)
      .get('/search/places/v1/postcode')
      .query({dataset: 'DPA,LPI', postcode, key: apiKey})
      .reply(200, response);

    const result = await lookupByPostcodeAndDataSet(postcode);

    expect(scope.isDone()).toBe(true);
    expect(result.valid).toBe(true);
    expect(result.addresses).toHaveLength(2);
    expect(result.addresses[0]).toMatchObject({
      uprn: dpaAddress.UPRN,
      udprn: dpaAddress.UDPRN,
      organisationName: 'SYNTHETIC HOUSE',
      postTown: 'LONDON',
      postcode,
      postcodeType: 'D',
      formattedAddress: dpaAddress.ADDRESS,
      country: 'England',
      point: {type: 'Point', coordinates: [529000, 180000]},
    });
    expect(result.addresses[1]).toMatchObject({
      uprn: lpiAddress.UPRN,
      buildingName: 'COMMUNITY HALL',
      thoroughfareName: 'VILLAGE GREEN',
      postTown: 'SAMPLETON',
      postcode: 'SY1 2ZZ',
      postcodeType: 'N',
      formattedAddress: lpiAddress.ADDRESS,
      country: 'Wales',
      point: {type: 'Point', coordinates: [350000, 320000]},
    });
  });

  test('surfaces the service error when OS returns no postcode matches', async () => {
    const scope = nock(apiUrl)
      .get('/search/places/v1/postcode')
      .query({dataset: 'DPA,LPI', postcode, key: apiKey})
      .reply(200, {results: []});

    await expect(lookupByPostcodeAndDataSet(postcode)).rejects.toThrow(AssertionError);
    expect(scope.isDone()).toBe(true);
  });
});
