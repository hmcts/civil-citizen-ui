import {TestMessages} from './errorMessageTestConstants';
import civilClaimResponseMock from './mocks/civilClaimResponseMock.json';
import civilClaimResponseClaimantIntentMock from './mocks/civilClaimResponseClaimantIntentionMock.json';
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
import civilClaimResponseDocumentUploadedMock from './mocks/civilClaimResponseDocumentUploadedMock.json';
import civilClaimResponseDocumentUploadedClaimantMock from './mocks/civilClaimResponseDocumentUploadedClaimantMock.json';
import civilClaimResponseFastTrackMock from './mocks/civilClaimResponseFastTrackMock.json';
import civilClaimResponseHearingFeeMock from './mocks/civilClaimResponseHearingFeeMock.json';
import civilClaimResponseWithFeeType from './mocks/civilClaimResponseWithFeeTypeMock.json';

import {LoggerInstance} from 'winston';

const mockCivilClaim = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseMock))),
  del: jest.fn(() => Promise.resolve({})),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

const mockCivilClaimClaimantIntention = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseClaimantIntentMock))),
  del: jest.fn(() => Promise.resolve({})),
};
const mockCivilClaimFastTrack = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseFastTrackMock))),
  del: jest.fn(() => Promise.resolve({})),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};
const mockCivilClaimUndefined = {
  set: jest.fn(() => Promise.resolve(undefined)),
  get: jest.fn(() => Promise.resolve(undefined)),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};
const mockNoStatementOfMeans = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(noStatementOfMeansMock))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};
const mockCivilClaimOptionNo = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseOptionNoMock))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};
const mockCivilClaimUnemploymentRetired = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseUnemploymentRetired))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};
const mockCivilClaimUnemploymentOther = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseUnemploymentOther))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};
const mockRedisWithMediationProperties = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseApplicantWithMediation))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};
const mockRedisWithoutAdmittedPaymentAmount = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseNoAdmittedPaymentAmountMock))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};
const mockRedisWithPaymentAmount = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseWithAdmittedPaymentAmountMock))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};
const mockRedisFullAdmission = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseFullAdmissionMock))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

const mockCivilClaimWithTimelineAndEvidence = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseWithTimelineAndEvidenceMock))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

const mockCivilClaimantIntention = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(noRespondentTelephoneClaimantIntentionMock))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

const mockResponseFullAdmitPayBySetDate = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(fullAdmitPayBySetDateMock))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

const mockRedisFailure = {
  del: jest.fn(() => Promise.resolve({})),
  set: jest.fn(() => {
    throw new Error(TestMessages.REDIS_FAILURE);
  }),
  get: jest.fn(() => {
    throw new Error(TestMessages.REDIS_FAILURE);
  }),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
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
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

const mockCivilClaimRespondentIndividualTypeWithPhoneNumber = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseRespondentIndividualWithPhoneNumber))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

const mockCivilClaimRespondentIndividualTypeWithoutPhoneNumber = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseRespondentIndividualWithoutPhoneNumber))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

const mockCivilClaimRespondentIndividualTypeWithCcdPhoneNumberFalse = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseRespondentIndividualWithCcdPhoneNumberFalse))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

const mockCivilClaimPDFTimeline = {
  del: jest.fn(() => Promise.resolve({})),
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponsePDFTimeline))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

const mockClaimantClaims = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(claimantClaimsMock))),
};

const mockCivilClaimWithExpertAndWitness = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseWithWithExpertAndWitness))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

const mockCivilClaimDocumentUploaded = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseDocumentUploadedMock))),
  del: jest.fn(() => Promise.resolve({})),
};

const mockCivilClaimHearingFee = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseHearingFeeMock))),
  del: jest.fn(() => Promise.resolve({})),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

const mockCivilClaimWithFeeType = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseWithFeeType))),
  del: jest.fn(() => Promise.resolve({})),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

const mockCivilClaimDocumentClaimantUploaded = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseDocumentUploadedClaimantMock))),
  del: jest.fn(() => Promise.resolve({})),
};

export {
  mockCivilClaim,
  mockCivilClaimClaimantIntention,
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
  mockCivilClaimDocumentUploaded,
  mockCivilClaimFastTrack,
  mockCivilClaimDocumentClaimantUploaded,
  civilClaimResponseMock,
  mockCivilClaimHearingFee,
  mockCivilClaimWithFeeType,
};
