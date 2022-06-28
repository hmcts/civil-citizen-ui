import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';
import {CLAIM_TASK_LIST_URL} from '../../../../../main/routes/urls';
import {TaskStatus} from '../../../../../main/common/models/taskList/TaskStatus';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;

const taskSection = 'app-task-list__section';
const taskSectionNumber = 'app-task-list__section-number';
const taskListItems = 'app-task-list__items';
const taskLIstItem = 'app-task-list__item';
const taskName = 'app-task-list__task-name';
const taskTag = 'app-task-list__tag';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Task List View', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  describe('on GET', () => {
    let htmlDocument: Document;
    beforeEach(async () => {
      nock(idamUrl)
        .post('/o/token')
        .reply(200, {id_token: citizenRoleToken});
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).get(CLAIM_TASK_LIST_URL);
      const dom = new JSDOM(response.text);
      htmlDocument = dom.window.document;
    });

    it('should have title set', () => {
      expect(htmlDocument.title).toContain('Your money claims account - Your task list');
    });

    it('should display header', () => {
      const header = htmlDocument.getElementsByClassName('govuk-fieldset__heading');
      expect(header[0].innerHTML).toContain('Respond to a money claim');
    });

    describe('Section 1 - Prepare your response', () => {
      it('should display section 1 header', () => {
        const sectionHeader = htmlDocument.getElementsByClassName(taskSection);
        const sectionNumber = htmlDocument.getElementsByClassName(taskSectionNumber);
        expect(sectionHeader[0].innerHTML).toContain('Prepare your response');
        expect(sectionNumber[0].innerHTML).toContain('1');
      });

      it('should display confirm your details incomplete task', () => {
        const task = htmlDocument.getElementsByClassName(taskListItems)[0].getElementsByClassName(taskLIstItem)[0];
        expect(task.getElementsByClassName(taskName)[0].innerHTML).toContain('Confirm your details');
        expect(task.getElementsByClassName(taskTag)[0].innerHTML).toContain(TaskStatus.INCOMPLETE);
      });
    });

    describe('Section 2 - Respond to claim', () => {
      it('should display section 2 header', () => {
        const sectionHeader = htmlDocument.getElementsByClassName(taskSection);
        const sectionNumber = htmlDocument.getElementsByClassName(taskSectionNumber);
        expect(sectionHeader[1].innerHTML).toContain('Respond to claim');
        expect(sectionNumber[1].innerHTML).toContain('2');
      });

      it('should display choose a response incomplete task', () => {
        const task = htmlDocument.getElementsByClassName(taskListItems)[1].getElementsByClassName(taskLIstItem)[0];
        expect(task.getElementsByClassName(taskName)[0].innerHTML).toContain('Choose a response');
        expect(task.getElementsByClassName(taskTag)[0].innerHTML).toContain(TaskStatus.INCOMPLETE);
      });
    });

    describe('Section 3 - Submit', function () {
      it('should display section 3 header', () => {
        const sectionHeader = htmlDocument.getElementsByClassName(taskSection);
        const sectionNumber = htmlDocument.getElementsByClassName(taskSectionNumber);
        expect(sectionHeader[2].innerHTML).toContain('Submit');
        expect(sectionNumber[2].innerHTML).toContain('3');
      });

      it('should display check and submit incomplete task', () => {
        const task = htmlDocument.getElementsByClassName(taskListItems)[2].getElementsByClassName(taskLIstItem)[0];
        expect(task.getElementsByClassName(taskName)[0].innerHTML).toContain('Check and submit your response');
        expect(task.getElementsByClassName(taskTag)[0].innerHTML).toContain(TaskStatus.INCOMPLETE);
      });
    });
  });
});
