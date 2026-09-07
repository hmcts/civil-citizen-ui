const config = require('../../../config');
const idamHelper = require('./idamHelper');
const restHelper = require('./restHelper');
const {retry} = require('./retryHelper');
const totp = require('totp-generator');

let incidentMessage;

const MAX_RETRIES = 60;
const RETRY_TIMEOUT_MS = 4000;
const READY_STATUS = 'READY';

const buildBusinessProcessErrorMessage = (businessProcess, caseId, elapsedMs, response = {}) => {
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const businessProcessSummary = `Ongoing business process: ${businessProcess?.camundaEvent || 'unknown'},`
    + ` case id: ${caseId}, status: ${businessProcess?.status || 'unknown'},`
    + ` process instance: ${businessProcess?.processInstanceId || 'undefined'},`
    + ` last finished activity: ${businessProcess?.activityId || 'undefined'}`;
  const contextSummary = `elapsed: ${elapsedSeconds}s, hasIncidentMessage: ${Boolean(response?.incidentMessage)}`;
  if (businessProcess?.status === READY_STATUS) {
    return `${businessProcessSummary}, ${contextSummary}. Process remains in READY and has not started in Camunda.`;
  }
  return `${businessProcessSummary}, ${contextSummary}.`;
};

const checkToggleEnabled = async (toggle) => {
  const authToken = await idamHelper.accessToken(config.applicantSolicitorUser);

  return await restHelper.request(
    `${config.url.civilService}/testing-support/feature-toggle/${toggle}`,
    {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    }, null, 'GET')
    .then(async response =>  {
      if (response.status === 200) {
        const json = await response.json();
        console.log('Toggle..', toggle, '...and value is..', json.toggleEnabled);
        return json.toggleEnabled;
      } else {
        throw new Error(`Error when checking toggle occurred with status : ${response.status}`);
      }
    },
    );
};

module.exports = {
  waitForFinishedBusinessProcess: async (caseId, user = '') => {
    incidentMessage = undefined;
    const authToken = await idamHelper.accessToken(user ? user : config.applicantSolicitorUser);
    const startedAt = Date.now();

    await retry(() => {
      return restHelper.request(
        `${config.url.civilService}/testing-support/case/${caseId}/business-process`,
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        }, null, 'GET')
        .then(async response => await response.json()).then(response => {
          let businessProcess = response.businessProcess;
          if (response.incidentMessage) {
            incidentMessage = response.incidentMessage;
          } else if (businessProcess && businessProcess.status !== 'FINISHED') {
            throw new Error(buildBusinessProcessErrorMessage(businessProcess, caseId, Date.now() - startedAt, response));
          }
        });
    }, MAX_RETRIES, RETRY_TIMEOUT_MS);
    if (incidentMessage)
      throw new Error(`Business process failed for case: ${caseId}, incident message: ${incidentMessage}`);
  },

  waitForGAFinishedBusinessProcess: async (caseId, user) => {
    incidentMessage = undefined;
    const authToken = await idamHelper.accessToken(user);
    const startedAt = Date.now();
    console.log('** Start waitForGAFinishedBusinessProcess to wait for GA Camunda Tasks to Start and Finish **');

    await retry(() => {
      return restHelper.request(
        `${config.url.civilService}/testing-support/case/${caseId}/business-process`,
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        }, null, 'GET')
        .then(async response => await response.json()).then(response => {
          let businessProcess = response.businessProcess;
          if (response.incidentMessage) {
            incidentMessage = response.incidentMessage;
          } else if (businessProcess && businessProcess.status !== 'FINISHED') {
            throw new Error(buildBusinessProcessErrorMessage(businessProcess, caseId, Date.now() - startedAt, response));
          }
        });
    }, MAX_RETRIES, RETRY_TIMEOUT_MS);
    console.log('** End of waitForGAFinishedBusinessProcess **');

    if (incidentMessage)
      throw new Error(`Business process failed for case: ${caseId}, incident message: ${incidentMessage}`);
  },

  assignCaseToDefendant: async (caseId, caseRole, user) => {
    const authToken = await idamHelper.accessToken(user);

    await retry(() => {
      return restHelper.request(
        `${config.url.civilService}/testing-support/assign-case/${caseId}/${caseRole}`,
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        {},
        'POST')
        .then(response => {
          if (response.status === 200) {
            console.log('Role assigned successfully');
          } else if (response.status === 409) {
            console.log('Role assigned failed');
          } else {
            console.log(`Error occurred while assigning case with status : ${response.status}`);
          }
        });
    });
  },

  unAssignUserFromCases: async (caseIds, user) => {
    const authToken = await idamHelper.accessToken(user);
    const s2sAuth = await restHelper.retriedRequest(
      `${config.url.authProviderApi}/lease`,
      {'Content-Type': 'application/json'},
      {
        microservice: config.s2s.microservice,
        oneTimePassword: totp(config.s2s.secret) ,
      })
      .then(response => response.text());

    await retry(() => {
      return restHelper.request(
        `${config.url.civilService}/testing-support/unassign-user`,
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'ServiceAuthorization': s2sAuth ,
        },
        {
          caseIds,
        },
        'POST')
        .then(response => {
          if (response.status === 200) {
            caseIds.forEach(caseId => console.log(`User unassigned from case [${caseId}] successfully`));
          } else {
            console.log(`Error occurred while unassigning users with status : ${response.status}`);
          }
        });
    });
  },

  uploadDocument: async () => {
    const authToken = await idamHelper.accessToken(config.applicantSolicitorUser);
    let response = await restHelper.request(
      `${config.url.civilService}/testing-support/upload/test-document`,
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      {},
      'POST');

    return await response.json();
  },

  uploadDocumentUser: async (user) => {
    const authToken = await idamHelper.accessToken(user);
    let response = await restHelper.request(
      `${config.url.civilService}/testing-support/upload/test-document`,
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      {},
      'POST');

    return await response.json();
  },

  triggerCaseDismissalScheduler: async () => {
    const authToken = await idamHelper.accessToken(config.applicantSolicitorUser);
    const response = await restHelper.request(
      `${config.url.civilService}/testing-support/trigger-case-dismissal-scheduler`,
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      }, null, 'GET');
    const text = await response.text();
    console.log(`trigger-case-dismissal-scheduler status: ${response.status}, body: ${text}`);
    return text;
  },

  triggerJudgmentBufferScheduler: async () => {
    const authToken = await idamHelper.accessToken(config.applicantSolicitorUser);
    const response = await restHelper.request(
      `${config.url.civilService}/testing-support/run-scheduler/JudgementBuffer`,
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      }, null, 'GET');
    const text = await response.text();
    console.log(`run-scheduler/JudgementBuffer status: ${response.status}, body: ${text}`);
    return text;
  },

  hearingFeeUnpaid: async (caseId) => {
    const authToken = await idamHelper.accessToken(config.applicantSolicitorUser);
    await restHelper.request(
      `${config.url.civilService}/testing-support/${caseId}/trigger-hearing-fee-unpaid`,
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      }, null, 'GET')
      .then(async response => {
        if (response.status === 200) {
          console.log(`Hearing Fee unpaid for ${caseId} successful`);
        } else {
          throw new Error(`Error occurred with status : ${response.status}`);
        }
      },
      );
  },

  triggerTrialArrangements: async (caseId) => {
    const authToken = await idamHelper.accessToken(config.applicantSolicitorUser);
    await restHelper.request(
      `${config.url.civilService}/testing-support/${caseId}/trigger-trial-arrangements`,
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      }, null, 'GET')
      .then(async response => {
        if (response.status === 200) {
          console.log(`Trigger trial arrangements for ${caseId} successful`);
        } else {
          throw new Error(`Error occurred with status : ${response.status}`);
        }
      },
      );
  },

  bundleGeneration: async (caseId) => {
    const authToken = await idamHelper.accessToken(config.applicantSolicitorUser);
    await restHelper.request(
      `${config.url.civilService}/testing-support/${caseId}/trigger-trial-bundle`,
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      }, null, 'GET')
      .then(async response => {
        if (response.status === 200) {
          console.log(`Bundle for ${caseId} successful`);
        } else {
          console.log(`Error occurred for bundle creation with status : ${response.status}`);
        }
      },
      );
  },

  updateCaseData: async (caseId, caseData, user = config.applicantSolicitorUser) => {
    const authToken = await idamHelper.accessToken(user);
    const s2sAuth = await restHelper.retriedRequest(
      `${config.url.authProviderApi}/lease`,
      {'Content-Type': 'application/json'},
      {
        microservice: config.s2s.microservice,
        oneTimePassword: totp(config.s2s.secret),
      })
      .then(response => response.text());

    await restHelper.retriedRequest(
      `${config.url.civilService}/testing-support/case/${caseId}`,
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'ServiceAuthorization': s2sAuth,
      }, caseData, 'PUT');
  },

  assertEmailSent: async (caseId, options = {}) => {
    const {templateId, recipientEmail, timeoutMs = 30000} = options;
    const intervalMs = 3000;
    const maxRetries = Math.max(1, Math.floor(timeoutMs / intervalMs));
    const authToken = await idamHelper.accessToken(config.applicantSolicitorUser);

    const params = new URLSearchParams({caseId});
    if (templateId) params.set('templateId', templateId);
    if (recipientEmail) params.set('recipientEmail', recipientEmail);
    const url = `${config.url.civilService}/testing-support/notifications/sent?${params.toString()}`;

    let lastResult = [];

    try {
      return await retry(async () => {
        const response = await restHelper.request(url, {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        }, null, 'GET');

        if (response.status !== 200) {
          throw new Error(`assertEmailSent: testing-support returned status ${response.status}`);
        }

        lastResult = await response.json();
        if (lastResult.length === 0) {
          throw new Error(`assertEmailSent: no matching email yet for case ${caseId} (templateId=${templateId || '*'}, recipient=${recipientEmail || '*'})`);
        }
        return lastResult[lastResult.length - 1];
      }, maxRetries, intervalMs);
    } catch {
      throw new Error(`assertEmailSent: timed out after ${timeoutMs}ms waiting for email for case ${caseId} (templateId=${templateId || '*'}, recipient=${recipientEmail || '*'}). Last response: ${JSON.stringify(lastResult)}`);
    }
  },

  assertEmailSentByReference: async (caseId, options = {}) => {
    const {reference, recipientEmail, timeoutMs = 30000} = options;
    const intervalMs = 3000;
    const maxRetries = Math.max(1, Math.floor(timeoutMs / intervalMs));
    const authToken = await idamHelper.accessToken(config.applicantSolicitorUser);

    const params = new URLSearchParams({caseId});
    if (recipientEmail) params.set('recipientEmail', recipientEmail);
    const url = `${config.url.civilService}/testing-support/notifications/sent?${params.toString()}`;

    let lastResult = [];

    try {
      return await retry(async () => {
        const response = await restHelper.request(url, {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        }, null, 'GET');

        if (response.status !== 200) {
          throw new Error(`assertEmailSentByReference: testing-support returned status ${response.status}`);
        }

        lastResult = await response.json();
        const match = lastResult.find(n => n.reference && n.reference.includes(reference));
        if (!match) {
          throw new Error(`assertEmailSentByReference: no matching email yet for case ${caseId} (reference=${reference}, recipient=${recipientEmail || '*'})`);
        }
        return match;
      }, maxRetries, intervalMs);
    } catch {
      throw new Error(`assertEmailSentByReference: timed out after ${timeoutMs}ms waiting for email for case ${caseId} (reference=${reference}, recipient=${recipientEmail || '*'}). Last response: ${JSON.stringify(lastResult)}`);
    }
  },

  assertNoEmailSent: async (caseId, options = {}) => {
    const {templateId, recipientEmail, withinMs = 5000} = options;
    const authToken = await idamHelper.accessToken(config.applicantSolicitorUser);

    const params = new URLSearchParams({caseId});
    if (templateId) params.set('templateId', templateId);
    if (recipientEmail) params.set('recipientEmail', recipientEmail);
    const url = `${config.url.civilService}/testing-support/notifications/sent?${params.toString()}`;

    await new Promise(resolve => setTimeout(resolve, withinMs));

    const response = await restHelper.request(url, {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    }, null, 'GET');

    if (response.status !== 200) {
      throw new Error(`assertNoEmailSent: testing-support returned status ${response.status}`);
    }

    const result = await response.json();
    if (result.length > 0) {
      throw new Error(`assertNoEmailSent: expected no email for case ${caseId} (templateId=${templateId || '*'}, recipient=${recipientEmail || '*'}) but found ${result.length}: ${JSON.stringify(result)}`);
    }
  },

  checkToggleEnabled,
};
