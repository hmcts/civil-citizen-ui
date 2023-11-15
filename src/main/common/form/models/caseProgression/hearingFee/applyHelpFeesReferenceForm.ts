import {IsDefined, IsNotEmpty, ValidateIf} from 'class-validator';
import {YesNo} from 'common/form/models/yesNo';

export class ApplyHelpFeesReferenceForm {

  @IsDefined({message: 'ERRORS.VALID_YES_NO_SELECTION_UPPER'})
    option: string;
  @ValidateIf(o =>  o.isReferenceRequired())
  @IsDefined({message: 'ERRORS.VALID_ENTER_REFERENCE_NUMBER'})
  @IsNotEmpty({message: 'ERRORS.VALID_ENTER_REFERENCE_NUMBER'})
  referenceNumber: string;

  constructor(option?: string, referenceNumber?: string) {
    this.option = option;
    if(this.isReferenceRequired()){
      this.referenceNumber = referenceNumber;
    }else{
      this.referenceNumber = undefined;
    }
  }

  isReferenceRequired(){
    return this.option === YesNo.YES;
  }

  public static fromObject(record: Record<string, string>){
    return new ApplyHelpFeesReferenceForm(record?.option, record?.referenceNumber);
  }

}
