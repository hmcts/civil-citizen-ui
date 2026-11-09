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

const toContentDisposition = (action: string, fileName: string): string => {
  // ASCII fallback for old clients; filename* carries the real name (e.g. Welsh characters) per RFC 6266
  const asciiFallback = fileName.replace(/[^\x20-\x7E]|["\\]/g, '_');
  return `${action}; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
};

export function streamFile(res: Response, fileResponse: FileStreamResponse, action: string) {
  // The browser can disconnect while the document is fetched from civil-service. pipeline would throw
  // synchronously on the closed response and leave the upstream stream open, so stop here instead.
  if (res.destroyed || res.writableEnded) {
    fileResponse.data.destroy();
    logger.info(`Client disconnected before document ${fileResponse.fileName} could be streamed`);
    return;
  }
  const headers: OutgoingHttpHeaders = {
    'Content-Type': fileResponse.contentType,
    'Content-Disposition': toContentDisposition(action, fileResponse.fileName),
  };
  if (fileResponse.contentLength) {
    headers['Content-Length'] = fileResponse.contentLength;
  }
  try {
    res.writeHead(200, headers);
  } catch (err) {
    // The stream has not been handed to pipeline yet, so close it here
    fileResponse.data.destroy();
    throw err;
  }
  // Record whether the browser went away before the upstream stream failed. A client abort makes pipeline
  // destroy the upstream stream, which then reports 'aborted'; that is expected and not an error.
  let sourceFailed = false;
  let clientDisconnected = false;
  fileResponse.data.once('error', () => {
    sourceFailed = true;
  });
  res.once('close', () => {
    if (!res.writableFinished && !sourceFailed) {
      clientDisconnected = true;
    }
  });
  // Headers are already sent, so a failure here can only be logged; pipeline destroys both streams
  try {
    pipeline(fileResponse.data, res, (err) => {
      if (!err) {
        return;
      }
      if (clientDisconnected) {
        logger.info(`Client disconnected while document ${fileResponse.fileName} was streaming: ${err.message}`);
      } else {
        logger.error(`Error streaming document ${fileResponse.fileName}: ${err.message}`);
      }
    });
  } catch (err) {
    // pipeline throws synchronously (without destroying the source) if the response closed meanwhile.
    // Rethrowing would make the error handler try to render a page after the headers were sent.
    fileResponse.data.destroy();
    res.destroy();
    logger.info(`Client disconnected before document ${fileResponse.fileName} could be streamed: ${err.message}`);
  }
}
