import {CCDPaymentOption} from './ccdPaymentOption';
import {ClaimUpdate} from '../../models/events/eventDto';
import {CCDRepaymentPlan} from './ccdRepaymentPlan';
import {CCDPayBySetDate} from './ccdPayBySetDate';
import {YesNoUpperCamelCase} from '../../../common/form/models/yesNo';
import {CCDParty} from './ccdParty';
import {RespondToClaim} from 'models/ccdResponse/ccdAdmitPartRoute';
import {CCDTimeLineOfEvents} from 'models/ccdResponse/ccdTimeLineOfEvents';
import {TimelineUploadTypeSpec} from 'models/ccdResponse/ccdHowToAddTimeline';
import {CCDRespondentDQ} from 'models/ccdResponse/ccdExpertReportSent';
import {CCDResponseLipFields} from 'models/ccdResponse/CCDResponseLipFields';

export interface CCDResponse extends ClaimUpdate {
  respondent1ClaimResponseTypeForSpec: string;
  defenceAdmitPartPaymentTimeRouteRequired?: CCDPaymentOption;
  respondent1RepaymentPlan?: CCDRepaymentPlan;
  respondToClaimAdmitPartLRspec?: CCDPayBySetDate;
  responseClaimMediationSpecRequired?: string;
  specAoSApplicantCorrespondenceAddressRequired?: YesNoUpperCamelCase;
  totalClaimAmount: number,
  respondent1: CCDParty;
  specDefenceAdmittedRequired: YesNoUpperCamelCase;
  respondToAdmittedClaim: RespondToClaim;
  detailsOfWhyDoesYouDisputeTheClaim: string;
  specResponseTimelineOfEvents: CCDTimeLineOfEvents [];
  specClaimResponseTimelineList: TimelineUploadTypeSpec;
  defenceAdmitPartPaymentTimeRouteRequired2: CCDPaymentOption;
  responseClaimExpertSpecRequired: YesNoUpperCamelCase;
  respondent1DQ: CCDRespondentDQ;
  respondent1LiPResponse: CCDResponseLipFields;
}
