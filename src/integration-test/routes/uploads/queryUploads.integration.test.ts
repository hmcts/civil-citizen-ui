import express, {Request, Response} from 'express';
import request from 'supertest';
import createQueryController from 'routes/features/queryManagement/createQueryController';
import followUpController from 'routes/features/queryManagement/sendFollowUpQueryController';
import {QUERY_MANAGEMENT_CREATE_QUERY, QM_FOLLOW_UP_MESSAGE} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import * as service from 'services/features/queryManagement/queryManagementService';
import {Claim} from 'models/claim';
import {renderUploadPage} from '../../../test/utils/renderUploadForms';
import {summaryRowWithTextValue} from 'models/summaryList/summaryList';

jest.mock('modules/utilityService', () => ({getClaimById: jest.fn()}));
jest.mock('services/features/queryManagement/queryManagementService', () => ({getQueryManagement: jest.fn(), getCancelUrl: jest.fn(), getSummaryList: jest.fn(), removeSelectedDocument: jest.fn(), uploadSelectedFile: jest.fn(), saveQueryManagement: jest.fn(), deleteQueryManagement: jest.fn()}));
jest.mock('services/features/generalApplication/uploadEvidenceDocumentService', () => ({handleMulterError: jest.fn(() => false)}));
// The actual multipart middleware and controller execute; storage/client calls
// are controlled. This proves payload/removal identity, not authenticated saving.
it.each([false, true])('round trips multipart upload/removal through the real query router (follow-up=%s)', async followUp => {
  const files = Array.from({length: 12}, (_, i) => ({caseDocument: {documentName: `saved-${i}.pdf`, documentLink: {document_url: `/documents/${i}`}}}));
  const query = {uploadedFiles: files};
  const claim = Object.assign(new Claim(), {queryManagement: {createQuery: query, sendFollowUpQuery: query}});
  (getClaimById as jest.Mock).mockResolvedValue(claim);
  (service.getQueryManagement as jest.Mock).mockResolvedValue(claim.queryManagement);
  (service.getCancelUrl as jest.Mock).mockReturnValue('/cancel');
  (service.getSummaryList as jest.Mock).mockImplementation(async summary => {
    summary.summaryList.rows = files.map((f, i) => summaryRowWithTextValue(f.caseDocument.documentName, String(i + 1)));
  });
  (service.removeSelectedDocument as jest.Mock).mockImplementation(async (_req, index, model) => {model.uploadedFiles.splice(index, 1);});
  (service.uploadSelectedFile as jest.Mock).mockImplementation(async (req, model) => {
    expect(req.file.originalname).toBe('new.pdf');
    expect(req.file.buffer.toString()).toBe('%PDF-local-fixture');
    model.uploadedFiles.push({caseDocument: {documentName: 'new.pdf', documentLink: {document_url: '/documents/new'}}});
  });
  const app = express();
  app.use((req, res, next) => {
    req.cookies = {};
    req.session = {save: (callback: () => void) => callback()} as unknown as Request['session'];
    res.render = ((view: string, values: Record<string, unknown>) => res.send(renderUploadPage(view + '.njk', 'en', values))) as unknown as Response['render'];
    next();
  });
  app.use(followUp ? followUpController : createQueryController);
  const url = (followUp ? QM_FOLLOW_UP_MESSAGE : QUERY_MANAGEMENT_CREATE_QUERY).replace(':id', '1').replace(':queryId', 'query-1');
  const first = await request(app).get(url).expect(200);
  expect(first.text).toContain('[12][deleteFile]');
  await request(app).post(url).field('action', '[12][deleteFile]').field('messageDetails', 'Saved query').expect(302);
  expect(service.removeSelectedDocument).toHaveBeenLastCalledWith(expect.anything(), 11, expect.anything(), ...(followUp ? [true] : []));
  expect(files.map(f => f.caseDocument.documentLink.document_url)).toEqual(Array.from({length: 11}, (_, i) => `/documents/${i}`));
  const removed = await request(app).get(url).expect(200);
  expect(removed.text).not.toContain('saved-11.pdf');
  await request(app).post(url).field('action', 'uploadButton').field('messageDetails', 'Saved query').attach('selectedFile', Buffer.from('%PDF-local-fixture'), 'new.pdf').expect(302);
  const uploaded = await request(app).get(url).expect(200);
  expect(uploaded.text).toContain('new.pdf');
  expect(files.map(f => f.caseDocument.documentLink.document_url)).toEqual([...Array.from({length: 11}, (_, i) => `/documents/${i}`), '/documents/new']);
});
