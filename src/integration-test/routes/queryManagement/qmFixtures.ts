import {Claim} from '../../../main/common/models/claim';
import {CaseRole} from '../../../main/common/form/models/caseRoles';
import {CaseQueries, CaseMessage, QueryMessage} from '../../../main/common/models/queryManagement/caseQueries';
import {YesNoUpperCamelCase} from '../../../main/common/form/models/yesNo';

export const QM_CLAIMANT_USER_ID = 'qm-claimant-user-id';
export const QM_DEFENDANT_USER_ID = 'qm-defendant-user-id';
export const QM_CASEWORKER_USER_ID = 'qm-caseworker-user-id';

const claimantCreatedBy = `${QM_CLAIMANT_USER_ID}::[CLAIMANT]`;
const defendantCreatedBy = `${QM_DEFENDANT_USER_ID}::[DEFENDANT]`;
const caseworkerCreatedBy = `${QM_CASEWORKER_USER_ID}::[CASEWORKER]`;

const message = (value: CaseMessage): QueryMessage => ({value});

export const QM_QUERY_IDS = {
  claimantHearing: 'claimant-hearing-query',
  defendantHearing: 'defendant-hearing-query',
  claimantNonHearing: 'claimant-non-hearing-query',
  defendantNonHearing: 'defendant-non-hearing-query',
  claimantWithResponse: 'claimant-query-with-response',
  defendantWithResponse: 'defendant-query-with-response',
  claimantClosed: 'claimant-closed-query',
  defendantClosed: 'defendant-closed-query',
} as const;

export type QmPartyRole = 'claimant' | 'defendant';

const partyConfig = (role: QmPartyRole) =>
  role === 'claimant'
    ? {
      caseRole: CaseRole.CLAIMANT,
      userId: QM_CLAIMANT_USER_ID,
      createdBy: claimantCreatedBy,
      displayName: 'Claimant',
    }
    : {
      caseRole: CaseRole.DEFENDANT,
      userId: QM_DEFENDANT_USER_ID,
      createdBy: defendantCreatedBy,
      displayName: 'Defendant',
    };

export const buildQmClaim = (
  claimId: string,
  role: QmPartyRole,
  queries: CaseQueries,
): Claim => {
  const claim = new Claim();
  claim.id = claimId;
  claim.legacyCaseReference = claimId;
  claim.caseRole = partyConfig(role).caseRole;
  claim.submittedDate = new Date('2024-01-01');
  claim.totalClaimAmount = 1000;
  claim.queries = queries;
  return claim;
};

const initialQuery = (
  id: string,
  subject: string,
  body: string,
  createdBy: string,
  name: string,
  isHearingRelated: YesNoUpperCamelCase,
  hearingDate?: string,
): CaseMessage => ({
  id,
  subject,
  body,
  name,
  createdBy,
  createdOn: '2025-02-20T12:00:00Z',
  parentId: null,
  isHearingRelated,
  ...(hearingDate ? {hearingDate} : {}),
});

const caseworkerResponse = (
  parentId: string,
  subject: string,
  body: string,
  isClosed = false,
): CaseMessage => ({
  id: `${parentId}-response`,
  subject,
  body,
  name: 'Caseworker',
  createdBy: caseworkerCreatedBy,
  createdOn: '2025-02-21T12:00:00Z',
  parentId,
  isHearingRelated: YesNoUpperCamelCase.NO,
  isClosed: isClosed ? YesNoUpperCamelCase.YES : undefined,
});

const followUpMessage = (
  parentId: string,
  subject: string,
  body: string,
  createdBy: string,
  name: string,
): CaseMessage => ({
  id: `${parentId}-follow-up`,
  subject,
  body,
  name,
  createdBy,
  createdOn: '2025-02-22T12:00:00Z',
  parentId,
  isHearingRelated: YesNoUpperCamelCase.NO,
});

export const buildHearingQueryMessages = (role: QmPartyRole): CaseQueries => {
  const {createdBy, displayName} = partyConfig(role);
  const queryId = role === 'claimant' ? QM_QUERY_IDS.claimantHearing : QM_QUERY_IDS.defendantHearing;
  const subject = `${displayName} Hearing query`;
  return {
    partyName: 'All queries',
    caseMessages: [
      message(initialQuery(
        queryId,
        subject,
        `${displayName} Hearing Test message`,
        createdBy,
        displayName,
        YesNoUpperCamelCase.YES,
        '2026-01-01',
      )),
    ],
  };
};

export const buildNonHearingQueryMessages = (role: QmPartyRole): CaseQueries => {
  const {createdBy, displayName} = partyConfig(role);
  const queryId = role === 'claimant' ? QM_QUERY_IDS.claimantNonHearing : QM_QUERY_IDS.defendantNonHearing;
  const subject = `${displayName} query`;
  return {
    partyName: 'All queries',
    caseMessages: [
      message(initialQuery(
        queryId,
        subject,
        `${displayName} Test message`,
        createdBy,
        displayName,
        YesNoUpperCamelCase.NO,
      )),
    ],
  };
};

export const buildQueryAwaitingFollowUpMessages = (role: QmPartyRole): CaseQueries => {
  const {createdBy, displayName} = partyConfig(role);
  const queryId = role === 'claimant' ? QM_QUERY_IDS.claimantWithResponse : QM_QUERY_IDS.defendantWithResponse;
  const subject = `${displayName} Query`;
  return {
    partyName: 'All queries',
    caseMessages: [
      message(initialQuery(
        queryId,
        subject,
        `This query was raised by ${displayName}.`,
        createdBy,
        displayName,
        YesNoUpperCamelCase.NO,
      )),
      message(caseworkerResponse(queryId, subject, 'Caseworker response to query.')),
    ],
  };
};

export const buildQueryAfterFollowUpMessages = (role: QmPartyRole): CaseQueries => {
  const {createdBy, displayName} = partyConfig(role);
  const queryId = role === 'claimant' ? QM_QUERY_IDS.claimantWithResponse : QM_QUERY_IDS.defendantWithResponse;
  const subject = `${displayName} Query`;
  return {
    partyName: 'All queries',
    caseMessages: [
      message(initialQuery(
        queryId,
        subject,
        `This query was raised by ${displayName}.`,
        createdBy,
        displayName,
        YesNoUpperCamelCase.NO,
      )),
      message(caseworkerResponse(queryId, subject, 'Caseworker response to query.')),
      message(followUpMessage(
        queryId,
        subject,
        'Follow up message',
        createdBy,
        displayName,
      )),
    ],
  };
};

export const buildClosedQueryMessages = (role: QmPartyRole): CaseQueries => {
  const {createdBy, displayName} = partyConfig(role);
  const queryId = role === 'claimant' ? QM_QUERY_IDS.claimantClosed : QM_QUERY_IDS.defendantClosed;
  const subject = `${displayName} Query`;
  return {
    partyName: 'All queries',
    caseMessages: [
      message(initialQuery(
        queryId,
        subject,
        `This query was raised by ${displayName}.`,
        createdBy,
        displayName,
        YesNoUpperCamelCase.NO,
      )),
      message(caseworkerResponse(queryId, subject, 'Caseworker closing query', true)),
    ],
  };
};

/** Both parties' threads visible on the query list (NOC-style dual visibility). */
export const buildDualPartyQueryMessages = (): CaseQueries => ({
  partyName: 'All queries',
  caseMessages: [
    message(initialQuery(
      QM_QUERY_IDS.claimantWithResponse,
      'Claimant Query',
      'This query was raised by Claimant.',
      claimantCreatedBy,
      'Claimant',
      YesNoUpperCamelCase.NO,
    )),
    message(caseworkerResponse(QM_QUERY_IDS.claimantWithResponse, 'Claimant Query', 'Caseworker response to query.')),
    message(followUpMessage(
      QM_QUERY_IDS.claimantWithResponse,
      'Claimant Query',
      'follow up to caseworker response.',
      claimantCreatedBy,
      'Claimant',
    )),
    message(initialQuery(
      QM_QUERY_IDS.defendantWithResponse,
      'Defendant Query',
      'This query was raised by Defendant.',
      defendantCreatedBy,
      'Defendant',
      YesNoUpperCamelCase.NO,
    )),
    message(caseworkerResponse(QM_QUERY_IDS.defendantWithResponse, 'Defendant Query', 'Caseworker response to query.')),
    message(followUpMessage(
      QM_QUERY_IDS.defendantWithResponse,
      'Defendant Query',
      'follow up to caseworker response.',
      defendantCreatedBy,
      'Defendant',
    )),
  ],
});

export const userIdForRole = (role: QmPartyRole): string => partyConfig(role).userId;
