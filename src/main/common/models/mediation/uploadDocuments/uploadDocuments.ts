import {TypeOfDocumentsForm} from 'form/models/mediation/uploadDocuments/typeOfDocumentsForm';
import {TypeOfDocumentSection} from "models/caseProgression/uploadDocumentsUserForm";

export enum TypeOfMediationDocuments {
    YOUR_STATEMENT = 'YOUR_STATEMENT',
    DOCUMENTS_REFERRED_TO_IN_STATEMENT = 'DOCUMENTS_REFERRED_TO_IN_STATEMENT'
}

export class TypeOfDocuments {
  id: number;
  type: TypeOfMediationDocuments;
  checked: boolean;
  uploadDocuments?: TypeOfDocumentSection[];

  constructor(id: number, type: TypeOfMediationDocuments, checked: boolean, uploadDocuments?: TypeOfDocumentSection[]) {
    this.id = id;
    this.type = type;
    this.checked = checked;
    this.uploadDocuments = uploadDocuments;
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
    const arrayOfTypeOfDocumentsForm = typeOfDocumentsForm.typeOfDocuments;
    const checkedObject = arrayOfTypeOfDocumentsForm.filter(item => item.checked === true);

    if (this.typeOfDocuments.length === 0) {
      // when we don't have the data on database , create a new array with all values from the form
      this.typeOfDocuments = checkedObject.map((item) =>
        new TypeOfDocuments(item.id,item.type, item.checked));
    } else {
      arrayOfTypeOfDocumentsForm.forEach((formItem)=> {
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
