import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../main/app';
import {mockCivilClaim} from '../../../utils/mockDraftStore';
import {DQ_DEFENDANT_EXPERT_EVIDENCE_URL} from '../../../../main/routes/urls';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store');

describe('Tried to settle the defendant expert evidence view', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let mainWrapper: Element;

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).get(DQ_DEFENDANT_EXPERT_EVIDENCE_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      mainWrapper = htmlDocument.getElementsByClassName('govuk-main-wrapper')[0];
    });

    it('should have page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - Defendant expert evidence');
    });

    it('should display the header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Do you want to use expert evidence?');
    });

    it('should display paragraph with steps', () => {
      let paragraph = mainWrapper.getElementsByClassName('govuk-body')[0];
      expect(paragraph.innerHTML).toContain('An expert is not a legal representative.');
      paragraph = mainWrapper.getElementsByClassName('govuk-body')[1];
      expect(paragraph.innerHTML).toContain('Expert evidence is an opinion based on the expertise of a specialist, for example - a building surveyor who can comment on the quality of building work.');
      paragraph = mainWrapper.getElementsByClassName('govuk-body')[2];
      expect(paragraph.innerHTML).toContain('It will only be allowed if the court cannot make a decision without the expert.');
      paragraph = mainWrapper.getElementsByClassName('govuk-body')[3];
      expect(paragraph.innerHTML).toContain('Experts usually only give written evidence. They may appear at a hearing if the experts disagree, and the court can only decide between their evidence by hearing it in person.');

    });

    it('should display yes no radio buttons', () => {
      const radios = htmlDocument.getElementsByClassName('govuk-radios__input');
      expect(radios[0].getAttribute('value')).toBe('yes');
      expect(radios[1].getAttribute('value')).toBe('no');
    });

    it('should display save and continue button', () => {
      const saveButton = mainWrapper.getElementsByClassName('govuk-button')[0];
      expect(saveButton.innerHTML).toContain('Save and continue');
    });

    it('should display contact us for help', () => {
      const contactUs = htmlDocument.getElementsByClassName('govuk-details');
      expect(contactUs[0].innerHTML).toContain('Contact us for help');
    });
  });

  describe('on POST', () => {
    let htmlDocument: Document;

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).post(DQ_DEFENDANT_EXPERT_EVIDENCE_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should display error in the error summary', () => {
      const error = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0]
        .getElementsByTagName('li')[0];
      expect(error.innerHTML).toContain('Select yes if you want to use expert evidence');
    });

    it('should display error over radios', () => {
      const error = htmlDocument.getElementById('option-error');
      expect(error?.innerHTML).toContain('Select yes if you want to use expert evidence');
    });
  });
});
