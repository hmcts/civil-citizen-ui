import config from 'config';
import nock from 'nock';
import {app} from '../../../../main/app';
import request from 'supertest';
import {EXPERT_GUIDANCE_URL} from '../../../../main/routes/urls';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const govukBodyClass = 'govuk-body';
const pageTitle = 'Expert guidance';

jest.mock('../../../../main/modules/oidc');
jest.mock('../../../../main/modules/draft-store');

describe('Send your response by email View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    let paragraphs: HTMLCollection;

    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      const response = await request(app).get(EXPERT_GUIDANCE_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
      paragraphs = htmlDocument.getElementsByClassName(govukBodyClass);
    });

    it('should have page title', () => {
      expect(htmlDocument.title).toEqual(`Your money claims account - ${pageTitle}`);
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l');
      expect(header[0].innerHTML).toContain('Using an expert in small claims');
    });

    it('should display first paragraph', () => {
      expect(paragraphs[0].innerHTML).toContain('It\'s rare for judges to allow you to use an expert in a small claim.');
      expect(paragraphs[1].innerHTML).toContain('You must ask for permission to use an expert - a judge will then decide whether the expert is necessary.');
      expect(paragraphs[2].innerHTML).toContain('The judge will also decide whether the cost of the expert is reasonable compared to the value of the claim.');
      expect(paragraphs[3].innerHTML).toContain('Even though you and the claimant share the cost of hiring the expert, judges are still responsible for keeping costs in proportion to value.');
    });

    it('should display When an expert is allowed paragraph', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-m');
      expect(header[0].innerHTML).toContain('When an expert is allowed');
      expect(paragraphs[4].innerHTML).toContain('A judge will only allow you to use an expert if they believe they need the expert\'s specialist knowledge.');
      expect(paragraphs[5].innerHTML).toContain('For example, they might allow a structural engineer to be used in a claim about building works or a mechanic in a claim about car repairs.');
      expect(paragraphs[6].innerHTML).toContain('If a judge allows you to use an expert, you\'ll usually have to share one expert with the claimant.');
      expect(paragraphs[7].innerHTML).toContain('The expert will provide a written report - they won\'t usually come to court in person.');
    });

    it('should display Paying for the expert paragraph', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-m');
      expect(header[1].innerHTML).toContain('Paying for the expert');
      expect(paragraphs[8].innerHTML).toContain('The cost of hiring an expert depends on which expert you and the claimant choose.');
      expect(paragraphs[9].innerHTML).toContain('Usually you both share this cost.');
      expect(paragraphs[10].innerHTML).toContain('If you win the case you may be able to recover a maximum of £750 of the cost you paid. A judge will rule on this at the end of the hearing.');
    });

    it('should display If you get permission to use an expert paragraph', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-m');
      expect(header[2].innerHTML).toContain('If you get permission to use an expert');
      expect(paragraphs[11].innerHTML).toContain('The judge may ask one of you to make a list of 3 independent experts who can provide a written report in return for a fee.');
      expect(paragraphs[12].innerHTML).toContain('You must avoid discussing the case in detail with the 3 experts.');
      expect(paragraphs[13].innerHTML).toContain('The other party then chooses one expert from the list. After that, you both need to follow these steps');
      const list = htmlDocument.getElementsByTagName('li');
      expect(list[0].innerHTML).toContain('Provide questions for the expert to answer in a report.');
      expect(list[1].innerHTML).toContain('Provide any extra information the expert asks for.');
      expect(list[2].innerHTML).toContain('Pay the expert - you usually both share this cost.');
      expect(list[3].innerHTML).toContain('Send the expert\'s report to the court (only one of you will have to do this).');
    });

    it('should display Continue button', () => {
      const button = htmlDocument.getElementsByClassName('govuk-button');
      expect(button[0].innerHTML).toContain('Continue');
    });

    it('should display contact us forHelp', () => {
      const contactUsForHelp = htmlDocument.getElementsByClassName('govuk-details');
      expect(contactUsForHelp[0].innerHTML).toContain('Contact us for help');
    });
  });
});
