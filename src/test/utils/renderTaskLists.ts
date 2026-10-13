import path from 'path';
import {createInstance} from 'i18next';
import {TaskItem} from 'models/taskList/task';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {TaskList} from 'models/taskList/taskList';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import {addDaysFilter} from 'modules/nunjucks/filters/dateFilter';
import {toDashboardGovukTaskListItems, toGovukTaskListItems} from 'modules/nunjucks/filters/govukTaskListItems';
import en from '../../main/modules/i18n/locales/en.json';
import cy from '../../main/modules/i18n/locales/cy.json';
import dashboardFixture from '../contract/fixtures/dashboard.json';

const nunjucks = require('nunjucks');
export const taskListViews = {
  claim: 'features/claim/task-list.njk',
  response: 'features/response/task-list.njk',
  claimant: 'features/claimantResponse/claimant-response-task-list.njk',
  dashboard: 'features/dashboard/claim-summary-redesign.njk',
};

export function taskListTranslate(lang = 'en') {
  const instance = createInstance();
  instance.init({lng: lang, fallbackLng: 'en', initImmediate: false, resources: {en: {translation: en}, cy: {translation: cy}}, interpolation: {escapeValue: false}});
  return (key: string, values: Record<string, unknown> = {}) => key ? String(instance.t(key, values)) : '';
}

class ShellLoader extends nunjucks.Loader {
  getSource(name: string) {
    if (name.endsWith('claim-details-tpl.njk') || name.endsWith('claim-details-tpl-dashboard.njk')) {
      return {src: '<!doctype html><html lang=""><body><main>{% block content %}{% endblock %}{% block nestedContent %}{% endblock %}</main></body></html>', path: name, noCache: true};
    }
    return null;
  }
}

export function renderTaskListPage(view: string, locals: Record<string, unknown> = {}, lang = 'en', viewsDirectory?: string): string {
  const root = path.resolve(__dirname, '../../..');
  const env = new nunjucks.Environment([
    new ShellLoader(),
    new nunjucks.FileSystemLoader([viewsDirectory || path.join(root, 'src/main/views'), path.join(root, 'node_modules/govuk-frontend/dist')]),
  ], {autoescape: true});
  env.addGlobal('TaskStatus', TaskStatus);
  env.addGlobal('toGovukTaskListItems', toGovukTaskListItems);
  env.addGlobal('toDashboardGovukTaskListItems', toDashboardGovukTaskListItems);
  env.addFilter('addDays', addDaysFilter);
  return env.render(view, {t: taskListTranslate(lang), lang, ...locals});
}

export function journeyTaskListFixture(): TaskList[] {
  return [
    {title: 'PAGES.CLAIM_TASK_LIST.CONSIDER_OPTIONS', tasks: [
      new TaskItem('PAGES.CLAIM_TASK_LIST.RESOLVING_DISPUTE', '/fixture/resolve', TaskStatus.COMPLETE),
      new TaskItem('PAGES.CLAIM_TASK_LIST.YOUR_DETAILS', '/fixture/details', TaskStatus.DONE),
    ]},
    {title: 'PAGES.CLAIM_TASK_LIST.PREPARE_CLAIM', tasks: [
      new TaskItem('PAGES.CLAIM_TASK_LIST.CLAIM_AMOUNT', '/fixture/amount', TaskStatus.INCOMPLETE),
      new TaskItem('PAGES.CLAIM_TASK_LIST.CLAIM_DETAILS', '', TaskStatus.NOT_AVAILABLE_YET),
    ]},
    {title: 'PAGES.CLAIM_TASK_LIST.SUBMIT', tasks: []},
  ];
}

export function taskListPageFixture(lang = 'en'): Record<string, unknown> {
  const dashboardTasks = dashboardFixture.tasks.map((task, index) => new DashboardTask(task.id,
    index === 0 ? `<a class="govuk-link" href="/fixture/dashboard-review">${task.taskNameEn}</a>` : task.taskNameEn,
    index === 0 ? `<a class="govuk-link" href="/fixture/dashboard-review">${task.taskNameCy}</a>` : task.taskNameCy,
    task.currentStatusEn, task.currentStatusCy, index === 0 ? 'govuk-tag--red' : 'govuk-tag--green', task.hintTextEn, task.hintTextCy));
  dashboardTasks[1].taskNameEn = '<a class="govuk-link" href="/fixture/documents" target="_blank" rel="noopener noreferrer">Prepare documents</a>';
  dashboardTasks[1].taskNameCy = '<a class="govuk-link" href="/fixture/documents" target="_blank" rel="noopener noreferrer">Paratoi dogfennau</a>';
  const t = taskListTranslate(lang);
  return {
    taskLists: journeyTaskListFixture(), title: t('PAGES.CLAIM_TASK_LIST.APPLICATION_INCOMPLETE'), description: t('PAGES.CLAIM_TASK_LIST.AFTER_COMPLETE'),
    draftClaimDeletionDate: '31 October 2026', responseDeadline: '20 October 2026', claimDetailsUrl: '/fixture/claim', responseDetailsUrl: '/fixture/response',
    claim: {totalClaimAmount: 1000, legacyCaseReference: '000MC001', getRemainingDays: () => 2, isDeadLinePassed: () => false,
      getClaimantFullName: () => 'Alex Example', getDefendantFullName: () => 'Morgan Example', isClaimant: () => true},
    claimIdPrettified: '1111 2222 3333 4444', claimAmountFormatted: '£1,000',
    dashboardTaskList: {items: [new DashboardTaskList('Your claim', 'Eich hawliad', dashboardTasks.slice(0, 2)),
      new DashboardTaskList('Hearing', 'Gwrandawiad', dashboardTasks.slice(2)), new DashboardTaskList('Empty', 'Gwag', [])]},
    dashboardNotifications: {items: dashboardFixture.notifications.slice(0, 1)}, showErrorAwaitingTranslation: true,
  };
}
