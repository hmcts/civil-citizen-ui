import {Response} from 'express';
import {FileResponse} from 'models/FileResponse';

export function displayPDF(res: Response, fileResponse: FileResponse) {
  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename=${fileResponse.fileName}`,
    'Content-Length': fileResponse.data.length,
  });
  res.end(fileResponse.data);
}

export function downloadFile(res: Response, fileResponse: FileResponse) {
  retrieveFile(res, fileResponse, 'attachment');
}

export function viewFile(res: Response, fileResponse: FileResponse) {
  retrieveFile(res, fileResponse, 'inline');
}

export function retrieveFile(res: Response, fileResponse: FileResponse, action: string) {
  res.writeHead(200, {
    'Content-Type': fileResponse.contentType,
    'Content-Disposition': `${action}; filename=${fileResponse.fileName}`,
    'Content-Length': fileResponse.data.length,
  });
  res.end(fileResponse.data);
}
