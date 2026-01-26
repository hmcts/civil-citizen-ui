import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
import {Request} from 'express';

export class TypeOfDocumentSectionMapper {

  static mapToSingleFile(req: Request): FileUpload {
    // First check req.file (for upload.single())
    const file = req.file;
    if (file) {
      return TypeOfDocumentSectionMapper.createFileUpload(file);
    }
    // Then check req.files (for upload.any())
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      // For single file uploads, use the first file
      // For fieldname 'selectedFile', find that specific file
      const selectedFile = files.find(f => f.fieldname === 'selectedFile') || files[0];
      return TypeOfDocumentSectionMapper.createFileUpload(selectedFile);
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
