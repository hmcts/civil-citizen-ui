import * as express from 'express';

export class DownloadUtils {

  static downloadPDF(res: express.Response, content: Buffer, filename: string) {
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${filename}.pdf`,
      'Content-Length': content ? content.length : 0,
    });
    res.end(content);
  }
}