import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {Dashboard} from 'models/dashboard/dashboard';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {Claim} from "models/claim";
import {updateQueryManagementDashboardItems} from "services/features/qm/queryManagementService";
import {CaseRole} from "form/models/caseRoles";

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

const mockExpectedDashboardInfo =
  [{
    'categoryEn': 'Hearing',
    'categoryCy': 'Hearing Welsh',
    tasks: [{
      'id': '8c2712da-47ce-4050-bbee-650134a7b9e5',
      'status': 'ACTION_NEEDED',
      'taskNameEn': 'task_name_en',
      'hintTextEn': 'hint_text_en',
      'taskNameCy': 'task_name_cy',
      'hintTextCy': 'hint_text_cy',
    }, {
      'id': '8c2712da-47ce-4050-bbee-650134a7b9e6',
      'status': 'ACTION_NEEDED',
      'taskNameEn': 'task_name_en',
      'hintTextEn': 'hint_text_en',
      'taskNameCy': 'task_name_cy',
      'hintTextCy': 'hint_text_cy',
    }],
  }, {
    'categoryEn': 'Applications',
    'categoryCy': 'Applications Welsh',
    tasks: [{
      'id': '8c2712da-47ce-4050-bbee-650134a7b9e7',
      'statusEn': 'ACTION_NEEDED',
      'statusCy': 'ACTION_NEEDED',
      'statusColour': 'govuk-red',
      'taskNameEn': 'Contact the court to request a change to my case',
      'hintTextEn': 'hint_text_en2',
      'taskNameCy': 'task_name_cy2',
      'hintTextCy': 'hint_text_cy2',
    },
    {
      'id': '8c2712da-47ce-4050-bbee-650134a7b9e8',
      'statusEn': 'ACTION_NEEDED',
      'statusCy': 'ACTION_NEEDED',
      'statusColour': 'govuk-red',
      'taskNameEn': 'task_name_en2',
      'hintTextEn': 'hint_text_en2',
      'taskNameCy': 'task_name_cy2',
      'hintTextCy': 'hint_text_cy2',
    }] as DashboardTask[],
  }] as DashboardTaskList[];

describe('dashboard items update', () => {
  const exclusionTask = new DashboardTaskList('Applications', 'Applications', []);
  const dashboard = new Dashboard(mockExpectedDashboardInfo);
  const claim = new Claim();

  it('should update the header when exclusion matches', () => {
    claim.caseRole = CaseRole.CLAIMANT;
    updateQueryManagementDashboardItems(dashboard, exclusionTask, claim);

    expect(dashboard.items[0].categoryEn).toEqual('Hearing');
    expect(dashboard.items[1].categoryEn).toEqual('COMMON.QUERY_MANAGEMENT_DASHBOARD.APPLICATION_HEADING');
  });

  it('should update the tasks for GA and messages', () => {
    claim.caseRole = CaseRole.CLAIMANT;
    updateQueryManagementDashboardItems(dashboard, exclusionTask, claim);

    expect(dashboard.items[1].tasks[0].taskNameEn).toEqual('COMMON.QUERY_MANAGEMENT_DASHBOARD.APPLICATIONS_TASK');
    expect(dashboard.items[1].tasks[1].taskNameEn).toEqual('COMMON.QUERY_MANAGEMENT_DASHBOARD.VIEW_MESSAGES_TASK');
  });

  it('should update the task status if no queries exist for claimant', () => {
    claim.caseRole = CaseRole.CLAIMANT;
    updateQueryManagementDashboardItems(dashboard, exclusionTask, claim);

    expect(dashboard.items[1].tasks[1].statusEn).toEqual('PAGES.TASK_LIST.NOT_AVAILABLE_YET');
  });

  it('should update the task status if no queries exist for defendant', () => {
    claim.caseRole = CaseRole.DEFENDANT;
    updateQueryManagementDashboardItems(dashboard, exclusionTask, claim);

    expect(dashboard.items[1].tasks[1].statusEn).toEqual('PAGES.TASK_LIST.NOT_AVAILABLE_YET');
  });
});
