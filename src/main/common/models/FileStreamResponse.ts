import {Readable} from 'stream';

export class FileStreamResponse {
  contentType: string;
  fileName: string;
  contentLength: string;
  data: Readable;

  constructor(fileType: string, fileName: string, contentLength: string, data: Readable) {
    this.contentType = fileType;
    this.fileName = fileName;
    this.contentLength = contentLength;
    this.data = data;
  }
}
