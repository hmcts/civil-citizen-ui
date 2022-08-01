import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';
import {UNDERSTANDING_RESPONSE_OPTIONS_URL} from '../../../../../main/routes/urls';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Understanding Your Options View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  let htmlDocument: Document;
  beforeEach(async () => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
    const response = await request(app).get(UNDERSTANDING_RESPONSE_OPTIONS_URL);
    const dom = new JSDOM(response.text);
    htmlDocument = dom.window.document;
  });

  it('should have correct page title', () => {
    expect(htmlDocument.title).toEqual('Your money claims account - Requesting extra time');
  });

  it('should have correct main header', () => {
    const header = htmlDocument.getElementsByClassName('govuk-heading-l')[0];
    expect(header.innerHTML).toContain('Requesting extra time');
  });

  it('should display correct sub header', () => {
    const header = htmlDocument.getElementsByClassName('govuk-heading-m')[0];
    expect(header.innerHTML).toContain('Current response deadline: 4pm on 15 May 2022');
  });

  it('should display unable to respond to claim before deadline paragraph', () => {
    const expectedText = 'If you think that you will be unable to respond to a claim before this deadline, you can request more time.';
    const paragraph = htmlDocument.getElementsByClassName('govuk-body')[0];
    expect(paragraph.innerHTML).toContain(expectedText);
  });

  it('should display second sub header', () => {
    const header = htmlDocument.getElementsByClassName('govuk-heading-m')[1];
    expect(header.innerHTML).toContain('How much extra time can you request?');
  });

  it('should display extension of up 28 days paragraph', () => {
    const expectedText = 'If you want to request an extension of up to 28 days, you\'ll need to ask the other party\'s legal representative directly.';
    const paragraph = htmlDocument.getElementsByClassName('govuk-body')[1];
    expect(paragraph.innerHTML).toContain(expectedText);
  });

  it('should display extension of more than 28 days paragraph', () => {
    const expectedText = 'If you want to request an extension of more than 28 days, or if your extension request has been rejected by the other party\'s legal representative, you\'ll need to apply to the court.';
    const paragraph = htmlDocument.getElementsByClassName('govuk-body')[2];
    expect(paragraph.innerHTML).toContain(expectedText);
  });

  it('should display continue button',() => {
    const button = htmlDocument.getElementsByClassName('govuk-button')[0];
    expect(button.innerHTML).toContain('Continue');
    expect(button.getAttribute('href')).toEqual('./response-deadline-options');
  });

  it('should display contact us for help', () => {
    const summary = htmlDocument.getElementsByClassName('govuk-details__summary-text')[0];
    expect(summary.innerHTML).toContain('Contact us for help');
  });
});
