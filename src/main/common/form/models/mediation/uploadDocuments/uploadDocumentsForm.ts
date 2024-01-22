import {Validate} from 'class-validator';
import {UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {TypeOfDocumentsItemForm} from 'form/models/mediation/uploadDocuments/typeOfDocumentsItemForm';
import {AtLeastOneTypeOfDocumentSelected} from 'form/validators/atLeastOneTypeOfDocumentSelected';

export class uploadDocumentsForm {
  title: string;
  hint?:string;
  @Validate(AtLeastOneTypeOfDocumentSelected)
    typeOfDocuments: TypeOfDocumentsItemForm[];

  constructor(title: string, hint?:string){
    this.title = title;
    this.hint = hint;
    this.typeOfDocuments = [];
  }

}
