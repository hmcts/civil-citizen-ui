# CCD response field inventory for DTSCCI-4205

Source: current CUI `CCDResponse` interface and Civil CCD CaseField definitions, inspected 30 October 2026. This lists top-level wire fields, not an approved respondent-2 payload. Nested types and backend callback ownership must be reviewed before implementation. A name match establishes schema presence only, not compatible semantics or citizen access.

| Current response field | CCD definition | Candidate respondent-2 counterpart | Decision |
|---|---|---|---|
| `respondent1ClaimResponseTypeForSpec` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (FixedRadioList:RespondentResponseTypeSpec) | `respondent2ClaimResponseTypeForSpec` | Schema candidate exists; verify nested type and callback semantics |
| `defenceAdmitPartPaymentTimeRouteRequired` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (FixedRadioList:RespondentResponsePartAdmissionPaymentTimeLRspec) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `respondent1RepaymentPlan` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (RepaymentPlanLRspec) | `respondent2RepaymentPlan` | Schema candidate exists; verify nested type and callback semantics |
| `respondToClaimAdmitPartLRspec` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (RespondToClaimAdmitPartLRspec) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `responseClaimMediationSpecRequired` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (YesOrNo) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `specAoSApplicantCorrespondenceAddressRequired` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (YesOrNo) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `respondToAdmittedClaim` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (RespondToClaim) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `specDefenceAdmittedRequired` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (YesOrNo) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `respondToAdmittedClaimOwingAmountPounds` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (Text) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `respondToAdmittedClaimOwingAmount` | `ccd-definition/civil/CaseField/CaseFieldLRspec-LRA-Bulk.json` (MoneyGBP) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `specClaimResponseTimelineList` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (FixedRadioList:ClaimTimelineList) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `specResponseTimelineOfEvents` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (Collection:TimelineOfEvents) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `specResponselistYourEvidenceList` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (Collection:EvidenceList) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `totalClaimAmount` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (Number) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `respondent1` | `ccd-definition/civil/CaseField/CaseField.json` (Party) | `respondent2` | Schema candidate exists; verify nested type and callback semantics |
| `defenceRouteRequired` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (FixedRadioList:RespondentResponseAdmissionType) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `respondToClaim` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (RespondToClaim) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `detailsOfWhyDoesYouDisputeTheClaim` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (TextArea) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `respondent1BankAccountList` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (Collection:BankAccount) | `respondent2BankAccountList` | Schema candidate exists; verify nested type and callback semantics |
| `disabilityPremiumPayments` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (YesOrNo) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `severeDisabilityPremiumPayments` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (YesOrNo) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `respondent1DQHomeDetails` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (HomeDetailsLRspec) | `respondent2DQHomeDetails` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1PartnerAndDependent` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (PartnerAndDependentsLRspec) | `respondent2PartnerAndDependent` | Schema candidate exists; verify nested type and callback semantics |
| `defenceAdmitPartEmploymentTypeRequired` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (YesOrNo) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `respondToClaimAdmitPartEmploymentTypeLRspec` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (MultiSelectList:EmploymentTypeCheckboxFixedListLRspec) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `responseClaimAdmitPartEmployer` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (AdmitPartEmployer) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `specDefendant1SelfEmploymentDetails` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (SelfEmployment) | `specDefendant2SelfEmploymentDetails` | Schema candidate exists; verify nested type and callback semantics |
| `respondToClaimAdmitPartUnemployedLRspec` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (UnemployedComplexTypeLRspec) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `respondent1CourtOrderPaymentOption` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (YesOrNo) | `respondent2CourtOrderPaymentOption` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1CourtOrderDetails` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (Collection:PaymentOrder) | `respondent2CourtOrderDetails` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1LoanCreditOption` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (YesOrNo) | `respondent2LoanCreditOption` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1LoanCreditDetails` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (Collection:PaymentOption) | `respondent2LoanCreditDetails` | Schema candidate exists; verify nested type and callback semantics |
| `responseToClaimAdmitPartWhyNotPayLRspec` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (TextArea) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `respondent1DQCarerAllowanceCredit` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (YesOrNo) | `respondent2DQCarerAllowanceCredit` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1DQCarerAllowanceCreditFullAdmission` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (YesOrNo) | `respondent2DQCarerAllowanceCreditFullAdmission` | Schema candidate exists; verify nested type and callback semantics |
| `specDefendant1Debts` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (Debts) | `specDefendant2Debts` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1DQRecurringIncome` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (Collection:RecurringIncome) | `respondent2DQRecurringIncome` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1DQRecurringIncomeFA` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (Collection:RecurringIncome) | `respondent2DQRecurringIncomeFA` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1DQRecurringExpenses` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (Collection:RecurringExpense) | `respondent2DQRecurringExpenses` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1DQRecurringExpensesFA` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (Collection:RecurringExpense) | `respondent2DQRecurringExpensesFA` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1LiPResponse` | `ccd-definition/civil/CaseField/CaseField-CUI.json` (RespondentLiPResponse) | Not established | No matching CCD CaseField found; backend/CCD contract required |
| `respondent1LiPResponseCarm` | `ccd-definition/civil/CaseField/CaseField-CARM.json` (MediationLiPCarm) | Not established | No matching CCD CaseField found; backend/CCD contract required |
| `respondent1LiPFinancialDetails` | `ccd-definition/civil/CaseField/CaseField-CUI.json` (FinancialDetailsLiP) | Not established | No matching CCD CaseField found; backend/CCD contract required |
| `respondent1DQLanguage` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (Language) | `respondent2DQLanguage` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1DQVulnerabilityQuestions` | `ccd-definition/civil/CaseField/CaseField.json` (VulnerabilityQuestions) | `respondent2DQVulnerabilityQuestions` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1DQRequestedCourt` | `ccd-definition/civil/CaseField/CaseField.json` (RequestedCourt) | `respondent2DQRequestedCourt` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1DQWitnesses` | `ccd-definition/civil/CaseField/CaseField.json` (Witnesses) | `respondent2DQWitnesses` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1DQHearingSmallClaim` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (SmallClaimHearing) | `respondent2DQHearingSmallClaim` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1DQHearingFastClaim` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (HearingLRspec) | `respondent2DQHearingFastClaim` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1DQExperts` | `ccd-definition/civil/CaseField/CaseField.json` (Experts) | `respondent2DQExperts` | Schema candidate exists; verify nested type and callback semantics |
| `respondent1DQHearingSupport` | `ccd-definition/civil/CaseField/CaseField.json` (HearingSupportRequirements) | `respondent2DQHearingSupport` | Schema candidate exists; verify nested type and callback semantics |
| `responseClaimExpertSpecRequired` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (YesOrNo) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `respondent1DQFixedRecoverableCostsIntermediate` | `ccd-definition/civil/CaseField/CaseField-MINTI.json` (FixedRecoverableCostsIntermediate) | `respondent2DQFixedRecoverableCostsIntermediate` | Schema candidate exists; verify nested type and callback semantics |
| `specRespondent1DQDisclosureOfElectronicDocuments` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (DisclosureOfElectronicDocumentsLRspec) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `specRespondent1DQDisclosureOfNonElectronicDocuments` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (DisclosureOfNonElectronicDocumentsLRspec) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `respondent1DQClaimantDocumentsToBeConsidered` | `ccd-definition/civil/CaseField/CaseField-MINTI.json` (DocumentsToBeConsidered) | Not established | No matching CCD CaseField found; backend/CCD contract required |
| `respondentResponsePcqId` | `ccd-definition/civil/CaseField/CaseField-CUI-R2.json` (Text) | No automatic substitution | Classify as shared, derived or party-specific with backend owner; never overwrite another response |
| `respondent1LiPStatementOfTruth` | `ccd-definition/civil/CaseField/CaseField-CUI.json` (StatementOfTruth) | Not established | No matching CCD CaseField found; backend/CCD contract required |

## Numbered party context beyond the response payload

| CCD field | Definition and type |
|---|---|
| `respondent2` | `ccd-definition/civil/CaseField/CaseField.json` (Party) |
| `respondent2Represented` | `ccd-definition/civil/CaseField/CaseField.json` (YesOrNo) |
| `respondent2SameLegalRepresentative` | `ccd-definition/civil/CaseField/CaseField.json` (YesOrNo) |
| `respondent2OrganisationPolicy` | `ccd-definition/civil/CaseField/CaseField.json` (OrganisationPolicy) |
| `respondentResponseIsSame` | `ccd-definition/civil/CaseField/CaseField.json` (YesOrNo) |
| `respondent2ClaimResponseType` | `ccd-definition/civil/CaseField/CaseField.json` (FixedRadioList:RespondentResponseType) |
| `respondent2ClaimResponseTypeForSpec` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (FixedRadioList:RespondentResponseTypeSpec) |
| `respondent2ResponseDeadline` | `ccd-definition/civil/CaseField/CaseField.json` (DateTime) |
| `respondent2ResponseDate` | `ccd-definition/civil/CaseField/CaseField.json` (DateTime) |
| `respondent2TimeExtensionDate` | `ccd-definition/civil/CaseField/CaseField.json` (DateTime) |
| `respondent2AcknowledgeNotificationDate` | `ccd-definition/civil/CaseField/CaseField.json` (DateTime) |
| `respondent2DQWitnesses` | `ccd-definition/civil/CaseField/CaseField.json` (Witnesses) |
| `respondent2DQWitnessesSmallClaim` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (Witnesses) |
| `respondent2DQHearingSmallClaim` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (SmallClaimHearing) |
| `respondent2DQHearingFastClaim` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (HearingLRspec) |
| `respondent2DQRequestedCourt` | `ccd-definition/civil/CaseField/CaseField.json` (RequestedCourt) |
| `respondent2DQLanguage` | `ccd-definition/civil/CaseField/CaseFieldLRspec.json` (Language) |
| `respondent2LiPResponse` | Not found in inspected CaseField definitions; do not assume support |
| `respondent2LiPFinancialDetails` | Not found in inspected CaseField definitions; do not assume support |
| `respondent2PinToPostLRspec` | Not found in inspected CaseField definitions; do not assume support |
