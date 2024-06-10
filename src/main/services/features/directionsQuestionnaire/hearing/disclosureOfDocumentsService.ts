import {
  DisclosureOfDocuments,
  TypeOfDisclosureDocument
} from "models/directionsQuestionnaire/hearing/disclosureOfDocuments";

const getDocumentOptionChecked = (disclosureOfDocuments: DisclosureOfDocuments, documentType: TypeOfDisclosureDocument): boolean => {
  if(disclosureOfDocuments !== undefined) {
    const checked = disclosureOfDocuments.documentsTypeChosen.filter(value => value.documentType === documentType);
    return checked !== undefined && checked.length > 0;
  }
}

export {
  getDocumentOptionChecked
}
