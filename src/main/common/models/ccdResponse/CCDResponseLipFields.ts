import {ResponseOptions} from 'form/models/responseDeadline';
import {AdditionalTimeOptions} from 'form/models/additionalTime';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {ReportDetail} from 'models/directionsQuestionnaire/experts/expertReportDetails/reportDetail';
import {ExpertCanStillExamine} from 'models/directionsQuestionnaire/experts/expertCanStillExamine';

export interface CCDResponseLipFields {
  responseDeadlineMoreTimeRequest: ResponseOptions
  responseDeadlineAdditionalTime: AdditionalTimeOptions
  responseDeadlineAgreedResponseDeadline: Date
  partialAdmissionAlreadyPaid: YesNoUpperCamelCase
  timelineComment: string
  evidenceComment: string
  mediationContactPerson: string
  mediationContactPhone: string
  determinationWithoutHearing: string
  determinationReasonForHearing: string
  defendantYourSelfEvidence: YesNoUpperCamelCase
  expertReportsAvailable: YesNoUpperCamelCase
  expertReports: ReportDetail[]
  permissionToUseAnExpert: string
  expertCanStillExamine: ExpertCanStillExamine
}
