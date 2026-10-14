import path from 'path';
import {TaskItem} from 'models/taskList/task';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {DashboardTaskList} from 'models/dashboard/taskList/dashboardTaskList';
import * as urls from 'routes/urls';
import {renderTaskListPage, taskListPageFixture, taskListTranslate, taskListViews, journeyTaskListFixture} from '../../../utils/renderTaskLists';

const {JSDOM} = require('jsdom');
const nunjucks = require('nunjucks');
const claimantTaskLocators = require('../../../functionalTests/specClaimHelpers/claimantResponseTaskListLocators');
const doms: InstanceType<typeof JSDOM>[] = [];
function parse(html: string): Document {
  const dom = new JSDOM(html);
  doms.push(dom);
  return dom.window.document;
}
const text = (element: Element) => element.textContent!.replace(/\s+/g, ' ').trim();

function associations(document: Document) {
  const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
  expect(new Set(ids).size).toBe(ids.length);
  document.querySelectorAll('[aria-describedby], [aria-labelledby]').forEach(element => {
    for (const attr of ['aria-describedby', 'aria-labelledby']) {
      (element.getAttribute(attr) || '').split(/\s+/).filter(Boolean).forEach(id => expect(document.getElementById(id)).not.toBeNull());
    }
  });
  document.querySelectorAll('.govuk-task-list__item a[href]').forEach(link => {
    const row = link.closest('.govuk-task-list__item')!;
    const refs = link.getAttribute('aria-describedby')!.split(/\s+/);
    expect(refs).toContain(row.querySelector('.govuk-task-list__status')!.id);
    const hint = row.querySelector('.govuk-task-list__hint');
    if (hint) expect(refs).toContain(hint.id);
  });
}

afterEach(() => {
  doms.splice(0).forEach(dom => dom.window.close());
});

describe.each(Object.entries(taskListViews).filter(([name]) => name !== 'dashboard'))('real %s task-list template', (_name, view) => {
  it.each(['en', 'cy'])('preserves section numbering, ordering, task copy, status and links (%s)', lang => {
    const fixture = taskListPageFixture(lang);
    const document = parse(renderTaskListPage(view, fixture, lang));
    const t = taskListTranslate(lang);
    const sections = journeyTaskListFixture();
    const lists = [...document.querySelectorAll('.govuk-task-list')];
    expect(lists).toHaveLength(sections.length);
    lists.forEach((list, index) => {
      expect(text(document.getElementById(list.getAttribute('aria-labelledby')!)!)).toBe(`${index + 1} . ${t(sections[index].title)}`);
      expect(list.querySelectorAll('li')).toHaveLength(sections[index].tasks.length);
    });
    const rows = [...document.querySelectorAll('.govuk-task-list__item')];
    const tasks = sections.flatMap(section => section.tasks);
    rows.forEach((row, index) => {
      expect(row.classList.contains('app-task-list__item')).toBe(true);
      expect(text(row.querySelector('.govuk-task-list__name-and-hint')!)).toBe(t(tasks[index].description));
      expect(text(row.querySelector('.govuk-task-list__status')!)).toBe(t('PAGES.TASK_LIST.' + tasks[index].status));
      expect(row.querySelector('a')?.getAttribute('href')).toBe(tasks[index].url || undefined);
      expect(row.querySelector('.govuk-tag')!.classList.contains('govuk-tag--grey')).toBe(tasks[index].status === TaskStatus.INCOMPLETE);
    });
    expect(lists[2].closest('[role="group"]')!.classList.contains('govuk-!-display-none')).toBe(true);
    associations(document);
  });

  it('escapes ordinary descriptions and does not add links to unavailable or URL-less completed tasks', () => {
    const tasks = [new TaskItem('<img src=x onerror=alert(1) alt="">', '/edit', TaskStatus.DONE),
      new TaskItem('Unavailable', '/blocked', TaskStatus.NOT_AVAILABLE_YET), new TaskItem('No URL', '', TaskStatus.DONE_NO_URL)];
    const html = renderTaskListPage(view, {...taskListPageFixture(), taskLists: [{title: 'Section', tasks}]});
    const document = parse(html);
    expect(html).toContain('&lt;img');
    expect(document.querySelector('img')).toBeNull();
    const rows = [...document.querySelectorAll('.govuk-task-list__item')];
    expect(rows[0].querySelector('a')!.getAttribute('href')).toBe('/edit');
    expect(rows[1].querySelector('a')).toBeNull();
    expect(rows[2].querySelector('a')).toBeNull();
    associations(document);
  });
});

describe.each([TaskStatus.INCOMPLETE, TaskStatus.COMPLETE])('claimant functional task-link selectors (%s)', status => {
  const next = 'CLAIMANT_RESPONSE_TASK_LIST.CHOOSE_WHAT_TODO_NEXT.';
  it.each([
    ['view_defendants_response', 'CLAIMANT_RESPONSE_TASK_LIST.HOW_THEY_RESPONDED.VIEW_DEFENDANTS_RESPONSE', urls.CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL],
    ['accept_or_reject', next + 'ACCEPT_OR_REJECT_ADMITTED', urls.CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL],
    ['accept_or_reject_their_response', next + 'ACCEPT_OR_REJECT_THEIR_RESPONSE', urls.CLAIMANT_RESPONSE_SETTLE_CLAIM_URL],
    ['how_to_formalise_repayment', next + 'HOW_FORMALISE', urls.CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL],
    ['sign_a_settlements_agreement', next + 'SIGN_SETTLEMENT', urls.CLAIMANT_SIGN_SETTLEMENT_AGREEMENT],
    ['request_a_CCJ', next + 'REQUEST_COUNTY_COURT_JUDGMENT', urls.CCJ_EXTENDED_PAID_AMOUNT_URL],
    ['check_and_submit_your_response', 'TASK_LIST.SUBMIT.CHECK_AND_SUBMIT', urls.CLAIMANT_RESPONSE_CHECK_ANSWERS_URL],
    ['decide_whether_to_proceed', next + 'DECIDE_WHETHER_TO_PROCEED', urls.CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL],
    ['free_mediation', next + 'FREE_TELEPHONE_MEDIATION', urls.CITIZEN_FREE_TELEPHONE_MEDIATION_URL],
    ['details_in_case_of_a_hearing', 'TASK_LIST.YOUR_HEARING_REQUIREMENTS.GIVE_US_DETAILS', urls.DETERMINATION_WITHOUT_HEARING_URL],
  ])('finds only the intended link for %s despite component whitespace', (locator, key, route) => {
    const description = taskListTranslate()(key, {admittedAmount: '500.00'});
    const href = route.replace(':id', '1645882162449409');
    const tasks = [
      new TaskItem(description, href, status),
      new TaskItem(description + ' (previous)', '/fixture/other-task', status),
      new TaskItem(description, '/fixture/unavailable', TaskStatus.NOT_AVAILABLE_YET),
    ];
    const document = parse(renderTaskListPage(taskListViews.claimant, {
      ...taskListPageFixture(), taskLists: [{title: 'CLAIMANT_RESPONSE_TASK_LIST.HOW_THEY_RESPONDED.TITLE', tasks}],
    }));
    const matches = document.evaluate(claimantTaskLocators[locator], document, null,
      document.defaultView!.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    expect(matches.snapshotLength).toBe(1);
    expect((matches.snapshotItem(0) as HTMLAnchorElement).getAttribute('href')).toBe(href);
  });
});

describe('surrounding journey content', () => {
  it.each(['en', 'cy'])('retains the draft warning and claimant response instructions (%s)', lang => {
    const t = taskListTranslate(lang);
    const claim = parse(renderTaskListPage(taskListViews.claim, taskListPageFixture(lang), lang));
    expect(text(claim.querySelector('.govuk-warning-text')!)).toContain(t('PAGES.CLAIM_TASK_LIST.DRAFT_CLAIM_WARNING', {date: '31 October 2026'}));
    const claimant = parse(renderTaskListPage(taskListViews.claimant, taskListPageFixture(lang), lang));
    expect(claimant.body.textContent).toContain(t('PAGES.CLAIMANT_RESPONSE_TASK_LIST.HEADER'));
    expect(claimant.body.textContent).toContain(t('PAGES.TASK_LIST.ALL_ACTIONS_COMPLETED_CHECK_ANSWERS'));
  });

  it.each(['en', 'cy'])('retains response deadline information, overdue styling and destinations (%s)', lang => {
    const fixture = taskListPageFixture(lang);
    const claim = fixture.claim as Record<string, unknown>;
    const document = parse(renderTaskListPage(taskListViews.response, {...fixture, claim: {...claim, getRemainingDays: () => -2, isDeadLinePassed: () => true}}, lang));
    expect(document.body.textContent).toContain('20 October 2026');
    expect(document.body.textContent).toContain('000MC001');
    expect(document.querySelector('.due-or-overdue')).not.toBeNull();
    expect(document.querySelector('a[href="/fixture/claim"]')).not.toBeNull();
    expect(document.querySelector('a[href="/fixture/response"]')).not.toBeNull();
  });
});

describe('real redesigned claim dashboard', () => {
  it.each(['en', 'cy'])('preserves categories, HTML links/attributes, hints, statuses and surrounding notifications (%s)', lang => {
    const fixture = taskListPageFixture(lang);
    const html = renderTaskListPage(taskListViews.dashboard, fixture, lang);
    const document = parse(html);
    expect(html).not.toMatch(/<a\b[^>]*>(?:(?!<\/a>)[\s\S])*<a\b/i);
    const lists = [...document.querySelectorAll('.govuk-task-list')];
    expect(lists).toHaveLength(3);
    expect(text(document.getElementById(lists[0].getAttribute('aria-labelledby')!)!)).toBe(lang === 'cy' ? 'Eich hawliad' : 'Your claim');
    const links = [...document.querySelectorAll('.govuk-task-list__item a[href]')];
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/fixture/dashboard-review', '/fixture/documents']);
    expect(text(links[0])).toBe(lang === 'cy' ? 'Adolygu eich hawliad' : 'Review your claim');
    expect(links[1].getAttribute('target')).toBe('_blank');
    expect(links[1].getAttribute('rel')).toBe('noopener noreferrer');
    expect(document.querySelectorAll('.govuk-task-list__hint')).toHaveLength(3);
    expect(document.body.textContent).toContain('Alex Example v Morgan Example');
    expect(document.body.textContent).toContain('1111 2222 3333 4444');
    expect(document.body.textContent).toContain('£1,000');
    expect(document.querySelector('.govuk-warning-text')).not.toBeNull();
    expect(document.querySelectorAll('.govuk-notification-banner')).toHaveLength(2);
    expect(lists[2].closest('[role="group"]')!.classList.contains('govuk-!-display-none')).toBe(true);
    associations(document);
  });

  it('preserves rich accessible names and linkless unavailable tasks', () => {
    const task = new DashboardTask('1', '<a href="/one" aria-label="View the first document"><strong>First</strong></a> and <a href="/two">Second</a>', '', 'Done', '', 'govuk-tag--green', 'Read documents');
    const unavailable = new DashboardTask('2', '<a>Not available</a>', '', 'Not available yet', '', 'govuk-tag--grey');
    const html = renderTaskListPage(taskListViews.dashboard, {...taskListPageFixture(), dashboardTaskList: {items: [new DashboardTaskList('Documents', '', [task, unavailable])]}});
    const document = parse(html);
    expect(html).not.toMatch(/<a\b[^>]*>(?:(?!<\/a>)[\s\S])*<a\b/i);
    expect(document.querySelector('a[href="/one"]')!.getAttribute('aria-label')).toBe('View the first document');
    expect(document.querySelector('a[href="/two"]')).not.toBeNull();
    expect(document.querySelectorAll('.govuk-task-list__item')[1].querySelector('a[href]')).toBeNull();
    associations(document);
  });
});

describe('shared macro', () => {
  it('uses unique IDs when the macro renders multiple independent collections', () => {
    const root = path.resolve(__dirname, '../../../../..');
    const env = new nunjucks.Environment(new nunjucks.FileSystemLoader([path.join(root, 'src/main/views'), path.join(root, 'node_modules/govuk-frontend/dist')]), {autoescape: true});
    const {toGovukTaskListItems} = require('../../../../main/modules/nunjucks/filters/govukTaskListItems');
    env.addGlobal('toGovukTaskListItems', toGovukTaskListItems);
    const document = parse(env.renderString('{% from "macro/task-list.njk" import taskListComponent %}{{ taskListComponent(tasks, t, "first") }}{{ taskListComponent(tasks, t, "second") }}', {tasks: journeyTaskListFixture(), t: taskListTranslate()}));
    expect(document.querySelectorAll('.govuk-task-list')).toHaveLength(6);
    associations(document);
  });
});
