import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
import {Request} from 'express';

export class TypeOfDocumentSectionMapper {

  static mapReqToSingleFile(req: Request): FileUpload {
    const file = req.file as Express.Multer.File;
    if (file) {
      return TypeOfDocumentSectionMapper.createFileUpload(file);
    }
    return undefined;
  }

  static mapMulterFileToSingleFile(file: Express.Multer.File): FileUpload {
    if (file) {
      return TypeOfDocumentSectionMapper.createFileUpload(file);
    }
    return undefined;
  }

  private static createFileUpload(file: Express.Multer.File): FileUpload {
    const fileUpload: FileUpload = new FileUpload();
    fileUpload.fieldname = file.fieldname;
    fileUpload.originalname = file.originalname;
    fileUpload.mimetype = file.mimetype;
    fileUpload.size = file.size;
    fileUpload.buffer = file.buffer;
    return fileUpload;
  }
}
