import {PactV3, SpecificationVersion} from '@pact-foundation/pact';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {draftClaim, draftVariants} from '../fixtures/draftClaim';
import {CaseRole} from 'form/models/caseRoles';
import {YesNo} from 'form/models/yesNo';
import {PACT_DIRECTORY_PATH} from '../utils';
import examples from '../fixtures/queryRequests.json';

jest.mock('config', () => {
  const actual = jest.requireActual('config');
  return {get: (key: string) => actual.get(key)};
});
jest.mock('uuid', () => ({...jest.requireActual('uuid'), v4: jest.fn()}));

const CASE_ID = '1111222233334444';
const request = () => ({params: {id: CASE_ID}, locals: {},
  session: {user: {id: 'cui-user-id', accessToken: 'some-access-token'}}} as unknown as AppRequest);

describe('Civil Service Query Management submissions', () => {
  test.each(['new', 'follow-up'] as const)('submits a %s query using the real service', async variant => {
    const provider = new PactV3({consumer: 'civil_citizen_ui', provider: 'civil_service',
      spec: SpecificationVersion.SPECIFICATION_VERSION_V4, dir: PACT_DIRECTORY_PATH, logLevel: 'warn'});
    const response = JSON.parse(JSON.stringify(examples[variant]));
    for (const message of response.queries.caseMessages) message.value.createdOn = '2025-05-01T10:00:00Z';
    provider.addInteraction({states: [{description: `A ${variant} citizen query can be submitted`}],
      uponReceiving: `a ${variant} Query Management submission`,
      withRequest: {method: 'POST', path: `/cases/${CASE_ID}/citizen/cui-user-id/event`,
        headers: {Authorization: 'Bearer some-access-token', 'Content-Type': 'application/json'},
        body: {event: 'queryManagementRaiseQuery', caseDataUpdate: examples[variant]}},
      willRespondWith: {status: 200, headers: {'Content-Type': 'application/json'}, body: {
        id: Number(CASE_ID), state: 'CASE_PROGRESSION', last_modified: '2025-05-01T10:00:00', case_data: response,
      }}});
    await provider.executeTest(async server => {
      let create: typeof import('services/features/queryManagement/createQueryCheckYourAnswerService').createQuery;
      let submission: jest.SpyInstance;
      jest.isolateModules(() => {
        const config = require('config');
        const get = config.get.bind(config);
        const url = jest.spyOn(config, 'get').mockImplementation((key: string) => key === 'services.civilService.url' ? server.url : get(key));
        const uuid = require('uuid').v4 as jest.Mock;
        const message = examples[variant].queries.caseMessages.at(-1);
        uuid.mockReturnValueOnce(message.id).mockReturnValueOnce(message.value.id);
        const Client = require('client/civilServiceClient').CivilServiceClient;
        submission = jest.spyOn(Client.prototype, 'submitQueryManagementRaiseQuery');
        try {
          create = require('services/features/queryManagement/createQueryCheckYourAnswerService').createQuery;
        } finally {
          url.mockRestore();
        }
      });
      const claim = draftClaim(draftVariants[3]);
      claim.caseRole = CaseRole.DEFENDANT;
      const document = examples.new.queries.caseMessages[0].value.attachments[0].value;
      claim.queryManagement = {createQuery: {messageSubject: 'Hearing documents',
        messageDetails: 'Please confirm receipt of the document.', isHearingRelated: YesNo.YES,
        day: 1, month: 6, year: 2025, uploadedFiles: [{caseDocument: {documentLink: document}}]},
      sendFollowUpQuery: {parentId: examples.new.queries.caseMessages[0].value.id,
        messageDetails: 'Please provide an update on my query.', uploadedFiles: []}} as Claim['queryManagement'];
      const updated = new Claim();
      if (variant === 'follow-up') updated.queries = JSON.parse(JSON.stringify(examples.new.queries));
      // Only the service's timestamp is fixed; network timers keep running normally.
      const timestamp = jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-05-01T10:00:00.000Z');
      try {
        await create(claim, updated, request(), variant === 'follow-up');
        const converted = await submission.mock.results[0].value;
        expect(converted).toMatchObject({id: CASE_ID, ccdState: 'CASE_PROGRESSION',
          lastModifiedDate: '2025-05-01T10:00:00', queries: response.queries});
        expect(converted.queries.caseMessages).toHaveLength(variant === 'new' ? 1 : 2);
      } finally {
        timestamp.mockRestore();
        submission.mockRestore();
      }
    });
  });
});
