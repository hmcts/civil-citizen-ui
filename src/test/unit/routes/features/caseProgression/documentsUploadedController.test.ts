import {Response} from 'express';
import documentsUploadedController from 'routes/features/caseProgression/documentsUploadedController';
import {
  CP_EVIDENCE_UPLOAD_SUBMISSION_URL,
  EVIDENCE_UPLOAD_DOCUMENTS_URL,
  UPLOAD_YOUR_DOCUMENTS_URL,
} from 'routes/urls';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {AppRequest} from 'models/AppRequest';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';

const viewPath = 'features/caseProgression/documents-uploaded';
const claimId = '1645882162449409';

describe('Documents uploaded controller', () => {
  const getHandler = getRouteHandler(documentsUploadedController, 'get', CP_EVIDENCE_UPLOAD_SUBMISSION_URL);

  it('renders the documents uploaded page', async () => {
    const res = createMockResponse();

    await getHandler(
      {params: {id: claimId}} as unknown as AppRequest,
      res as unknown as Response,
      jest.fn(),
    );

    expect(res.render).toHaveBeenCalledWith(viewPath, {
      caseNumber: caseNumberPrettify(claimId),
      uploadYourDocumentsUrl: UPLOAD_YOUR_DOCUMENTS_URL.replace(':id', claimId),
      documentsPageUrl: EVIDENCE_UPLOAD_DOCUMENTS_URL.replace(':id', claimId),
      noCrumbs: true,
    });
  });
});
