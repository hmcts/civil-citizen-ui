import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {FIRST_CONTACT_CLAIM_SUMMARY_URL} from '../../../../../../main/routes/urls';
import {mockCivilClaimWithTimelineAndEvidence} from '../../../../../utils/mockDraftStore';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('First contact - Claim Summary View', () => {
// TODO: remove this once paths become publicly available as mocking the response token will not be needed
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let htmlDocument: Document;

  beforeEach(async () => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.request['cookies'] = {'firstContact': {claimId: '1645882162449404', pinVerified: YesNo.YES}};
    app.locals.draftStoreClient = mockCivilClaimWithTimelineAndEvidence;
    const response = await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL);
    const dom = new JSDOM(response.text);
    htmlDocument = dom.window.document;
  });

  it('should have correct page title', () => {
    expect(htmlDocument.title).toEqual('Your money claims account - Claim details');
  });

  it('should display header', () => {
    const header = htmlDocument.getElementsByClassName('govuk-heading-l');
    expect(header[0].innerHTML).toContain('Claim details');
  });

  it('should display claim number', () => {
    const claimNumber = htmlDocument.getElementsByClassName('govuk-body')[0];
    expect(claimNumber.innerHTML).toContain('Claim number');
    expect(claimNumber.innerHTML).toContain('000MC009');
  });

  it('should display claim amount', () => {
    const claimAmount = htmlDocument.getElementsByClassName('govuk-body')[1];
    expect(claimAmount.innerHTML).toContain('Claim amount');
    expect(claimAmount.innerHTML).toContain('£1,336.82');
  });

  it('should display view amount breakdown', () => {
    const details = htmlDocument.getElementsByClassName('govuk-details__summary-text');
    const tableHeaders = htmlDocument.getElementsByClassName('govuk-table__header');
    expect(details[0].innerHTML).toContain('View amount breakdown');
    expect(tableHeaders[0].innerHTML).toContain('Amount breakdown');
    expect(tableHeaders[1].innerHTML).toContain('Amount');
  });

  it('should display reason for claim text and reason', () => {
    const subHeadings = htmlDocument.getElementsByClassName('govuk-heading-s');
    const claimReason = htmlDocument.getElementsByClassName('govuk-body')[2];
    expect(subHeadings[0].innerHTML).toContain('Reason for claim:');
    expect(claimReason.innerHTML).toContain('Test details of claim');
  });

  it('should display timeline, date and what happened headings and time line of events', () => {
    const subHeadings = htmlDocument.getElementsByClassName('govuk-heading-s')[1];
    const tableHeaders = htmlDocument.getElementsByClassName('govuk-table__header');
    const rows = htmlDocument.getElementsByClassName('time-line');
    const cells = rows[0].getElementsByClassName('govuk-table__cell');
    expect(subHeadings.innerHTML).toContain('Timeline');
    expect(tableHeaders[2].innerHTML).toContain('Date');
    expect(tableHeaders[3].innerHTML).toContain('What happened');
    expect(cells[0].innerHTML).toContain('1 April 2022');
    expect(cells[1].innerHTML).toContain('I contacted Mary Richards to discuss building works on our roof.');
  });

  it('should display evidence, type and description headings', () => {
    const subHeadings = htmlDocument.getElementsByClassName('govuk-heading-s')[2];
    const tableHeaders = htmlDocument.getElementsByClassName('govuk-table__header');
    const rows = htmlDocument.getElementsByClassName('time-line')[1];
    const cells = rows.getElementsByClassName('govuk-table__cell');
    expect(subHeadings.innerHTML).toContain('Evidence');
    expect(tableHeaders[4].innerHTML).toContain('Type');
    expect(tableHeaders[5].innerHTML).toContain('Description');
    expect(cells[0].innerHTML).toContain('7 April 2022');
    expect(cells[1].innerHTML).toContain('We agreed what work should be done and signed contract.');
  });

  it('should display respond to claim button', () => {
    const button = htmlDocument.getElementsByClassName('govuk-button')[0];
    expect(button.innerHTML).toContain('Respond to claim');
  });

  it('should display how we use and store personal information component', () => {
    const details = htmlDocument.getElementsByClassName('govuk-details__summary-text')[2];
    const detailsTextWrapper = htmlDocument.getElementsByClassName('govuk-details')[2].getElementsByClassName('govuk-details__text')[0];
    const detailsText = detailsTextWrapper.getElementsByClassName('govuk-body');
    expect(details.innerHTML).toContain('How we use and store your personal information');
    expect(detailsText[0].innerHTML).toContain('This claim contains personal information about you that Mr. Jan Clark has provided, for example your name and address.');
    expect(detailsText[1].innerHTML).toContain('Find out about how we use and store your');
    expect(detailsText[1].getElementsByTagName('a')[0].innerHTML).toContain('personal information');
  });

  it('should contain contact us for help component', () => {
    const details = htmlDocument.getElementsByClassName('govuk-details__summary-text')[3];
    expect(details.innerHTML).toContain('Contact us for help');
  });
});
