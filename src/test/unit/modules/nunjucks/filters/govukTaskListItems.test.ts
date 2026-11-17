import {TaskItem} from 'models/taskList/task';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';
import {toDashboardGovukTaskListItems, toGovukTaskListItems} from 'modules/nunjucks/filters/govukTaskListItems';
import {taskListTranslate} from '../../../../utils/renderTaskLists';

const {JSDOM} = require('jsdom');

describe('fork journey task adapter reconciled with master', () => {
  it.each([{tasks: undefined}, {tasks: null}, {tasks: []}])('handles an absent or empty collection ($tasks)', ({tasks}) => {
    expect(toGovukTaskListItems(tasks, key => key)).toEqual([]);
  });

  it.each(['en', 'cy'])('keeps ordering, translated copy, hints and colours (%s)', lang => {
    const t = taskListTranslate(lang);
    const tasks = [new TaskItem('PAGES.CLAIM_TASK_LIST.YOUR_DETAILS', '/details', TaskStatus.INCOMPLETE),
      new TaskItem('PAGES.CLAIM_TASK_LIST.CLAIM_AMOUNT', '/amount', TaskStatus.ACTION_NEEDED, false, 'govuk-tag--red', 'COMMON.DESCRIPTION')];
    const items = toGovukTaskListItems(Object.freeze(tasks.map(task => Object.freeze(task))), t);
    expect(items.map(item => item.title.text)).toEqual(tasks.map(task => t(task.description)));
    expect(items.map(item => item.href)).toEqual(['/details', '/amount']);
    expect(items[0].status.tag).toEqual({text: t('PAGES.TASK_LIST.INCOMPLETE'), classes: 'govuk-tag--grey'});
    expect(items[1].status.tag.classes).toBe('govuk-tag--red');
    expect(items[1].hint?.text).toBe(t('COMMON.DESCRIPTION'));
    expect(items.every(item => item.classes === 'app-task-list__item')).toBe(true);
  });

  it.each([TaskStatus.COMPLETE, TaskStatus.DONE, TaskStatus.DONE_NO_URL, TaskStatus.IN_PROGRESS, TaskStatus.READY_TO_VIEW])('preserves a valid URL for status %s', status => {
    expect(toGovukTaskListItems([new TaskItem('Task', '/edit', status)], key => key)[0].href).toBe('/edit');
  });

  it('does not infer a missing URL from the duplicate DONE enum value', () => {
    expect(TaskStatus.DONE).toBe(TaskStatus.DONE_NO_URL);
    const items = toGovukTaskListItems([new TaskItem('Completed', '/done', TaskStatus.DONE), new TaskItem('No URL', '', TaskStatus.DONE_NO_URL)], key => key);
    expect(items.map(item => item.href)).toEqual(['/done', undefined]);
  });

  it.each(['', ' ', undefined])('does not introduce a link for an absent URL (%s)', url => {
    expect(toGovukTaskListItems([new TaskItem('Task', url, TaskStatus.COMPLETE)], key => key)[0].href).toBeUndefined();
  });

  it('keeps unavailable tasks unlinked and ordinary descriptions in escaped-text fields', () => {
    const task = new TaskItem('<strong>Unavailable</strong>', '/not-available', TaskStatus.NOT_AVAILABLE_YET);
    const [item] = toGovukTaskListItems([task], key => key);
    expect(item.href).toBeUndefined();
    expect(item.title).toEqual({text: '<strong>Unavailable</strong>'});
    expect(task.url).toBe('/not-available');
  });
});

describe('fork dashboard adapter preserving the existing HTML contract', () => {
  it.each([{tasks: undefined}, {tasks: null}, {tasks: []}])('handles an absent or empty collection ($tasks)', ({tasks}) => {
    expect(toDashboardGovukTaskListItems(tasks, 'en')).toEqual([]);
  });

  it.each(['en', 'cy'])('maps a simple anchor without nesting it (%s)', lang => {
    const task = new DashboardTask('1', '<a href="/en" class="govuk-link custom">English &amp; details</a>', '<a href="/cy" class="govuk-link custom">Cymraeg</a>', 'Complete', 'Cyflawn', 'govuk-tag--green', 'Hint EN', 'Hint CY');
    const before = JSON.stringify(task);
    const [item] = toDashboardGovukTaskListItems(Object.freeze([Object.freeze(task)]), lang);
    expect(item.href).toBe(lang === 'cy' ? '/cy' : '/en');
    expect(item.title.html).not.toContain('<a');
    expect(item.title.classes).toBe('custom');
    expect(item.hint?.text).toBe(lang === 'cy' ? 'Hint CY' : 'Hint EN');
    expect(item.status.tag.text).toBe(lang === 'cy' ? 'Cyflawn' : 'Complete');
    expect(JSON.stringify(task)).toBe(before);
  });

  it('preserves rich links and their attributes while adding resolvable status/hint IDs', () => {
    const name = 'Read <a class="govuk-link" href="/one" target="_blank" rel="noopener noreferrer" aria-describedby="existing-hint">one</a> or <a href="/two" aria-label="Second document">two</a><span id="existing-hint">Existing hint</span>';
    const task = new DashboardTask('1', name, name, 'Done', 'Wedi’i wneud', 'govuk-tag--green', 'Hint', 'Awgrym');
    const [item] = toDashboardGovukTaskListItems([task], 'en', 'list-2');
    expect(item.href).toBeUndefined();
    const fragment = JSDOM.fragment(item.title.html);
    const links = [...fragment.querySelectorAll('a')] as HTMLAnchorElement[];
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/one', '/two']);
    expect(links[0].getAttribute('target')).toBe('_blank');
    expect(links[0].getAttribute('rel')).toBe('noopener noreferrer');
    expect(links[0].getAttribute('aria-describedby')).toBe('existing-hint list-2-1-hint list-2-1-status');
    expect(links[1].getAttribute('aria-label')).toBe('Second document');
    expect(links[1].getAttribute('aria-describedby')).toBe('list-2-1-hint list-2-1-status');
    expect(task.taskNameEn).toBe(name);
  });

  it('preserves order, missing optional values and unavailable anchors without adding links', () => {
    const items = toDashboardGovukTaskListItems([new DashboardTask('1', '<a>Unavailable</a>'), new DashboardTask('2'), new DashboardTask('3', 'Text &amp; details')], 'en');
    expect(items[0].href).toBeUndefined();
    expect(items[0].title.html).toBe('<a>Unavailable</a>');
    expect(items[1].title).toEqual({text: ''});
    expect(items[1].status.tag).toEqual({text: '', classes: ''});
    expect(items[2].title).toEqual({text: 'Text & details'});
  });

  it('keeps the existing English hint gate when optional Welsh values differ', () => {
    const tasks = [new DashboardTask('1', 'EN', 'CY', 'Done', 'Wedi', '', '', 'Welsh-only hint'),
      new DashboardTask('2', 'EN', 'CY', 'Done', 'Wedi', '', 'English hint', '')];
    expect(toDashboardGovukTaskListItems(tasks, 'cy').map(item => item.hint)).toEqual([undefined, undefined]);
  });
});
