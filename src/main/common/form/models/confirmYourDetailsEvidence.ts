import {IsEmail, IsNotEmpty, Validate, ValidateIf} from 'class-validator';
import {OptionalIntegerValidator} from 'form/validators/optionalIntegerValidator';

export class ConfirmYourDetailsEvidence {
    @IsNotEmpty({message: 'ERRORS.ENTER_YOUR_FIRST_NAME'})
    firstName?: string;

    @IsNotEmpty({message: 'ERRORS.ENTER_YOUR_LAST_NAME'})
    lastName?: string;

    @ValidateIf(o => o.emailAddress)
    @IsEmail({allow_display_name: true}, {message: 'ERRORS.ENTER_VALID_EMAIL_EVIDENCE'})
    emailAddress?: string;

    @ValidateIf(o => o.phoneNumber)
    @Validate(OptionalIntegerValidator, {message: 'ERRORS.VALID_PHONE_NUMBER_EVIDENCE'})
    phoneNumber?: number;

    @IsNotEmpty({message: 'ERRORS.ENTER_YOUR_JOB_TITLE'})
    jobTitle: string;

  constructor(firstName?: string, lastName?: string, emailAddress?: string, phoneNumber?: number, jobTitle?: string) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.emailAddress = emailAddress;
    this.phoneNumber = phoneNumber;
    this.jobTitle = jobTitle;
  }
}
