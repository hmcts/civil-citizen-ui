import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
import {Request} from 'express';

export class TypeOfDocumentSectionMapper {

  static mapToSingleFile(req: Request): FileUpload {
    const file = req.file;
    if (file) {
      return TypeOfDocumentSectionMapper.createFileUpload(file);
    }
    return undefined;
  }

  static mapMulterFileToSingleFile(file: Express.Multer.File): FileUpload {
    return TypeOfDocumentSectionMapper.createFileUpload(file);
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
