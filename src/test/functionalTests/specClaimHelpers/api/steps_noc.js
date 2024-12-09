const config = require('../../../config');
const { updateActiveOrganisationUsersMocks } = require('./activeOrganisationUsers');
const { getNocQuestions, validateNocAnswers, submitNocRequest } = require('./caseAssignment');
const { waitForFinishedBusinessProcess } = require('./testingSupport');
const { fetchCaseDetails } = require('./apiRequest');

let chai;
let assert;

import('chai').then(module => {
  chai = module;
  assert = chai.assert;

}).catch(error => {
  console.error('Failed to load chai:', error);
});

const requestNoticeOfChange = async (claimRef, newSolicitor, orgPolicyTag, answers) => {
  if (config.localNoCTests === true) {
    await updateActiveOrganisationUsersMocks(newSolicitor);
  }

  console.log('Validating noc questions');
  const getNotQuestionsResponse = await getNocQuestions(claimRef, newSolicitor);
  assert.equal(getNotQuestionsResponse.status, 200,
    'Expected getNocQuestionsResponse api call to return successful status');

  console.log('Validating noc answers');
  const validateAnswersResponse = await validateNocAnswers(claimRef, answers, newSolicitor);
  assert.equal(validateAnswersResponse.status, 200,
    'Expected validateNocAnswers api call to return successful status');

  console.log(`Submitting notice of change request for case [${claimRef}]`);
  const submitNocRequestResponse = await submitNocRequest(claimRef, answers, newSolicitor);
  assert.equal(submitNocRequestResponse.status, 201,
    'Expected submitNocRequestResponse api call to return created status');

  await waitForFinishedBusinessProcess(claimRef);

  const caseData = await fetchCaseDetails(config.adminUser, claimRef, 200);
  const actualOrgId = caseData.case_data[`${orgPolicyTag}`].Organisation.OrganisationID;

  console.log(`Checking case data [${orgPolicyTag}] for new solicitors organisation Id [${newSolicitor.orgId}].`);
  assert.equal(actualOrgId, newSolicitor.orgId, 'Should have the new solicitors organisation id.');
};

const buildNocAnswers = (clientName) => ([
  {question_id: 'clientName', value: `${clientName}`},
]);

module.exports = {
  requestNoticeOfChangeForRespondent1Solicitor: async (claimRef, newSolicitor) => {
    await requestNoticeOfChange(claimRef, newSolicitor, 'respondent1OrganisationPolicy',
      buildNocAnswers('Test Company Defendant'));
  },
  requestNoticeOfChangeForRespondent2Solicitor: async (claimRef, newSolicitor) => {
    await requestNoticeOfChange(claimRef, newSolicitor, 'respondent2OrganisationPolicy',
      buildNocAnswers('Dr Foo bar'),
    );
  },
  requestNoticeOfChangeForApplicant1Solicitor: async (claimRef, newSolicitor) => {
    await requestNoticeOfChange(claimRef, newSolicitor, 'applicant1OrganisationPolicy',
      buildNocAnswers('Miss Jane Doe'),
    );
  },
  requestNoticeOfChangeForApplicant2Solicitor: async (claimRef, newSolicitor) => {
    await requestNoticeOfChange(claimRef, newSolicitor, 'applicant1OrganisationPolicy',
      buildNocAnswers('Dr Jane Doe'),
    );
  },
  requestNoticeOfChangeForRespondent2SolicitorSpec: async (claimRef, newSolicitor) => {
    await requestNoticeOfChange(claimRef, newSolicitor, 'respondent2OrganisationPolicy',
      buildNocAnswers('Second Defendant'),
    );
  },
  requestNoticeOfChangeForLipRespondent: async (claimRef, newSolicitor) => {
    await requestNoticeOfChange(claimRef, newSolicitor, 'respondent1OrganisationPolicy',
      buildNocAnswers('Sir John Doe'));
  },
};
