import { IsNotEmpty, ValidateIf, ValidateNested } from 'class-validator';
import { FileUpload } from '../caseProgression/uploadDocumentsUserForm';
import { CaseDocument } from '../document/caseDocument';

export class UploadAdditionalDocument {
    @ValidateNested()
    @ValidateIf((object) => object.caseDocument === undefined || object.caseDocument === null || object.caseDocument === '')
    @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.UPLOAD_FILE_MESSAGE' })
    fileUpload: FileUpload;
    caseDocument: CaseDocument;

    @IsNotEmpty({ message: 'You need to tell us what type of document you are uploading.' })
    typeOfDocument: string;

    constructor(fileUpload?: FileUpload) {
        this.fileUpload = fileUpload;
    }

}