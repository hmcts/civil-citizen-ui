import nock from 'nock';
import config from 'config';
import {CIVIL_SERVICE_DASHBOARD_TASKLIST_URL, CIVIL_SERVICE_NOTIFICATION_LIST_URL} from 'client/civilServiceUrls';
import {DashboardNotification} from 'models/dashboard/dashboardNotification';
import {CivilServiceDashboardTask} from 'models/dashboard/taskList/civilServiceDashboardTask';
import {DashboardTaskStatus} from 'models/dashboard/taskList/dashboardTaskStatus';
import {getDashboardById, getNotificationById} from 'modules/utilityService';
import {AppRequest} from 'models/AppRequest';
import {req} from '../../utils/UserDetails';
import {Claim} from 'models/claim';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {Dashboard} from 'models/dashboard/dashboard';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';

jest.mock('modules/draft-store/draftStoreService');

describe('utilityService', () => {

  const civilServiceUrl = config.get<string>('services.civilService.url');
  const notification: DashboardNotification = {id: 123, titleEn: 'title', titleCy: 'title CY', descriptionEn:'descriptionEn', descriptionCy:'descriptionCy'};
  const task: CivilServiceDashboardTask = {
    id: 123, categoryEn: 'category EN', categoryCy: 'category CY', taskNameEn: 'task name EN', taskNameCy:'task name CY',
    currentStatusEn: DashboardTaskStatus.NOT_AVAILABLE_YET, currentStatusCy: 'Not available yet', hintTextEn: 'hint text EN', hintTextCy: 'hint text CY', url: '#',
  };

  const taskList: DashboardTaskList = {
    categoryEn: 'category EN', categoryCy: 'category CY', tasks: [
      {
        id: 123, taskNameEn: 'task name EN', taskNameCy: 'task name CY', statusEn: 'Not available yet', statusCy: 'Not available yet',
        statusColour: 'govuk-tag--grey', url:'#', hintTextEn: 'hint text EN', hintTextCy: 'hint text CY',
      },
    ],
  };

  const claim: Claim = new Claim();
  claim.id = '123';

  it('getNotificationById', async () => {

    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_NOTIFICATION_LIST_URL.replace(':ccd-case-identifier', '123').replace(':role-type', 'claimant'))
      .reply(200, [notification]);

    const notificationsReceived = await getNotificationById('123', claim, 'claimant', (<AppRequest> req));
    const noticiationsExpected: DashboardNotificationList = {items: [notification]};

    expect(notificationsReceived).toEqual(noticiationsExpected);

  });

  it('getDashboardById', async () => {

    //given
    nock(civilServiceUrl)
      .get(CIVIL_SERVICE_DASHBOARD_TASKLIST_URL.replace(':ccd-case-identifier', '123').replace(':role-type', 'claimant'))
      .reply(200, [task]);

    //when
    const tasksReceived = await getDashboardById('123', claim, 'claimant', (<AppRequest> req));

    //then
    const tasksExpected: Dashboard = {items: [taskList]};

    expect(tasksReceived).toEqual(tasksExpected);

  });

});
