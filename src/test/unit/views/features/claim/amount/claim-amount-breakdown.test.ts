import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {getClaimAmountBreakdownForm} from  '../../../../../../main/services/features/claim/amount/claimAmountBreakdownService';
import {AmountBreakdown} from '../../../../../../main/common/form/models/claim/amount/amountBreakdown';
import {ClaimAmountRow} from '../../../../../../main/common/form/models/claim/amount/claimAmountRow';
import {CLAIM_AMOUNT_URL} from '../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/services/features/claim/amount/claimAmountBreakdownService');

const mockServiceGet = getClaimAmountBreakdownForm as jest.Mock;

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

describe('claim amount view', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    mockServiceGet.mockImplementation(async () => new AmountBreakdown([new ClaimAmountRow(), new ClaimAmountRow()]));
  });

  describe('on GET', ()=> {
    let htmlDocument: Document;

    beforeAll(async () => {
      await request(app).get(CLAIM_AMOUNT_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlDocument = dom.window.document;
      });
    });

    it('should have title set', () => {
      expect(htmlDocument.title).toContain('Claim amount');
    });

    it('should display header', async () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Claim amount');
    });
    it('should display add another row button', ()=> {
      const buttons = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0].getElementsByClassName('govuk-button');
      expect(buttons[0].innerHTML).toContain('Add another row');
    });
    it('should display save and continue button', () => {
      const buttons = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0].getElementsByClassName('govuk-button');
      expect(buttons[1].innerHTML).toContain('Save and continue');
    });

    it('should contain contact us detail component', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details__summary-text');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });

    it('should not display error summary component', () => {
      const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary');
      expect(errorSummary.length).toEqual(0);
    });
  });

  describe('on POST', () => {
    describe('with message', () => {
      let htmlDocument: Document;

      beforeAll(async () => {
        const data = {
          claimAmountRows: [
            {
              reason:'',
              amount:'',
            },
          ],
        };
        await request(app).post(CLAIM_AMOUNT_URL).send(data).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });

      // const getErrorSummaryListElement = (index: number) => htmlDocument.getElementsByClassName('govuk-list govuk-error-summary__list')[0].getElementsByTagName('li')[index];
      it('should display error summary component with message', async ()=>{
        const errorSummary = htmlDocument.getElementsByClassName('govuk-error-summary');
        expect(errorSummary.length).toEqual(1);
        expect(errorSummary[0].innerHTML).toContain('There was a problem');
        const errorSummaryMessage = htmlDocument.getElementsByClassName('govuk-list govuk-error-summary__list')[0]
          .getElementsByTagName('li')[0];
        expect(errorSummaryMessage.innerHTML).toContain(TestMessages.VALID_AMOUNT_BREAKDOWN);
      });
    });

    describe('no reason defined', () => {
      let htmlDocument: Document;

      beforeAll(async () => {
        const data = {
          claimAmountRows: [
            {
              reason:'',
              amount:'1',
            },
          ],
        };
        await request(app).post(CLAIM_AMOUNT_URL).send(data).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });

      it('should display error message when amount is selected with no reason defined', async () => {
        const errorSummaryMessage =  htmlDocument.getElementsByClassName('govuk-list govuk-error-summary__list')[0]
          .getElementsByTagName('li')[2];
        expect(errorSummaryMessage.innerHTML).toContain(TestMessages.VALID_REASON_REQUIRED);
        expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
          .toContain('#claimAmountRows[0][reason]');
      });
    });

    describe('amount selected, no reason defined', () => {
      let htmlDocument: Document;

      beforeAll(async () => {
        const data = {
          claimAmountRows: [
            {
              reason:'tt',
              amount:'',
            },
          ],
        };
        await request(app).post(CLAIM_AMOUNT_URL).send(data).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });

      it('should display error message when amount is selected with no reason defined', async () => {
        const errorSummaryMessage = htmlDocument.getElementsByClassName('govuk-list govuk-error-summary__list')[0]
          .getElementsByTagName('li')[2];
        expect(errorSummaryMessage.innerHTML).toContain(TestMessages.VALID_VALUE);
        expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
          .toContain('#claimAmountRows[0][amount]');
      });
    });

    describe('two decimal places error', () => {
      let htmlDocument: Document;

      beforeAll(async () => {
        const data = {
          claimAmountRows: [
            {
              reason:'tt',
              amount:'3.2345',
            },
          ],
        };
        await request(app).post(CLAIM_AMOUNT_URL).send(data).then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      });

      it('should display error message for two decimal places', async () => {
        const errorSummaryMessage = htmlDocument.getElementsByClassName('govuk-list govuk-error-summary__list')[0]
          .getElementsByTagName('li')[2];
        expect(errorSummaryMessage.innerHTML).toContain(TestMessages.VALID_TWO_DECIMAL_NUMBER);
        expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
          .toContain('#claimAmountRows[0][amount]');
      });
    });
  });
});
