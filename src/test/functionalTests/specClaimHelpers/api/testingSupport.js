const config = require('../../../config');
const idamHelper = require('./idamHelper');
const restHelper = require('./restHelper');
const {retry} = require('./retryHelper');
const totp = require('totp-generator');

let incidentMessage;

const MAX_RETRIES = 50;
const RETRY_TIMEOUT_MS = 10000;

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
    const authToken = await idamHelper.accessToken(user ? user : config.applicantSolicitorUser);

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
            throw new Error(`Ongoing business process: ${businessProcess.camundaEvent}, case id: ${caseId}, status: ${businessProcess.status},`
              + ` process instance: ${businessProcess.processInstanceId}, last finished activity: ${businessProcess.activityId}`);
          }
        });
    }, MAX_RETRIES, RETRY_TIMEOUT_MS);
    if (incidentMessage)
      throw new Error(`Business process failed for case: ${caseId}, incident message: ${incidentMessage}`);
  },

  waitForGAFinishedBusinessProcess: async (caseId, user) => {
    const authToken = await idamHelper.accessToken(user);
    console.log('** Start waitForGAFinishedBusinessProcess to wait for GA Camunda Tasks to Start and Finish **');

    await retry(() => {
      return restHelper.request(
        `${config.url.generalApplication}/testing-support/case/${caseId}/business-process`,
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        }, null, 'GET')
        .then(async response => await response.json()).then(response => {
          let businessProcess = response.businessProcess;
          if (response.incidentMessage) {
            incidentMessage = response.incidentMessage;
          } else if (businessProcess && businessProcess.status !== 'FINISHED') {
            throw new Error(`Ongoing business process: ${businessProcess.camundaEvent}, case id: ${caseId}, status: ${businessProcess.status},`
              + ` process instance: ${businessProcess.processInstanceId}, last finished activity: ${businessProcess.activityId}`);
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

  checkToggleEnabled,
};
