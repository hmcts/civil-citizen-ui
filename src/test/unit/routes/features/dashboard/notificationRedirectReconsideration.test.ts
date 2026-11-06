import {Response} from 'express';
import {CivilServiceClient} from 'client/civilServiceClient';
import {Claim} from 'models/claim';
import {DocumentType} from 'models/document/documentType';
import {SystemGeneratedCaseDocuments} from 'models/document/systemGeneratedCaseDocuments';
import {DASHBOARD_NOTIFICATION_REDIRECT, DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT} from 'routes/urls';
import controller from '../../../../../main/routes/features/dashboard/notificationRedirectController';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

jest.mock('modules/draft-store/draftStoreService', () => ({generateRedisKey: jest.fn(), saveDraftClaim: jest.fn()}));

describe('reconsideration notification redirect', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([DASHBOARD_NOTIFICATION_REDIRECT, DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT])(
    'selects the decision document for %s', async (route) => {
      const document = (id: string, type: DocumentType): SystemGeneratedCaseDocuments => ({
        id: `collection-${id}`,
        value: {
          documentType: type,
          documentName: `${id}.pdf`,
          documentSize: 10,
          createdBy: 'court',
          createdDatetime: new Date('2026-01-01'),
          documentLink: {
            document_url: `http://documents/${id}`,
            document_binary_url: `http://documents/${id}/binary`,
            document_filename: `${id}.pdf`,
          },
        },
      });
      const claim = new Claim();
      claim.id = '123';
      claim.systemGeneratedCaseDocuments = [
        document('unrelated-order', DocumentType.SDO_ORDER),
        document('reconsideration-decision', DocumentType.DECISION_MADE_ON_APPLICATIONS),
      ];
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(claim);
      const recordClick = jest.spyOn(CivilServiceClient.prototype, 'recordClick').mockResolvedValue(undefined);
      const req = {
        params: {id: claim.id, notificationId: 'notification-1', locationName: 'VIEW_DECISION_RECONSIDERATION', documentId: 'unrelated-param'},
        query: {}, cookies: {},
      };
      const res = createMockResponse();
      const next = jest.fn();

      await getRouteHandler(controller, 'get', route)(req as never, res as unknown as Response, next);

      expect(recordClick).toHaveBeenCalledWith('notification-1', req);
      expect(CivilServiceClient.prototype.retrieveClaimDetails).toHaveBeenCalledWith('123', req);
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/case/123/view-documents/reconsideration-decision');
      expect(next).not.toHaveBeenCalled();
    },
  );
});
