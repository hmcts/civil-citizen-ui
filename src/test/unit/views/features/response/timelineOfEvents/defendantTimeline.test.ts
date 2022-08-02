import config from 'config';
import nock from 'nock';
import {mockCivilClaim, mockCivilClaimPDFTimeline} from '../../../../../utils/mockDraftStore';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {CITIZEN_TIMELINE_URL} from '../../../../../../main/routes/urls';
import {DATE_REQUIRED} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {dateFilter} from '../../../../../../main/modules/nunjucks/filters/dateFilter';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

describe('defendant timeline view', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let htmlDocument: Document;
  const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on Get', () => {
    afterEach(() => {
      app.locals.draftStoreClient = undefined;
    });
    beforeEach(async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app)
        .get(CITIZEN_TIMELINE_URL);
      const dom = new JSDOM(res.text);
      htmlDocument = dom.window.document;
    });
    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Add your timeline of events');
    });
    it('should display their timeline of events', () => {
      const theirTimelineHeader = htmlDocument.getElementsByClassName('govuk-heading-s');
      expect(theirTimelineHeader[0].innerHTML).toContain('Their timeline');
      const tableHeaders = htmlDocument.getElementsByClassName('govuk-table__header');
      expect(tableHeaders[0].innerHTML).toContain('Date');
      expect(tableHeaders[1].innerHTML).toContain('What happened');
      const tableCells = htmlDocument.getElementsByClassName('govuk-table__cell');
      expect(tableCells[0].innerHTML).toContain(dateFilter(claim.case_data.timelineOfEvents[0].value.timelineDate));
      expect(tableCells[1].innerHTML).toContain(claim.case_data.timelineOfEvents[0].value.timelineDescription);
    });
    it('should display pdf document link for their timeline of events', async () => {
      app.locals.draftStoreClient = mockCivilClaimPDFTimeline;
      const res = await request(app)
        .get(CITIZEN_TIMELINE_URL);
      const dom = new JSDOM(res.text);
      htmlDocument = dom.window.document;
      const downloadLink = htmlDocument.getElementById('timeline-link') as HTMLAnchorElement;
      expect(downloadLink.innerHTML).toContain('Download and view their Timeline');
      expect(downloadLink.href).toContain('/case/:id/documents/timeline');
    });
    it('should ask for defendant timeline of events', () => {
      const yourTimelineHeader = htmlDocument.getElementsByClassName('govuk-heading-s govuk-!-margin-bottom-0');
      expect(yourTimelineHeader[0].innerHTML).toContain('Add your timeline of events (optional)');
    });
    it('should display append row button', () => {
      const button = htmlDocument.getElementsByClassName('append-row');
      expect(button[0].innerHTML).toContain('Add another event');
    });
  });
  describe('on POST', () => {
    const data = {
      rows: [
        {
          date: '',
          description: 'something happened',
        },
      ],
    };
    const getErrorSummaryListElement = (index: number) => htmlDocument.getElementsByClassName('govuk-list govuk-error-summary__list')[0].getElementsByTagName('li')[index];
    beforeEach(async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app)
        .post(CITIZEN_TIMELINE_URL).send(data);
      const dom = new JSDOM(res.text);
      htmlDocument = dom.window.document;
    });
    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Add your timeline of events');
    });
    it('should display error summary component', () => {
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary');
      expect(errorSummary.length).toEqual(1);
    });
    it('should display correct error summary message ', () => {
      const errorSummaryMessage = getErrorSummaryListElement(2);
      expect(errorSummaryMessage.innerHTML).toContain(DATE_REQUIRED);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#rows[0][date]');
    });

  });
});

