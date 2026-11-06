import {JSDOM} from 'jsdom';
import {Task} from 'models/taskList/task';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {DashboardTask} from 'models/dashboard/taskList/dashboardTask';

export interface GovukTaskListItem {
  title: {text?: string; html?: string; classes?: string};
  href?: string;
  hint?: {text: string};
  classes: string;
  status: {tag: {text: string; classes: string}};
}

// Adapted from the fork. A completed task's URL, rather than DONE_NO_URL's
// duplicate enum value, determines whether it can still be visited.
export function toGovukTaskListItems(
  tasks: ReadonlyArray<Task & {helpText?: string}> | null | undefined,
  translate: (key: string) => string,
): GovukTaskListItem[] {
  return (tasks || []).map(task => {
    const item: GovukTaskListItem = {
      title: {text: translate(task.description)},
      classes: 'app-task-list__item',
      status: {tag: {
        text: translate('PAGES.TASK_LIST.' + task.status),
        classes: task.statusColor || (task.status === TaskStatus.INCOMPLETE ? 'govuk-tag--grey' : ''),
      }},
    };
    if (task.url?.trim() && task.status !== TaskStatus.NOT_AVAILABLE_YET) item.href = task.url;
    if (task.helpText) item.hint = {text: translate(task.helpText)};
    return item;
  });
}

export function toDashboardGovukTaskListItems(
  tasks: ReadonlyArray<DashboardTask> | null | undefined,
  lang: string,
  idPrefix = 'dashboard-tasks',
): GovukTaskListItem[] {
  const welsh = lang === 'cy';
  return (tasks || []).map((task, index) => {
    const hintText = welsh ? task.hintTextCy : task.hintTextEn;
    const item: GovukTaskListItem = {
      title: {},
      classes: 'app-task-list__item',
      status: {tag: {
        text: (welsh ? task.statusCy : task.statusEn) || '',
        classes: task.statusColour || '',
      }},
    };
    // Preserve the existing dashboard's English-hint gate in both languages.
    if (task.hintTextEn && hintText) item.hint = {text: hintText};
    const name = (welsh ? task.taskNameCy : task.taskNameEn) || '';
    const fragment = JSDOM.fragment(name);
    const nodes = [...fragment.childNodes].filter(node => node.nodeType !== 3 || node.textContent?.trim());
    const anchor = nodes.length === 1 && nodes[0].nodeName === 'A' ? nodes[0] as HTMLAnchorElement : undefined;
    // The GOV.UK macro does not support arbitrary link attributes. Use its normal
    // link only for a single anchor whose attributes it can faithfully preserve.
    if (anchor?.getAttribute('href')?.trim() && [...anchor.attributes].every(attribute => ['href', 'class'].includes(attribute.name))) {
      item.href = anchor.getAttribute('href');
      item.title = {html: anchor.innerHTML, classes: [...anchor.classList].filter(value => value !== 'govuk-link').join(' ')};
    } else if (!fragment.childElementCount) {
      item.title = {text: fragment.textContent || ''};
    } else {
      // Dashboard names already have a trusted HTML contract. Preserve rich
      // markup/attributes, adding associations to its existing usable links.
      const references = [item.hint ? `${idPrefix}-${index + 1}-hint` : '', `${idPrefix}-${index + 1}-status`].filter(Boolean);
      fragment.querySelectorAll('a[href]').forEach(link => {
        if (!link.getAttribute('href')?.trim()) return;
        const existing = (link.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
        link.setAttribute('aria-describedby', [...new Set([...existing, ...references])].join(' '));
      });
      const container = fragment.ownerDocument.createElement('div');
      container.appendChild(fragment);
      item.title = {html: container.innerHTML};
    }
    return item;
  });
}
