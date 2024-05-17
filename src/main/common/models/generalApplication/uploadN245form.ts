import { IsNotEmpty, ValidateIf, ValidateNested } from 'class-validator';
import { FileUpload } from '../caseProgression/uploadDocumentsUserForm';
import { CaseDocument } from '../document/caseDocument';


export class UploadN245Form {
    @ValidateNested()
    @ValidateIf((object) => object.caseDocument === undefined || object.caseDocument === null || object.caseDocument === '')
    @IsNotEmpty({ message: 'ERRORS.VALID_CHOOSE_THE_FILE' })
    fileUpload: FileUpload;
    caseDocument: CaseDocument;

    constructor(fileUpload?: FileUpload) {
        this.fileUpload = fileUpload;
    }
}