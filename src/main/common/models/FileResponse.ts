export class FileResponse {
  contentType: string;
  fileName: string;
  data: Buffer;

  constructor(fileType: string, fileName: string, data: Buffer) {
    this.contentType = fileType;
    this.fileName = fileName;
    this.data = data;
  }
}
