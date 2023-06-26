const config = require('../../../config');
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');
const breathingSpace = require('../fixtures/events/breathingSpace.js');
const mediation = require('../fixtures/events/mediation.js');
const admitAllClaimantResponse = require('../fixtures/events/admitAllClaimantResponse.js');
const partAdmitClaimantResponse = require('../fixtures/events/partAdmitClaimantResponse.js');

chai.use(deepEqualInAnyOrder);
chai.config.truncateThreshold = 0;
const {expect, assert} = chai;

const {
  waitForFinishedBusinessProcess, checkToggleEnabled,
} = require('./testingSupport');
const {assignCaseRoleToUser, addUserCaseMapping, unAssignAllUsers} = require('./caseRoleAssignmentHelper');
const apiRequest = require('./apiRequest.js');
const claimSpecData = require('../fixtures/events/createClaimSpec.js');

const data = {
  CREATE_SPEC_CLAIM: (mpScenario) => claimSpecData.createClaim(mpScenario),
};

let caseId, eventName;
let caseData = {};
const PBAv3Toggle = 'pba-version-3-ways-to-pay';

module.exports = {

  createSpecifiedClaim: async (user, multipartyScenario) => {
    console.log(' Creating specified claim');
    eventName = 'CREATE_CLAIM_SPEC';
    caseId = null;
    caseData = {};
    const createClaimSpecData = data.CREATE_SPEC_CLAIM(multipartyScenario);

    await apiRequest.setupTokens(user);
    await apiRequest.startEvent(eventName);
    for (let pageId of Object.keys(createClaimSpecData.userInput)) {
      await assertValidDataSpec(createClaimSpecData, pageId);
    }

    await assertSubmittedSpecEvent('PENDING_CASE_ISSUED');

    await waitForFinishedBusinessProcess(caseId);

    const pbaV3 = await checkToggleEnabled(PBAv3Toggle);
    console.log('Is PBAv3 toggle on?: ' + pbaV3);

    if (pbaV3) {
      await apiRequest.paymentUpdate(caseId, '/service-request-update-claim-issued',
        claimSpecData.serviceUpdateDto(caseId, 'paid'));
      console.log('Service request update sent to callback URL');
    }

    await assignSpecCase(caseId, multipartyScenario);
    await waitForFinishedBusinessProcess(caseId);

    //field is deleted in about to submit callback
    deleteCaseFields('applicantSolicitor1CheckEmail');
    return caseId;
  },

  viewAndRespondToDefence: async (user, defenceType = config.defenceType.admitAllPayBySetDate, expectedState)=> {
    let responsePayload;
    if (defenceType === config.defenceType.admitAllPayBySetDate) {
      responsePayload = admitAllClaimantResponse.doNotAcceptAskToPayBySetDate();
    } else if (defenceType === config.defenceType.admitAllPayByInstallment) {
      responsePayload = admitAllClaimantResponse.doNotAcceptAskToPayByInstallment();
    } else if (defenceType === config.defenceType.partAdmitAmountPaid) {
      responsePayload = partAdmitClaimantResponse.partAdmitAmountPaidButClaimantWantsToProceed();
    } else if (defenceType === config.defenceType.partAdmitHaventPaidPartiallyWantsToPayImmediately) {
      responsePayload = partAdmitClaimantResponse.partAdmitHaventPaidPartiallyWantsToPayImmediatelyButClaimantWantsToProceedWithMediation();
    } else if (defenceType === config.defenceType.partAdmitWithPartPaymentOnSpecificDate) {
      responsePayload = partAdmitClaimantResponse.partAdmitWithPartPaymentOnSpecificDateClaimantWantsToAcceptRepaymentPlanWithFixedCosts();
    } else if (defenceType === config.defenceType.partAdmitWithPartPaymentAsPerInstallmentPlan) {
      responsePayload = partAdmitClaimantResponse.partAdmitWithPartPaymentAsPerPlanClaimantWantsToAcceptRepaymentPlanWithoutFixedCosts();
    }
    eventName = responsePayload['event'];
    caseData = responsePayload['caseData'];
    await apiRequest.setupTokens(user);
    await assertSubmittedSpecEvent(expectedState);
    await waitForFinishedBusinessProcess(caseId);
    console.log('End of viewAndRespondToDefence()');
  },

  enterBreathingSpace: async (user)=> {
    const enterBreathingSpacePayload = breathingSpace.enterBreathingSpacePayload();
    eventName = enterBreathingSpacePayload['event'];
    caseData = enterBreathingSpacePayload['caseData'];
    await apiRequest.setupTokens(user);
    await assertSubmittedSpecEvent();
    await waitForFinishedBusinessProcess(caseId);
    console.log('End of enterBreathingSpace()');
  },

  mediationSuccessful: async (user)=> {
    const mediationSuccessfulPayload = mediation.mediationSuccessfulPayload();
    eventName = mediationSuccessfulPayload['event'];
    caseData = mediationSuccessfulPayload['caseData'];
    await apiRequest.setupTokens(user);
    await assertSubmittedSpecEvent(config.claimState.CASE_STAYED);
    await waitForFinishedBusinessProcess(caseId);
    console.log('End of mediationSuccessful()');
  },

  mediationUnsuccessful: async (user)=> {
    const mediationUnsuccessfulPayload = mediation.mediationUnSuccessfulPayload();
    eventName = mediationUnsuccessfulPayload['event'];
    caseData = mediationUnsuccessfulPayload['caseData'];
    await apiRequest.setupTokens(user);
    await assertSubmittedSpecEvent(config.claimState.JUDICIAL_REFERRAL);
    await waitForFinishedBusinessProcess(caseId);
    console.log('End of mediationUnsuccessful()');
  },

  liftBreathingSpace: async (user) => {
    const liftBreathingSpacePayload = breathingSpace.liftBreathingSpacePayload();
    eventName = liftBreathingSpacePayload['event'];
    caseData = liftBreathingSpacePayload['caseData'];
    await apiRequest.setupTokens(user);
    await assertSubmittedSpecEvent();
    await waitForFinishedBusinessProcess(caseId);
    console.log('End of liftBreathingSpace()');
  },

  getCaseRef: async () => {
    return caseId;
  },

  cleanUp: async () => {
    await unAssignAllUsers();
  },
};

// Functions

const assertValidDataSpec = async (data, pageId) => {
  console.log(`asserting page: ${pageId} has valid data`);

  const userData = data.userInput[pageId];
  caseData = update(caseData, userData);
  const response = await apiRequest.validatePage(
    eventName,
    pageId,
    caseData,
    caseId,
  );
  let responseBody = await response.json();

  assert.equal(response.status, 200);

  if (data.midEventData && data.midEventData[pageId]) {
    checkExpected(responseBody.data, data.midEventData[pageId]);
  }

  if (data.midEventGeneratedData && data.midEventGeneratedData[pageId]) {
    checkGenerated(responseBody.data, data.midEventGeneratedData[pageId]);
  }

  caseData = update(caseData, responseBody.data);
};

function update(currentObject, modifications) {
  const modified = {...currentObject};
  for (const key in modifications) {
    if (currentObject[key] && typeof currentObject[key] === 'object') {
      if (Array.isArray(currentObject[key])) {
        modified[key] = modifications[key];
      } else {
        modified[key] = update(currentObject[key], modifications[key]);
      }
    } else {
      modified[key] = modifications[key];
    }
  }
  return modified;
}

function checkExpected(responseBodyData, expected, prefix = '') {
  if (!(responseBodyData) && expected) {
    if (expected) {
      assert.fail('Response' + prefix ? '[' + prefix + ']' : '' + ' is empty but it was expected to be ' + expected);
    } else {
      // null and undefined may reach this point bc typeof null is object
      return;
    }
  }
  for (const key in expected) {
    if (Object.prototype.hasOwnProperty.call(expected, key)) {
      if (typeof expected[key] === 'object') {
        checkExpected(responseBodyData[key], expected[key], key + '.');
      } else {
        assert.equal(responseBodyData[key], expected[key], prefix + key + ': expected ' + expected[key]
          + ' but actual ' + responseBodyData[key]);
      }
    }
  }
}

function checkGenerated(responseBodyData, generated, prefix = '') {
  if (!(responseBodyData)) {
    assert.fail('Response' + prefix ? '[' + prefix + ']' : '' + ' is empty but it was not expected to be');
  }
  for (const key in generated) {
    if (Object.prototype.hasOwnProperty.call(generated, key)) {
      const checkType = function (type) {
        if (type === 'array') {
          assert.isTrue(Array.isArray(responseBodyData[key]),
            'responseBody[' + prefix + key + '] was expected to be an array');
        } else {
          assert.equal(typeof responseBodyData[key], type,
            'responseBody[' + prefix + key + '] was expected to be of type ' + type);
        }
      };
      const checkFunction = function (theFunction) {
        assert.isTrue(theFunction.call(responseBodyData[key], responseBodyData[key]),
          'responseBody[' + prefix + key + '] does not satisfy the condition it should');
      };
      if (typeof generated[key] === 'string') {
        checkType(generated[key]);
      } else if (typeof generated[key] === 'function') {
        checkFunction(generated[key]);
      } else if (typeof generated[key] === 'object') {
        if (generated[key]['type']) {
          checkType(generated[key]['type']);
        }
        if (generated[key]['condition']) {
          checkType(generated[key]['condition']);
        }
        for (const key2 in generated[key]) {
          if (Object.prototype.hasOwnProperty.call(generated, key2) && 'condition' !== key2 && 'type' !== key2) {
            checkGenerated(responseBodyData[key2], generated[key2], key2 + '.');
          }
        }
      }
    }
  }
}

const assertSubmittedSpecEvent = async (expectedState, submittedCallbackResponseContains, hasSubmittedCallback = true) => {
  await apiRequest.startEvent(eventName, caseId);

  const response = await apiRequest.submitEvent(eventName, caseData, caseId);
  const responseBody = await response.json();
  assert.equal(response.status, 201);
  if (expectedState) {
    assert.equal(responseBody.state, expectedState);
  }
  if (hasSubmittedCallback && submittedCallbackResponseContains) {
    assert.equal(responseBody.callback_response_status_code, 200);
    assert.include(responseBody.after_submit_callback_response.confirmation_header, submittedCallbackResponseContains.header);
    assert.include(responseBody.after_submit_callback_response.confirmation_body, submittedCallbackResponseContains.body);
  }

  if (eventName === 'CREATE_CLAIM_SPEC') {
    caseId = responseBody.id;
    await addUserCaseMapping(caseId, config.applicantSolicitorUser);
    console.log('Case created: ' + caseId);
  }
};
// Mid event will not return case fields that were already filled in another event if they're present on currently processed event.
// This happens until these case fields are set again as a part of current event (note that this data is not removed from the case).
// Therefore these case fields need to be removed from caseData, as caseData object is used to make assertions
const deleteCaseFields = (...caseFields) => {
  caseFields.forEach(caseField => delete caseData[caseField]);
};

// eslint-disable-next-line no-unused-vars
function assertDynamicListListItemsHaveExpectedLabels(responseBody, dynamicListFieldName, midEventData) {
  const actualDynamicElementLabels = removeUuidsFromDynamicList(responseBody.data, dynamicListFieldName);
  const expectedDynamicElementLabels = removeUuidsFromDynamicList(midEventData, dynamicListFieldName);

  expect(actualDynamicElementLabels).to.deep.equalInAnyOrder(expectedDynamicElementLabels);
}

function removeUuidsFromDynamicList(data, dynamicListField) {
  const dynamicElements = data[dynamicListField].list_items;
  // eslint-disable-next-line no-unused-vars
  return dynamicElements.map(({code, ...item}) => item);
}

const assignSpecCase = async (caseId) => {
  await assignCaseRoleToUser(caseId, 'RESPONDENTSOLICITORONE', config.defendantCitizenUser);
};
