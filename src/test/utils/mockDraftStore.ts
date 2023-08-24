import {TestMessages} from './errorMessageTestConstants';
import civilClaimResponseMock from './mocks/civilClaimResponseMock.json';
import noStatementOfMeansMock from './mocks/noStatementOfMeansMock.json';
import civilClaimResponseOptionNoMock from './mocks/civilClaimResponseOptionNoMock.json';
import civilClaimResponseUnemploymentRetired from './mocks/civilClaimResponseUnemploymentRetiredMock.json';
import civilClaimResponseUnemploymentOther from './mocks/civilClaimResponseUnemploymentOtherMock.json';
import civilClaimResponseApplicantCompany from './mocks/civilClaimResponseApplicantCompanyMock.json';
import civilClaimResponseApplicantIndividual from './mocks/civilClaimResponseApplicanIndividualMock.json';
import civilClaimResponseRespondentIndividualWithPhoneNumber from './mocks/civilClaimResponseRespondentIndividualWithPhoneNumberMock.json';
import civilClaimResponseRespondentIndividualWithoutPhoneNumber from './mocks/civilClaimResponseRespondentIndividualWithoutPhoneNumberMock.json';
import civilClaimResponseRespondentIndividualWithCcdPhoneNumberFalse from './mocks/civilClaimResponseRespondentIndividualWithCcdPhoneNumberFalseMock.json';
import civilClaimResponseApplicantWithMediation from './mocks/civilClaimResponseApplicanWithMediationMock.json';
import civilClaimResponseNoAdmittedPaymentAmountMock from './mocks/civilClaimResponseNoAdmittedPaymentAmountMock.json';
import civilClaimResponseFullAdmissionMock from './mocks/civilClaimResponseFullAdmissionMock.json';
import civilClaimResponseWithAdmittedPaymentAmountMock
  from './mocks/civilClaimResponseWithAdmittedPaymentAmountMock.json';
import civilClaimResponsePDFTimeline from './mocks/civilClaimResponsePDFTimelineMock.json';
import claimantClaimsMock from './mocks/claimantClaimsMock.json';
import civilClaimResponseWithTimelineAndEvidenceMock from './mocks/civilClaimResponseTimelineAndEvidenceMock.json';
import civilClaimResponseWithWithExpertAndWitness from './mocks/civilClaimResponseExpertAndWitnessMock.json';
import noRespondentTelephoneClaimantIntentionMock from './mocks/noRespondentTelephoneClaimantIntentionMock.json';
import fullAdmitPayBySetDateMock from './mocks/fullAdmitPayBySetDateMock.json';
import civilClaimResponseFastTrackMock from './mocks/civilClaimResponseFastTrackMock.json';

import {LoggerInstance} from 'winston';

const mockCivilClaim = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseMock))),
  del: jest.fn(() => Promise.resolve({})),
};

const mockCivilClaimFastTrack = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseFastTrackMock))),
  del: jest.fn(() => Promise.resolve({})),
};
const mockCivilClaimUndefined = {
  set: jest.fn(() => Promise.resolve(undefined)),
  get: jest.fn(() => Promise.resolve(undefined)),
  expire: jest.fn(() => Promise.resolve({})),
};
const mockNoStatementOfMeans = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(noStatementOfMeansMock))),
};
const mockCivilClaimOptionNo = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseOptionNoMock))),
};
const mockCivilClaimUnemploymentRetired = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseUnemploymentRetired))),
};
const mockCivilClaimUnemploymentOther = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseUnemploymentOther))),
};
const mockRedisWithMediationProperties = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseApplicantWithMediation))),
};
const mockRedisWithoutAdmittedPaymentAmount = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseNoAdmittedPaymentAmountMock))),
};
const mockRedisWithPaymentAmount = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseWithAdmittedPaymentAmountMock))),
};
const mockRedisFullAdmission = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseFullAdmissionMock))),
};

const mockCivilClaimWithTimelineAndEvidence = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseWithTimelineAndEvidenceMock))),
};

const mockCivilClaimantIntention = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(noRespondentTelephoneClaimantIntentionMock))),
};

const mockResponseFullAdmitPayBySetDate = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(fullAdmitPayBySetDateMock))),
};

const mockRedisFailure = {
  del: jest.fn(() => Promise.resolve({})),
  set: jest.fn(() => {
    throw new Error(TestMessages.REDIS_FAILURE);
  }),
  get: jest.fn(() => {
    throw new Error(TestMessages.REDIS_FAILURE);
  }),
};

const mockLogger = {
  error: jest.fn().mockImplementation((message: string) => message),
  info: jest.fn().mockImplementation((message: string) => message),
} as unknown as LoggerInstance;

const mockCivilClaimApplicantCompanyType = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseApplicantCompany))),
};

const mockCivilClaimApplicantIndividualType = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseApplicantIndividual))),
};

const mockCivilClaimRespondentIndividualTypeWithPhoneNumber = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseRespondentIndividualWithPhoneNumber))),
};

const mockCivilClaimRespondentIndividualTypeWithoutPhoneNumber = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseRespondentIndividualWithoutPhoneNumber))),
};

const mockCivilClaimRespondentIndividualTypeWithCcdPhoneNumberFalse = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseRespondentIndividualWithCcdPhoneNumberFalse))),
};

const mockCivilClaimPDFTimeline = {
  del: jest.fn(() => Promise.resolve({})),
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponsePDFTimeline))),
};

const mockClaimantClaims = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(claimantClaimsMock))),
};

const mockCivilClaimWithExpertAndWitness = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseWithWithExpertAndWitness))),
};

export {
  mockCivilClaim,
  mockCivilClaimUndefined,
  mockNoStatementOfMeans,
  mockCivilClaimOptionNo,
  mockCivilClaimUnemploymentRetired,
  mockCivilClaimUnemploymentOther,
  mockRedisFailure,
  mockCivilClaimApplicantCompanyType,
  mockCivilClaimApplicantIndividualType,
  mockCivilClaimRespondentIndividualTypeWithPhoneNumber,
  mockCivilClaimRespondentIndividualTypeWithoutPhoneNumber,
  mockCivilClaimRespondentIndividualTypeWithCcdPhoneNumberFalse,
  mockLogger,
  mockRedisWithMediationProperties,
  mockRedisWithoutAdmittedPaymentAmount,
  mockRedisWithPaymentAmount,
  mockRedisFullAdmission,
  mockCivilClaimPDFTimeline,
  mockClaimantClaims,
  mockCivilClaimWithTimelineAndEvidence,
  mockCivilClaimWithExpertAndWitness,
  mockCivilClaimantIntention,
  mockResponseFullAdmitPayBySetDate,
  mockCivilClaimFastTrack,
};
