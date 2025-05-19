import { getUploadFormContent, uploadSelectedFile } from 'services/features/generalApplication/uploadN245FormService';
import { CivilServiceClient } from 'client/civilServiceClient';
import { AppRequest } from 'common/models/AppRequest';
import { Claim } from 'common/models/claim';
import { CaseDocument } from 'common/models/document/caseDocument';

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
});
