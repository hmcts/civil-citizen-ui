import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  mockCivilClaim,
  mockCivilClaimPDFTimeline,
} from '../../../../utils/mockDraftStore';
import {mockClaim as mockResponse} from '../../../../utils/mockClaim';
import {getTotalAmountWithInterestAndFees} from '../../../../../main/modules/claimDetailsService';
import {dateFilter} from '../../../../../main/modules/nunjucks/filters/dateFilter';
import {convertToPoundsFilter} from '../../../../../main/common/utils/currencyFormat';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Task List View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let htmlDocument: Document;
  const claim = require('../../../../utils/mocks/civilClaimResponseMock.json');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    beforeEach(async () => {
      nock('http://localhost:4000')
        .get('/cases/1111')
        .reply(200, mockResponse);
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).get('/case/1111/response/claim-details');
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have title set', () => {
      expect(htmlDocument.title).toContain('Your money claims account - Claim Details');
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Claim details');
    });

    it('should display claim number text and value', () => {
      const claimDetails = htmlDocument.getElementsByClassName('govuk-body');
      expect(claimDetails[0].innerHTML).toContain('Claim number');
      expect(claimDetails[0].innerHTML).toContain(claim.case_data.legacyCaseReference);
    });

    it('should display claim amount text and value', () => {
      const claimDetails = htmlDocument.getElementsByClassName('govuk-body');
      expect(claimDetails[1].innerHTML).toContain('Claim amount');
      expect(claimDetails[1].innerHTML).toContain(getTotalAmountWithInterestAndFees(claim.case_data));
    });

    it('should contain View amount breakdown details component', () => {
      const details = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      const tableHeaders = htmlDocument.getElementsByClassName('govuk-table__header');
      const tableCells = htmlDocument.getElementsByClassName('govuk-table__cell');
      expect(details[0].innerHTML).toContain('View amount breakdown');
      expect(tableHeaders[0].innerHTML).toContain('Amount breakdown');
      expect(tableHeaders[1].innerHTML).toContain('Amount');
      expect(tableCells[0].innerHTML).toContain(claim.case_data.claimAmountBreakup[0].value.claimReason);
      expect(tableCells[1].innerHTML).toContain(convertToPoundsFilter(claim.case_data.claimAmountBreakup[0].value.claimAmount));
    });

    it('should contain Interest details component', () => {
      const details = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      const tableCells = htmlDocument.getElementsByClassName('govuk-table__cell');
      const interestText = htmlDocument.getElementsByClassName('govuk-details__text');
      expect(details[1].innerHTML).toContain('Interest');
      expect(tableCells[3].innerHTML).toContain(claim.case_data.totalInterest);
      expect(interestText[1].innerHTML).toContain('Interest calculated at 8% for 3 days (20 May 2022 to 23 May 2022)');
    });

    it('should contain Claim fee and Claim total text and values', () => {
      const tableCells = htmlDocument.getElementsByClassName('govuk-table__cell');
      expect(tableCells[4].innerHTML).toContain('Claim fee');
      expect(tableCells[5].innerHTML).toContain(convertToPoundsFilter(claim.case_data.claimFee.calculatedAmountInPence));
      expect(tableCells[6].innerHTML).toContain('Claim Total');
      expect(tableCells[7].innerHTML).toContain(getTotalAmountWithInterestAndFees(claim.case_data));
    });

    it('should display reason for claim text and reason', () => {
      const subHeadings = htmlDocument.getElementsByClassName('govuk-heading-s');
      const claimReason = htmlDocument.getElementsByClassName('govuk-body')[2];
      expect(subHeadings[0].innerHTML).toContain('Reason for claim');
      expect(claimReason.innerHTML).toContain(claim.case_data.detailsOfClaim);
    });

    it('should display Timeline, Date and What happened headings and time line of events', () => {
      const subHeadings = htmlDocument.getElementsByClassName('govuk-heading-s');
      const tableHeaders = htmlDocument.getElementsByClassName('govuk-table__header');
      const timeLineRows = htmlDocument.getElementsByClassName('time-line');
      const timeLineCells = timeLineRows[0].getElementsByClassName('govuk-table__cell');
      expect(subHeadings[1].innerHTML).toContain('Timeline');
      expect(tableHeaders[2].innerHTML).toContain('Date');
      expect(tableHeaders[3].innerHTML).toContain('What happened');
      expect(timeLineCells[0].innerHTML).toContain(dateFilter(claim.case_data.timelineOfEvents[0].value.timelineDate));
      expect(timeLineCells[1].innerHTML).toContain(claim.case_data.timelineOfEvents[0].value.timelineDescription);
    });

    it('should display Download and view their Timeline text', async () => {
      app.locals.draftStoreClient = mockCivilClaimPDFTimeline;
      const response = await request(app).get('/case/1111/response/claim-details');
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      const downloadLink = htmlDocument.getElementById('timeline-link') as HTMLAnchorElement;
      expect(downloadLink.innerHTML).toContain('Download and view timeline');
      expect(downloadLink.href).toContain('case/1111/documents/timeline');
    });

    it('should display download the claim text and link', () => {
      const subHeadings = htmlDocument.getElementsByClassName('govuk-body');
      const downloadLink = htmlDocument.getElementById('sealed-claim-link') as HTMLAnchorElement;
      expect(subHeadings[4].innerHTML).toContain('Download the claim');
      expect(downloadLink.innerHTML).toContain('Download claim (PDF)');
      expect(downloadLink.href).toContain('case/1111/documents/sealed-claim');
    });

    it('should contain contact us detail component', () => {
      const details = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      expect(details[2].innerHTML).toContain('Contact us for help');
    });
  });
});
