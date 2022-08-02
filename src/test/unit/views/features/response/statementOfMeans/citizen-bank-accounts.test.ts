import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {CITIZEN_BANK_ACCOUNT_URL} from '../../../../../../main/routes/urls';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

describe('Citizen Bank Accounts View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    app.locals.draftStoreClient = mockCivilClaim;
  });

  describe('on GET', () => {
    let htmlDocument: Document;

    beforeEach(async () => {
      const response = await request(app).get(CITIZEN_BANK_ACCOUNT_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have correct page title', () => {
      expect(htmlDocument.title).toEqual('Your money claims account - Your bank accounts');
    });

    it('should have correct main header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-heading-l')[0];
      expect(header.innerHTML).toContain('List your bank and savings accounts');
    });

    it('should have overdrawn example', () => {
      const expectedText = 'Put a minus (-) in front of the amount if you’re overdrawn. For example £-804.45.';
      const paragraph = htmlDocument.getElementsByClassName('govuk-body')[0];
      expect(paragraph.innerHTML).toContain(expectedText);
    });

    it('should display three input labels', () => {
      const labels = htmlDocument.getElementsByClassName('govuk-label--s');
      expect(labels.length).toBe(3);
      expect(labels[0].innerHTML).toContain('Type of account');
      expect(labels[1].innerHTML).toContain('Joint account');
      expect(labels[2].innerHTML).toContain('Balance');
    });

    it('should display add another account button', () => {
      const button = htmlDocument.getElementsByClassName('govuk-button--secondary')[0];
      expect(button.innerHTML).toContain('Add another account');
    });

    it('should display save continue button',() => {
      const button = htmlDocument.getElementsByClassName('govuk-button')[1];
      expect(button.innerHTML).toContain('Save and continue');
    });

    it('should display contact us for help', () => {
      const summary = htmlDocument.getElementsByClassName('govuk-details__summary-text')[0];
      expect(summary.innerHTML).toContain('Contact us for help');
    });
  });

  describe('on POST', () => {
    let htmlDocument: Document;
    const mockAccounts = [{ typeOfAccount: '', joint: 'true', balance: '' }, { typeOfAccount: '', joint: '', balance: '10' }];

    beforeEach(async () => {
      const response = await request(app).post(CITIZEN_BANK_ACCOUNT_URL)
        .send({accounts: mockAccounts});
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should display error summary', () => {
      const errorSummaryTitle = htmlDocument.getElementsByClassName('govuk-error-summary__title')[0];
      const errorSummaryMessages = htmlDocument.getElementsByClassName('govuk-error-summary__list')[0]
        .getElementsByTagName('li');
      expect(errorSummaryTitle.innerHTML).toContain('There was a problem');
      expect(errorSummaryMessages[2].innerHTML).toContain('Select a type of account');
      expect(errorSummaryMessages[2].getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#accounts[0][typeOfAccount]');
      expect(errorSummaryMessages[3].innerHTML).toContain('Enter a valid number');
      expect(errorSummaryMessages[3].getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#accounts[0][balance]');
      expect(errorSummaryMessages[5].innerHTML).toContain('Select a type of account');
      expect(errorSummaryMessages[5].getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#accounts[1][typeOfAccount]');
      expect(errorSummaryMessages[6].innerHTML).toContain('Select an option');
      expect(errorSummaryMessages[6].getElementsByTagName('a')[0].getAttribute('href'))
        .toContain('#accounts[1][joint]');
    });

    it('should display from group errors', () => {
      const formGroupErrors = htmlDocument.getElementsByClassName('govuk-form-group--error');
      const accountOneErrors = formGroupErrors[0].getElementsByClassName('govuk-error-message');
      const accountTwoErrors = formGroupErrors[1].getElementsByClassName('govuk-error-message');
      expect(formGroupErrors.length).toBe(2);
      expect(accountOneErrors[1].innerHTML).toContain('Select a type of account');
      expect(accountOneErrors[2].innerHTML).toContain('Enter a valid number');
      expect(accountTwoErrors[1].innerHTML).toContain('Select a type of account');
      expect(accountTwoErrors[2].innerHTML).toContain('Select an option');
    });

    it('should display error classes for correct inputs', () => {
      const selectErrorClass = 'govuk-select--error';
      const inputErrorClass = 'govuk-input--error';
      const selectLists = htmlDocument.getElementsByClassName('govuk-select');
      const inputsList = htmlDocument.getElementsByClassName('govuk-input');
      expect(selectLists[0].classList.contains(selectErrorClass)).toBeTruthy();
      expect(selectLists[1].classList.contains(selectErrorClass)).toBeFalsy();
      expect(selectLists[2].classList.contains(selectErrorClass)).toBeTruthy();
      expect(selectLists[3].classList.contains(selectErrorClass)).toBeTruthy();
      expect(inputsList[0].classList.contains(inputErrorClass)).toBeTruthy();
      expect(inputsList[1].classList.contains(inputErrorClass)).toBeFalsy();
    });
  });
});
