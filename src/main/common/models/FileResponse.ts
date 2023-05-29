export class FileResponse {
  fileType: string;
  fileName: string;
  data: Buffer;

  constructor(fileType: string, fileName: string, data: Buffer) {
    this.fileType = fileType;
    this.fileName = fileName;
    this.data = data;
  }
}
