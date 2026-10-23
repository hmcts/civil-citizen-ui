import {Response} from 'express';
import {OutgoingHttpHeaders} from 'http';
import {pipeline} from 'stream';
import {FileResponse} from 'models/FileResponse';
import {FileStreamResponse} from 'models/FileStreamResponse';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('downloadUtils');

const fileActionDownload = 'attachment';
const fileActionView = 'inline';

export function displayPDF(res: Response, fileResponse: FileResponse) {
  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename=${fileResponse.fileName}`,
    'Content-Length': fileResponse.data.length,
  });
  res.end(fileResponse.data);
}

export function downloadFile(res: Response, fileResponse: FileResponse) {
  retrieveFile(res, fileResponse, fileActionDownload);
}

export function viewFile(res: Response, fileResponse: FileResponse) {
  retrieveFile(res, fileResponse, fileActionView);
}

export function retrieveFile(res: Response, fileResponse: FileResponse, action: string) {
  res.writeHead(200, {
    'Content-Type': fileResponse.contentType,
    'Content-Disposition': `${action}; filename=${fileResponse.fileName}`,
    'Content-Length': fileResponse.data.length,
  });
  res.end(fileResponse.data);
}

export function downloadFileStream(res: Response, fileResponse: FileStreamResponse) {
  streamFile(res, fileResponse, fileActionDownload);
}

export function viewFileStream(res: Response, fileResponse: FileStreamResponse) {
  streamFile(res, fileResponse, fileActionView);
}

export function streamFile(res: Response, fileResponse: FileStreamResponse, action: string) {
  const headers: OutgoingHttpHeaders = {
    'Content-Type': fileResponse.contentType,
    'Content-Disposition': `${action}; filename=${fileResponse.fileName}`,
  };
  if (fileResponse.contentLength) {
    headers['Content-Length'] = fileResponse.contentLength;
  }
  res.writeHead(200, headers);
  // Headers are already sent, so a failure here can only be logged; pipeline destroys both streams
  pipeline(fileResponse.data, res, (err) => {
    if (err) {
      logger.error(`Error streaming document ${fileResponse.fileName}: ${err.message}`);
    }
  });
}
