import { getUploadFormContent, removeN245Form, uploadSelectedFile } from 'services/features/generalApplication/uploadN245FormService';
import { CivilServiceClient } from 'client/civilServiceClient';
import { AppRequest } from 'common/models/AppRequest';
import { Claim } from 'common/models/claim';
import { CaseDocument } from 'common/models/document/caseDocument';
import { GeneralApplication } from 'common/models/generalApplication/GeneralApplication';
import { UploadGAFiles } from 'common/models/generalApplication/uploadGAFiles';

jest.mock('../../../../../main/modules/draft-store/draftStoreService', () => ({
  generateRedisKey: jest.fn(),
  saveDraftClaim: jest.fn(),
}));
jest.mock('../../../../../main/services/features/generalApplication/response/generalApplicationResponseStoreService', () => ({
  saveDraftGARespondentResponse: jest.fn(),
  getDraftGARespondentResponse: jest.fn(),
}));
jest.mock('../../../../../main/modules/draft-store/gaHwFeesDraftStore', () => ({
  saveDraftGAHWFDetails: jest.fn(),
  getDraftGAHWFDetails: jest.fn(),
}));
jest.mock('i18next', () => ({
  use: jest.fn(),
  t: (i: string | unknown) => i,
}));

describe('UploadN245 Form service', () => {

  it('should get the content for the page', () => {

    const pageContent = getUploadFormContent('en');

    expect(pageContent).toEqual([
      {
        type: 'html',
        data: {
          html: '<p class="govuk-body">PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.UPLOAD_HERE</p>',
        },
      },
      {
        type: 'p',
        data: {
          text: 'PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.OFFER_OF_PAYMENT',
        },
      },
      {
        type: 'p',
        data: {
          text: 'PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.INCOME_AND_EXPENSE',
        },
      },
      {
        type: 'p',
        data: {
          text: 'PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.WAYS_TO_COMPLETE',
        },
      },
      {
        type: 'html',
        data: {
          html: '<ul class="govuk-list govuk-list--bullet">\n              <li>PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.FILL_ONLINE</li>\n              <li>PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.PRINT_THE_FORM</li>\n            </ul>',
        },
      },
      {
        type: 'p',
        data: {
          text: 'PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.SAVE_THE_FORM',
        },
      },
      {
        type: 'html',
        data: {
          html: '<ul class="govuk-list govuk-list--bullet">\n              <li>PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.NAME_THE_FORM</li>\n              <li>PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.FILE_SIZE</li>\n              <li>PAGES.GENERAL_APPLICATION.UPLOAD_N245_FORM.FILE_FORMAT</li>\n            </ul>',
        },
      },
    ]);
  });
  it('should upload the selected file', async () => {
    const buffer = Buffer.from('Test file content');
    const req = {
      file: {
        fieldname: 'selectedFile',
        originalname: 'test.text',
        mimetype: 'text/plain',
        size: 123,
        buffer,
      },
    };
    const createdDatetime = new Date();
    const mockCaseDocument: CaseDocument = <CaseDocument>{
      createdBy: 'test',
      documentLink: { document_url: 'http://test', document_binary_url: 'http://test/binary', document_filename: 'test.png' },
      documentName: 'test.text',
      documentType: null,
      documentSize: 12345,
      createdDatetime,
    };
    jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockResolvedValueOnce(mockCaseDocument);
    const uploadedData = await uploadSelectedFile(req as AppRequest, new Claim());
    expect(uploadedData).toEqual({
      form: {
        model: {
          caseDocument: {
            createdBy: 'test',
            documentLink: {
              document_url: 'http://test',
              document_binary_url: 'http://test/binary',
              document_filename: 'test.png',
            },
            documentName: 'test.text',
            documentType: null,
            documentSize: 12345,
            createdDatetime,
          },
        },
        errors: [
        ],
      },
      documentName: 'test.text',
    });
  });
  it('should show error upon invalid file upload', async () => {
    const req = {
      file: '',
    };
    const uploadedData = await uploadSelectedFile(req as unknown as AppRequest, new Claim());
    expect(uploadedData).toEqual({
      form: {
        model: {
          fileUpload: undefined,
        },
        errors: [
          {
            target: {
              fileUpload: undefined,
            },
            value: undefined,
            property: 'fileUpload',
            children: [
            ],
            constraints: {
              isNotEmpty: 'ERRORS.GENERAL_APPLICATION.UPLOAD_FILE_MESSAGE_V2',
            },
          },
        ],
      },
      documentName: undefined,
    });
  });

  describe('deleting the N245 from document management', () => {
    const caseDocument = (id: string) => <CaseDocument>{
      documentLink: { document_url: `http://dm-store/documents/${id}`, document_binary_url: `http://dm-store/documents/${id}/binary`, document_filename: `${id}.pdf` },
      documentName: `${id}.pdf`,
    };
    const claimWithN245 = (id: string): Claim => {
      const claim = new Claim();
      claim.generalApplication = new GeneralApplication();
      const uploadedN245 = new UploadGAFiles();
      uploadedN245.caseDocument = caseDocument(id);
      claim.generalApplication.uploadN245Form = uploadedN245;
      return claim;
    };
    const fileRequest = () => ({
      file: { fieldname: 'selectedFile', originalname: 'new.text', mimetype: 'text/plain', size: 123, buffer: Buffer.from('Test file content') },
    }) as unknown as AppRequest;

    afterEach(() => jest.restoreAllMocks());

    it('should delete the previous N245 when it is replaced', async () => {
      jest.spyOn(CivilServiceClient.prototype, 'uploadDocument').mockResolvedValueOnce(caseDocument('new-doc'));
      const deleteDocument = jest.spyOn(CivilServiceClient.prototype, 'deleteDocument').mockResolvedValue(undefined);
      const req = fileRequest();

      await uploadSelectedFile(req, claimWithN245('old-doc'));

      expect(deleteDocument).toHaveBeenCalledTimes(1);
      expect(deleteDocument).toHaveBeenCalledWith(req, 'old-doc');
    });

    it('should not delete anything when the new file is invalid', async () => {
      const deleteDocument = jest.spyOn(CivilServiceClient.prototype, 'deleteDocument').mockResolvedValue(undefined);

      await uploadSelectedFile({ file: '' } as unknown as AppRequest, claimWithN245('old-doc'));

      expect(deleteDocument).not.toHaveBeenCalled();
    });

    it('should remove the N245 from the draft and delete it', async () => {
      const deleteDocument = jest.spyOn(CivilServiceClient.prototype, 'deleteDocument').mockResolvedValue(undefined);
      const claim = claimWithN245('old-doc');
      const req = {} as AppRequest;

      await removeN245Form(req, claim);

      expect(claim.generalApplication.uploadN245Form).toBeUndefined();
      expect(deleteDocument).toHaveBeenCalledWith(req, 'old-doc');
    });

    it('should still remove the N245 when document management refuses the delete', async () => {
      jest.spyOn(CivilServiceClient.prototype, 'deleteDocument').mockRejectedValue(new Error('403'));
      const claim = claimWithN245('old-doc');

      await expect(removeN245Form({} as AppRequest, claim)).resolves.toBeUndefined();
      expect(claim.generalApplication.uploadN245Form).toBeUndefined();
    });
  });
});
