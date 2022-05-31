import * as express from 'express';

export class DownloadUtils {

  static downloadPDF(res: express.Response, content: Buffer, filename: string) {
    res.writeHead(200, {
      // 'data-source': 'ContentURI',
      // 'X-Content-Type-Options': 'nosniff',
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=${filename}.pdf`,
      'Content-Length': content ? content.length : 0,
    });
    
    res.send(content);
  }
}
