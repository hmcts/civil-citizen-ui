import {Validate} from 'class-validator';
import {IsCheckedArrayValidator} from 'form/validators/isCheckedArray';

export enum TypeOfMediationDocuments {
    YOUR_STATEMENT = 'YOUR_STATEMENT',
    DOCUMENTS_REFERRED_TO_IN_STATEMENT = 'DOCUMENTS_REFERRED_TO_IN_STATEMENT'
}

export class TypeOfDocumentsItemForm {
  id: number;
  value: string;
  text: string;
  checked: boolean;
  type: TypeOfMediationDocuments;
  hint?: string;

  constructor(id: number, value: string, text: string, checked: boolean, type: TypeOfMediationDocuments, hint?: string ) {
    this.id = id;
    this.value = value;
    this.text = text;
    this.checked = checked;
    this.type = type;
    this.hint = hint;
  }
}

export class TypeOfDocuments {
  id: number;
  type: TypeOfMediationDocuments;
  checked: boolean;

  constructor(id: number, type: TypeOfMediationDocuments, checked: boolean) {
    this.id = id;
    this.type = type;
    this.checked = checked;
  }

}

export class UploadDocuments {

  typeOfDocuments: TypeOfDocuments[];

  constructor(typeOfDocuments: TypeOfDocuments[]) {
    this.typeOfDocuments = typeOfDocuments;
  }
  orderArrayById() {
    return this.typeOfDocuments.sort((a, b) => a.id - b.id);
  }
  mapUploadDocumentsFromTypeOfDocumentsForm(typeOfDocumentsForm: TypeOfDocumentsForm): UploadDocuments {
    //just object that has been checked
    const typeOfDocumentFormOrdinate = typeOfDocumentsForm.typeOfDocuments;
    const checkedObject = typeOfDocumentFormOrdinate.filter(item => item.checked === true);

    if (this.typeOfDocuments.length === 0) {
      // when we don't have the data on database , create a new array with all values from the form
      this.typeOfDocuments = checkedObject.map((item) =>
        new TypeOfDocuments(item.id,item.type, item.checked));
    } else {
      typeOfDocumentFormOrdinate.forEach((formItem)=> {
        const foundItem = this.typeOfDocuments.findIndex((item) => item.type === formItem.type);

        if(foundItem !== -1){
        //we have the item on database
          const checkedBothAreTrue = this.typeOfDocuments[foundItem].checked === formItem.checked;
          //if they are not the same, remove the item
          if(!checkedBothAreTrue){
            this.typeOfDocuments.splice(foundItem, 1);
          }
        } else {
          //if we don't have the item on database, add it
          this.typeOfDocuments.push(new TypeOfDocuments(formItem.id, formItem.type, formItem.checked));
        }
      });
    }
    return this;
  }
}

export class TypeOfDocumentsForm {
  title: string;
  hint?:string;
  @Validate(IsCheckedArrayValidator, {message: 'ERRORS.VALID_ENTER_AT_LEAST_ONE_UPLOAD' })
    typeOfDocuments: TypeOfDocumentsItemForm [];

  constructor(title: string, hint?:string){
    // Initialize default values or leave them undefined
    this.title = title;
    this.hint = hint;
    this.typeOfDocuments = [];
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

    if(UploadDocuments !== undefined) {
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
