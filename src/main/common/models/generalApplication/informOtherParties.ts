import { GenericYesNo } from 'common/form/models/genericYesNo';

export class InformOtherParties extends GenericYesNo {


    reasonForCourtNotInformingOtherParties?: string;

    constructor(option?: string, reasonForCourtNotInformingOtherParties?: string) {
        super(option, 'ERRORS.GENERAL_APPLICATION.NEED_TO_TELL');
        this.reasonForCourtNotInformingOtherParties = reasonForCourtNotInformingOtherParties;
    }
}
