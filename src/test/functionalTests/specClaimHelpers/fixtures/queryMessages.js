const uuid = require('uuid');
const {element} = require('../api/dataHelper');
const {uploadDocument} = require('../api/testingSupport');

const initialQueryMessage = async (userName, userId, isHearingRelated) => element({
  id: uuid.v1(),
  body: `This query was raised by ${userName}.`,
  name: userName,
  subject: `${userName} Query`,
  createdBy: userId,
  createdOn: '2025-11-26T13:28:49.951Z',
  attachments: [element({...(await uploadDocument()), filename: 'query-attachment.pdf'})],
  isHearingRelated: isHearingRelated ? 'Yes' : 'No',
  ...(isHearingRelated ? {  hearingDate: '2026-01-01' } : {}),
});

const queryResponseMessage = async ({id, subject, isHearingRelated, hearingDate, parentId}, userId, isClosed) => element({
  id: uuid.v1(),
  body: isClosed ? 'Caseworker closing query' : 'Caseworker response to query.',
  name: 'Caseworker',
  subject,
  parentId: parentId ? parentId : id,
  createdBy: userId,
  createdOn: new Date().toISOString(),
  attachments: [element({...(await uploadDocument()), filename: 'response-attachment.pdf'})],
  hearingDate,
  isHearingRelated,
  isClosed: isClosed ? 'Yes' : 'No',
});

const followUpQueryMessage = async ({id, subject, isHearingRelated, hearingDate, name, isClosed}, userId) => element({
  name,
  subject,
  id: uuid.v1(),
  body: `${name}'s follow up to caseworker response.`,
  parentId: id,
  createdBy: userId,
  createdOn: new Date().toISOString(),
  attachments: [element({...(await uploadDocument()), filename: 'follow-up-attachment.pdf'})],
  hearingDate,
  isHearingRelated,
  isClosed,
});

module.exports = {initialQueryMessage, queryResponseMessage, followUpQueryMessage};
