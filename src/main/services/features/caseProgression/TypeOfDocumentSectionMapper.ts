import {FileUpload} from 'models/caseProgression/uploadDocumentsUserForm';
import {Request} from 'express';

export class TypeOfDocumentSectionMapper {
/*  static mapToTypeOfDocumentSections(documentsForDisclosure: any[], req: Request): TypeOfDocumentSection[] {
    return documentsForDisclosure.map((item: any, index: number) => {
      const typeOfDocument: string = item.typeOfDocument.trim();
      const dateDay: string = item['date-day'];
      const dateMonth: string = item['date-month'];
      const dateYear: string = item['date-year'];

      const fileName = `documentsForDisclosure[${index}][fileUpload]`; // fileNameSchema
      //const documentSection = new TypeOfDocumentSection(typeOfDocument, dateDay, dateMonth, dateYear, TypeOfDocumentSectionMapper.mapToFilesDocumentSections(fileName, req));
      return documentSection;
    });
  }*/
/*  static mapToFilesDocumentSections(name: string, req: Request): FileUpload {
    const files = req.files as Express.Multer.File[];
    const file = files.find(file => file.fieldname === name);

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
  }*/

  static mapToSingleFile(req: Request): FileUpload {
    const file = req.file as Express.Multer.File;
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
