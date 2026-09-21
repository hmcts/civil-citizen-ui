import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'form/models/partyDetails';
import {Address} from 'form/models/address';
import {Email} from 'models/Email';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {QualifiedStatementOfTruthClaimIssue} from 'form/models/statementOfTruth/qualifiedStatementOfTruthClaimIssue';
import {YesNo} from 'form/models/yesNo';
import {Interest} from 'form/models/interest/interest';
import {InterestStartDate} from 'form/models/interest/interestStartDate';
import {InterestClaimOptionsType} from 'form/models/claim/interest/interestClaimOptionsType';
import {InterestClaimFromType, InterestEndDateType, SameRateInterestType} from 'form/models/claimDetails';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';

export const draftVariants = [
  {name: 'individual-company', applicant: PartyType.INDIVIDUAL, respondent: PartyType.COMPANY, applicantName: 'Mx Alex Example', respondentName: 'Example Services', language: ClaimBilingualLanguagePreference.ENGLISH},
  {name: 'company-organisation', applicant: PartyType.COMPANY, respondent: PartyType.ORGANISATION, applicantName: 'Example Supplies', respondentName: 'Example Services', language: ClaimBilingualLanguagePreference.WELSH},
  {name: 'organisation-sole-trader', applicant: PartyType.ORGANISATION, respondent: PartyType.SOLE_TRADER, applicantName: 'Example Supplies', respondentName: 'Mx Sam Example T/A Example Trading', language: ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH},
  {name: 'sole-trader-individual', applicant: PartyType.SOLE_TRADER, respondent: PartyType.INDIVIDUAL, applicantName: 'Mx Alex Example T/A Example Trading', respondentName: 'Mx Sam Example', language: ClaimBilingualLanguagePreference.ENGLISH},
];

function party(type: PartyType, claimant: boolean): Party {
  const result = new Party();
  result.type = type;
  result.partyDetails = new PartyDetails({
    title: 'Mx', firstName: claimant ? 'Alex' : 'Sam', lastName: 'Example',
    partyName: claimant ? 'Example Supplies' : 'Example Services',
    ...(type === PartyType.SOLE_TRADER ? {soleTraderTradingAs: 'Example Trading'} : {}),
  });
  result.partyDetails.primaryAddress = new Address('1 Example Street', '', '', 'Leeds', 'LS1 1AA');
  result.emailAddress = new Email(claimant ? 'claimant@example.com' : 'defendant@example.com');
  return result;
}

export function draftClaim(variant: typeof draftVariants[number]): Claim {
  const claim = new Claim();
  claim.applicant1 = party(variant.applicant, true);
  claim.respondent1 = party(variant.respondent, false);
  claim.totalClaimAmount = 1000;
  claim.claimAmountBreakup = [{value: {claimAmount: '1000', claimReason: 'Unpaid invoice'}}];
  claim.claimFee = {calculatedAmountInPence: 11500, code: 'FEE0209', version: 1};
  claim.claimInterest = YesNo.YES;
  claim.interest = new Interest();
  claim.interest.interestClaimOptions = InterestClaimOptionsType.SAME_RATE_INTEREST;
  claim.interest.sameRateInterestSelection = {sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC};
  claim.interest.interestClaimFrom = InterestClaimFromType.FROM_A_SPECIFIC_DATE;
  claim.interest.interestStartDate = new InterestStartDate('1', '1', '2025', 'Invoice became overdue');
  claim.interest.interestEndDate = InterestEndDateType.UNTIL_SETTLED_OR_JUDGEMENT_MADE;
  claim.claimantBilingualLanguagePreference = variant.language;
  claim.claimDetails = new ClaimDetails();
  claim.claimDetails.reason = {text: 'The invoice remains unpaid.'};
  claim.claimDetails.statementOfTruth = new QualifiedStatementOfTruthClaimIssue(false, true, false, 'Alex Example', 'Owner', true);
  return claim;
}
