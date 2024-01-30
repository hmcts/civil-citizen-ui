import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
import {Request} from 'express';

export class TypeOfDocumentSectionMapper {

  static mapToSingleFile(req: Request): FileUpload {
    const file = req.file;
    if (file) {
      const mappedFile: FileUpload = new FileUpload();
      mappedFile.fieldname= file.fieldname;
      mappedFile.originalname= file.originalname;
      mappedFile.mimetype= file.mimetype;
      mappedFile.size= file.size;
      mappedFile.buffer = file.buffer;
      return mappedFile;
    }
    return undefined;
  }
}
