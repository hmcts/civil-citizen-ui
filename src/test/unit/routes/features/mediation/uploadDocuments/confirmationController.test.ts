import {Response} from 'express';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {AppRequest} from 'models/AppRequest';
import mediationConfirmationController from 'routes/features/mediation/uploadDocuments/confirmationController';
import {MEDIATION_UPLOAD_DOCUMENTS_CONFIRMATION} from 'routes/urls';
import {createMockResponse, getRouteHandler} from '../../../../../utils/getRouteHandler';

const claimId = '1111';
const viewPath = 'features/common/confirmation-page.njk';

describe('Mediation Confirmation Upload Documents Controller', () => {
  it('should return the mediation upload confirmation page', async () => {
    const res = createMockResponse();
    const req = {params: {id: claimId}};

    await getRouteHandler(mediationConfirmationController, 'get', MEDIATION_UPLOAD_DOCUMENTS_CONFIRMATION)(
      req as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
      pageTitle: 'PAGES.MEDIATION.CONFIRMATION_PAGE.PAGE_TITLE',
      claimNumber: caseNumberPrettify(claimId),
      panel: {titleText: 'COMMON.DOCUMENTS_UPLOADED'},
    }));
  });
});
