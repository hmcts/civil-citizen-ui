import {displayPDF, downloadFile, downloadFileStream, viewFile, viewFileStream} from 'common/utils/downloadUtils';
import {FileResponse} from 'models/FileResponse';
import {FileStreamResponse} from 'models/FileStreamResponse';
import {PassThrough, Readable} from 'stream';
import {Response as ExpressResponse} from 'express';

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

  const streamToString = async (stream: PassThrough): Promise<string> => {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString();
  };

  test('downloadFileStream Method with correct headers and body', async () => {
    const mockResponse = Object.assign(new PassThrough(), {writeHead: jest.fn()});
    const fileResponse = new FileStreamResponse('text/plain', 'example.txt', '13', Readable.from(['Hello, world!']));

    downloadFileStream(mockResponse as unknown as ExpressResponse, fileResponse);

    expect(mockResponse.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'attachment; filename=example.txt',
      'Content-Length': '13',
    });
    expect(await streamToString(mockResponse)).toEqual('Hello, world!');
  });

  test('viewFileStream Method omits Content-Length when unknown', async () => {
    const mockResponse = Object.assign(new PassThrough(), {writeHead: jest.fn()});
    const fileResponse = new FileStreamResponse('text/plain', 'example.txt', '', Readable.from(['Hello, world!']));

    viewFileStream(mockResponse as unknown as ExpressResponse, fileResponse);

    expect(mockResponse.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'inline; filename=example.txt',
    });
    expect(await streamToString(mockResponse)).toEqual('Hello, world!');
  });
});
