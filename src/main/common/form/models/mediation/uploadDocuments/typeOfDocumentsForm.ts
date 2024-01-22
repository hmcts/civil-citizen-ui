import {Validate} from 'class-validator';
import {UploadDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {TypeOfDocumentsItemForm} from 'form/models/mediation/uploadDocuments/typeOfDocumentsItemForm';
import {AtLeastOneTypeOfDocumentSelected} from 'form/validators/atLeastOneTypeOfDocumentSelected';

export class TypeOfDocumentsForm {
  title: string;
  hint?:string;
  @Validate(AtLeastOneTypeOfDocumentSelected)
    typeOfDocuments: TypeOfDocumentsItemForm[];

  constructor(title: string, hint?:string){
    this.title = title;
    this.hint = hint;
    this.typeOfDocuments = [];
  }

  orderArrayById() {
    return this.typeOfDocuments.sort((a, b) => a.id - b.id);
  }
  mapTypeOfDocumentsFormFromStrings(strings: string[]): TypeOfDocumentsForm {
    if(strings === undefined) {
      this.typeOfDocuments.forEach((item) => item.checked = false);
    }else{
      this.typeOfDocuments.forEach((typeOfDocument) => {
        const hasInformation = strings.find((str) => str === typeOfDocument.type);
        typeOfDocument.checked = !!hasInformation;
      });
    }
    return this;
  }

  mapTypeOfDocumentsFormFromUploadDocuments(uploadDocuments: UploadDocuments): TypeOfDocumentsForm {
    if(uploadDocuments !== undefined) {
      uploadDocuments.typeOfDocuments.forEach((typeOfDocuments) => {
        const foundItem = this.typeOfDocuments.find((item) => item.type === typeOfDocuments.type);
        // Check if the item is found before modifying
        if (foundItem) {
          foundItem.checked = typeOfDocuments.checked;
        }
      });
    }
    return this;
  }
}
