import {displayPDF, downloadFile, viewFile} from 'common/utils/downloadUtils';
import {FileResponse} from 'models/FileResponse';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
type MockResponse = Response<any, Record<string, any>> & {
  writeHead: jest.Mock<any, any>;
  end: jest.Mock<any, any>;
};

describe('Test download Utils class', () => {

  test('displayPDF Method with correct headers', () => {
    const mockResponse: MockResponse = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };

    const fileResponse: FileResponse = new FileResponse('application/pdf', 'test.pdf', Buffer.from('Hello, world!'));

    displayPDF(mockResponse, fileResponse);

    expect(mockResponse.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=test.pdf',
      'Content-Length': 13,
    });
  });

  test('downloadFile Method with correct headers', () => {
    const mockResponse: MockResponse = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };

    const fileResponse: FileResponse = new FileResponse('text/plain', 'example.txt', Buffer.from('Hello, world!'));

    downloadFile(mockResponse, fileResponse);

    expect(mockResponse.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'attachment; filename=example.txt',
      'Content-Length': 13,
    });
  });

  test('viewFile Method with correct headers', () => {
    const mockResponse: MockResponse = {
      writeHead: jest.fn(),
      end: jest.fn(),
    };

    const fileResponse: FileResponse = new FileResponse('text/plain', 'example.txt', Buffer.from('Hello, world!'));

    viewFile(mockResponse, fileResponse);

    expect(mockResponse.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'inline; filename=example.txt',
      'Content-Length': 13,
    });
  });
});
