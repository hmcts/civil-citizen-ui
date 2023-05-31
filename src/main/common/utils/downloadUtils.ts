import {Response} from 'express';
import {FileResponse} from 'models/FileResponse';

export function displayPDF(res: Response, content: Buffer, filename: string) {
  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename=${filename}.pdf`,
    'Content-Length': content ? content.length : 0,
  });
  res.end(content);
}

export function downloadFile(res: Response, fileResponse: FileResponse) {
  res.writeHead(200, {
    'Content-Type': fileResponse.contentType,
    'Content-Disposition': `attachment; filename=${fileResponse.fileName}`,
    'Content-Length': fileResponse.data.length,
  });
  res.end(fileResponse.data);
}
