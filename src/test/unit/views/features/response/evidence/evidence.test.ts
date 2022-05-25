import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {
  CITIZEN_EVIDENCE_URL,
} from '../../../../../../main/routes/urls';
import { EvidenceType } from '../../../../../../main/common/models/evidence/evidenceType';
import { mockCivilClaim } from '../../../../../utils/mockDraftStore';
import { FREE_TEXT_MAX_LENGTH } from '../../../../../../main/common/form/validators/validationConstraints';
import {
  VALID_TEXT_LENGTH,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
const tooLongEvidenceDetails: string = Array(FREE_TEXT_MAX_LENGTH + 2).join('a');

describe('Confirm Mediation Individual Telephone Number', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });
});

describe('Repayment Plan View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let htmlDocument: Document;

  describe('on GET', () => {
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, { id_token: citizenRoleToken });
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CITIZEN_EVIDENCE_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlDocument = dom.window.document;
      });
    });

    it('should display header', async () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('List your evidence');
    });

    it('should display add more evidence button', () => {
      const buttons = htmlDocument.getElementsByClassName('govuk-button');
      expect(buttons[0].innerHTML).toContain('Add more evidence');
    });

    it('should display save and continue button', () => {
      const buttons = htmlDocument.getElementsByClassName('govuk-button');
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

    describe('Select Menu Control', () => {
      it('should display 4 select menu controls', async () => {
        const labels = htmlDocument.querySelectorAll('.select-toggle .govuk-label');
        const select = htmlDocument.getElementsByClassName('govuk-select');
        const option = htmlDocument.querySelectorAll('.govuk-select option');
        expect(select.length).toEqual(4);
        expect(labels.length).toEqual(8);
        expect(option.length).toEqual(32);
        expect(option[0].innerHTML).toEqual('-- Please make a selection --');
        expect(option[1].innerHTML).toEqual(EvidenceType.CONTRACTS_AND_AGREEMENTS);
        expect(option[2].innerHTML).toEqual(EvidenceType.EXPERT_WITNESS);
        expect(option[3].innerHTML).toEqual(EvidenceType.CORRESPONDENCE);
        expect(option[4].innerHTML).toEqual(EvidenceType.PHOTO);
        expect(option[5].innerHTML).toEqual(EvidenceType.RECEIPTS);
        expect(option[6].innerHTML).toEqual(EvidenceType.STATEMENT_OF_ACCOUNT);
        expect(option[7].innerHTML).toEqual(EvidenceType.OTHER);
      });
    });

    describe('Text Area Control', () => {
      it('should display text area controls', async () => {
        const textArea = htmlDocument.getElementById('comment');
        expect(textArea).toBeDefined();
      });
    });
  });

  describe('on POST', () => {
    const getErrorSummaryListElement = (index: number) => htmlDocument.getElementsByClassName('govuk-list govuk-error-summary__list')[0].getElementsByTagName('li')[index];

    beforeEach(async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_EVIDENCE_URL).then(res => {
        const dom = new JSDOM(res.text);
        htmlDocument = dom.window.document;
      });
    });

    it('should display correct error summary message with correct link for comment greater than max length', async () => {
      await request(app)
        .post(CITIZEN_EVIDENCE_URL)
        .send({ comment: tooLongEvidenceDetails, evidenceItem: [{ type: EvidenceType.CONTRACTS_AND_AGREEMENTS, description: 'content here..' }] })
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(0);
      expect(errorSummaryMessage.innerHTML).toContain(VALID_TEXT_LENGTH);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#comment');
    });

    it('should display correct error summary message with correct link for description greater than max length', async () => {
      await request(app)
        .post(CITIZEN_EVIDENCE_URL)
        .send({ comment:'' , evidenceItem: [{ type: EvidenceType.CONTRACTS_AND_AGREEMENTS, description: tooLongEvidenceDetails }] })
        .then(res => {
          const dom = new JSDOM(res.text);
          htmlDocument = dom.window.document;
        });
      const errorSummaryMessage = getErrorSummaryListElement(2);
      expect(errorSummaryMessage.innerHTML).toContain(VALID_TEXT_LENGTH);
      expect(errorSummaryMessage.getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#evidenceItem[0][description]');
    });
  });
});
