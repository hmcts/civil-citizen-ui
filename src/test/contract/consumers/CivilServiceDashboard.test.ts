import {MatchersV3, PactV3, SpecificationVersion} from '@pact-foundation/pact';
import {CivilServiceClient} from 'client/civilServiceClient';
import {AppRequest} from 'models/AppRequest';
import {Dashboard} from 'models/dashboard/dashboard';
import {DashboardNotification} from 'models/dashboard/dashboardNotification';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';
import {PACT_DIRECTORY_PATH} from '../utils';
import examples from '../fixtures/dashboard.json';

const CASE_ID = '1111222233334444';
const GA_IDS = ['2222333344445555', '3333444455556666'];
const ITEM_ID = '10000000-0000-4000-8000-000000000001';
const headers = {Authorization: 'Bearer some-access-token', 'Content-Type': 'application/json'};
const request = (): AppRequest => ({params: {id: CASE_ID}, locals: {}, session: {
  user: {id: 'cui-user-id', accessToken: 'some-access-token', givenName: 'Alex', familyName: 'Example'},
  issuedAt: Date.parse('2025-02-03T09:00:00Z') / 1000,
}} as unknown as AppRequest);

function assertNotifications(list: DashboardNotificationList) {
  expect(list).toBeInstanceOf(DashboardNotificationList);
  // The same user's Click notification is removed; absent and other-user actions survive.
  expect(list.items).toEqual([examples.notifications[0], examples.notifications[2]]);
  expect(list.items[0].descriptionEn).toContain('href="/case/1111222233334444"');
  expect(list.items[0].descriptionCy).toContain('Gweld eich achos');
  expect(list.items[1].notificationAction).toMatchObject({actionPerformed: 'Click', createdBy: 'Sam Example', createdAt: '2025-02-03T08:30:00Z'});
}

describe('Civil Service dashboard tasks, notifications and updates', () => {
  let provider: PactV3;
  beforeEach(() => {
    provider = new PactV3({consumer: 'civil_citizen_ui', provider: 'civil_service',
      spec: SpecificationVersion.SPECIFICATION_VERSION_V4, dir: PACT_DIRECTORY_PATH, logLevel: 'warn'});
  });
  const exercise = (check: (client: CivilServiceClient) => Promise<void>) =>
    provider.executeTest(server => check(new CivilServiceClient(server.url)));

  describe.each(['CLAIMANT', 'DEFENDANT'])('%s dashboard', role => {
    test.each([true, false])('groups bilingual tasks (populated: %s)', async populated => {
      const variant = populated ? 'populated' : 'empty';
      provider.addInteraction({states: [{description: `The ${role} dashboard task list is ${variant}`}],
        uponReceiving: `a ${variant} ${role} dashboard task list request`,
        withRequest: {method: 'GET', path: `/dashboard/taskList/${CASE_ID}/role/${role}`, headers},
        willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: populated ? examples.tasks : []}});
      await exercise(async client => {
        const dashboard = await client.retrieveDashboard(CASE_ID, role, request());
        expect(dashboard).toBeInstanceOf(Dashboard);
        if (!populated) {
          expect(dashboard.items).toEqual([]);
          return;
        }
        expect(dashboard.items.map(group => [group.categoryEn, group.categoryCy, group.tasks.length]))
          .toEqual([['Your claim', 'Eich hawliad', 2], ['Hearing', 'Gwrandawiad', 1]]);
        const tasks = dashboard.items.flatMap(group => group.tasks);
        for (const [index, task] of tasks.entries()) {
          const wire = examples.tasks[index];
          expect(task).toMatchObject({id: wire.id, taskNameEn: wire.taskNameEn, taskNameCy: wire.taskNameCy,
            statusEn: wire.currentStatusEn, statusCy: wire.currentStatusCy, hintTextEn: wire.hintTextEn, hintTextCy: wire.hintTextCy});
        }
        expect(tasks.map(task => task.statusColour)).toEqual(['govuk-tag--red', 'govuk-tag--yellow', 'govuk-tag--green']);
      });
    });

    test.each([true, false])('converts and filters Civil notifications (populated: %s)', async populated => {
      const variant = populated ? 'populated' : 'empty';
      provider.addInteraction({states: [{description: `The ${role} Civil notifications are ${variant}`}],
        uponReceiving: `a ${variant} ${role} Civil notification request`,
        withRequest: {method: 'GET', path: `/dashboard/notifications/${CASE_ID}/role/${role}`, headers},
        willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: populated ? examples.notifications : []}});
      await exercise(async client => {
        const result = await client.retrieveNotification(CASE_ID, role, request());
        if (populated) {
          assertNotifications(result);
          expect(result.items[0]).toBeInstanceOf(DashboardNotification);
        } else {
          expect(result.items).toEqual([]);
        }
      });
    });
  });

  describe.each(['APPLICANT', 'RESPONDENT'])('%s GA notifications', role => {
    test.each([true, false])('converts the keyed collection (populated: %s)', async populated => {
      const variant = populated ? 'populated' : 'empty';
      provider.addInteraction({states: [{description: `The ${role} GA notifications are ${variant}`}],
        uponReceiving: `a ${variant} ${role} notification request for multiple GAs`,
        withRequest: {method: 'GET', path: `/dashboard/notifications/ids/${GA_IDS.join(',')}/role/${role}`, headers},
        willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'},
          body: {[GA_IDS[0]]: populated ? examples.notifications : [], [GA_IDS[1]]: []}}});
      await exercise(async client => {
        const result = await client.retrieveGaNotification(GA_IDS, role, request());
        expect(result).toBeInstanceOf(Map);
        expect(new Set(result.keys())).toEqual(new Set(GA_IDS));
        if (populated) {
          assertNotifications(result.get(GA_IDS[0]));
        } else {
          expect(result.get(GA_IDS[0]).items).toEqual([]);
        }
        expect(result.get(GA_IDS[1]).items).toEqual([]);
      });
    });
  });

  test('creates the draft dashboard with the serialised empty Map', async () => {
    provider.addInteraction({states: [{description: 'A draft dashboard scenario can be created'}],
      uponReceiving: 'a request to create the draft claim dashboard scenario',
      withRequest: {method: 'POST', path: '/dashboard/scenarios/Scenario.AAA6.ClaimIssue.ClaimSubmit.Required/cui-user-id',
        headers, body: {params: {}}}, willRespondWith: {status: 200}});
    await exercise(async client => { await expect(client.createDashboard(request())).resolves.toBeUndefined(); });
  });

  describe.each(['notification', 'task'] as const)('%s updates', kind => {
    test.each([true, false])('sends a null body (valid identifier: %s)', async valid => {
      const id = valid ? ITEM_ID : 'not-a-uuid';
      const status = valid ? 200 : 400;
      // Pact records JSON null through its null matching rule, which rejects non-null bodies.
      provider.given(`A dashboard ${kind} update has a ${valid ? 'valid' : 'malformed'} identifier`)
        .uponReceiving(`a dashboard ${kind} update with a ${valid ? 'valid' : 'malformed'} identifier`)
        .withRequest({method: 'PUT', path: `/dashboard/${kind === 'notification' ? 'notifications' : 'taskList'}/${id}`,
          headers, body: MatchersV3.nullValue()})
        .willRespondWith({status});
      await exercise(async client => {
        const result = kind === 'notification' ? client.recordClick(id, request()) : client.updateTaskStatus(id, request());
        if (valid) {
          await expect(result).resolves.toBeUndefined();
        } else {
          await expect(result).rejects.toMatchObject({isAxiosError: true, response: {status}});
        }
      });
    });
  });

  test('propagates rejection of an unknown task identifier', async () => {
    provider.given('The dashboard task to update does not exist')
      .uponReceiving('a dashboard update for an unknown task')
      .withRequest({method: 'PUT', path: `/dashboard/taskList/${ITEM_ID}`, headers, body: MatchersV3.nullValue()})
      .willRespondWith({status: 412});
    await exercise(async client => {
      await expect(client.updateTaskStatus(ITEM_ID, request())).rejects.toMatchObject({isAxiosError: true, response: {status: 412}});
    });
  });
});
