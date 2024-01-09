import {TypeOfDocuments} from 'models/mediation/uploadFiles/typeOfDocuments';

export class UploadDocuments {
  typeOfDocuments : TypeOfDocuments;

  constructor(typeOfDocuments: TypeOfDocuments) {
    this.typeOfDocuments = typeOfDocuments;
  }
}
