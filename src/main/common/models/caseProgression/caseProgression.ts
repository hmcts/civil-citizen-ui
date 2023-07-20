import {UploadDocuments} from 'models/caseProgression/uploadDocumentsType';
import {YesNoUpperCamelCase} from 'form/models/yesNo';

export class CaseProgression{
  claimantUploadDocuments?: UploadDocuments;
  defendantUploadDocuments?: UploadDocuments;
  claimantLastUploadDate?: Date;
  defendantLastUploadDate?: Date;
  trialReadyApplicant?: YesNoUpperCamelCase;
  trialReadyRespondent1?: YesNoUpperCamelCase;
}
