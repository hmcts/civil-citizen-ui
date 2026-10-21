import * as urls from 'routes/urls';

export type PreviewPageStatus = 'ready' | 'prerequisite' | 'action';

export type PreviewPageLink = {
  title: string;
  path: string;
  status: PreviewPageStatus;
  notes?: string;
};

export type PreviewPageGroup = {
  title: string;
  description: string;
  pages: PreviewPageLink[];
};

/**
 * Fixture claim IDs seeded in e2e Redis (`uiPreviewRedisData.json`) and local service stubs
 * (`compose/ui-preview-mappings/`) for UI Preview.
 */
export const UI_PREVIEW_FIXTURE_CLAIM_ID = '1645882162449409';
export const UI_PREVIEW_FULL_ADMIT_CLAIM_ID = '1645882162449601';
export const UI_PREVIEW_PART_ADMIT_CLAIM_ID = '1645882162449602';
export const UI_PREVIEW_CASE_PROGRESSION_CLAIM_ID = '1645882162449603';
export const UI_PREVIEW_GA_CLAIM_ID = '1645882162449604';
/** Defendant part-admit by instalments — statement of means and admission screens. */
export const UI_PREVIEW_SOM_CLAIM_ID = '1645882162449605';
export const UI_PREVIEW_GA_APP_ID = '1732194111758649';
export const UI_PREVIEW_FIXTURE_USER_ID = 'someID';
/** Parent query id on case-progression fixture `queries.caseMessages` (UI Preview sample threads). */
export const UI_PREVIEW_QM_QUERY_ID = 'qm-9603-hearing';

const withParams = (template: string, id: string, extras: Record<string, string> = {}): string => {
  if (typeof template !== 'string') throw new Error('Unknown preview route');
  let path = template.replace(/:id\b/g, id).replace(/:appId\b/g, extras.appId ?? UI_PREVIEW_GA_APP_ID);
  for (const [key, value] of Object.entries(extras)) {
    if (key === 'appId') {
      continue;
    }
    path = path.replace(`:${key}`, value);
  }
  return path;
};

const ready = (title: string, path: string, notes?: string): PreviewPageLink => ({
  title,
  path,
  status: 'prerequisite',
  notes,
});

const page = (title: string, template: string, id: string, notes?: string, extras?: Record<string, string>): PreviewPageLink =>
  ready(title, withParams(template, id, extras), notes);

const def = UI_PREVIEW_FIXTURE_CLAIM_ID;
const fa = UI_PREVIEW_FULL_ADMIT_CLAIM_ID;
const pa = UI_PREVIEW_PART_ADMIT_CLAIM_ID;
const cp = UI_PREVIEW_CASE_PROGRESSION_CLAIM_ID;
const ga = UI_PREVIEW_GA_CLAIM_ID;
const som = UI_PREVIEW_SOM_CLAIM_ID;

/**
 * Catalogue of previewable journeys for `/ui-preview`.
 *
 * @remarks
 * Ready = fixture/local service stubs wired for a useful GET render of that template.
 * Partials under `not-eligible-includes/` are reached via query `reason` on the not-eligible page.
 * Omitted: document downloads, GOV.UK Pay returns, CYA/confirmation that redirect until a journey is complete,
 * URLs with no registered GET controller, and first-contact claim summary (needs a PIN session).
 */
const candidateCatalog = (): PreviewPageGroup[] => [
  {
    title: 'Public pages',
    description: 'No claim context required. Safe starting points for layout and GOV.UK styling checks.',
    pages: [
      ready('Home', urls.HOME_URL),
      ready('Privacy policy', urls.PRIVACY_POLICY_URL),
      ready('Cookies', urls.COOKIES_URL),
      ready('Accessibility statement', urls.ACCESSIBILITY_STATEMENT_URL),
      ready('Terms and conditions', urls.TERMS_AND_CONDITIONS_URL),
      ready('Contact us', urls.CONTACT_US_URL),
      ready('Contact Civil National Business Centre (CNBC)', urls.CONTACT_CNBC_URL),
      ready('Contact mediation', urls.CONTACT_MEDIATION_URL),
      ready('Make a claim (start)', urls.MAKE_CLAIM),
      ready('Unauthorised', urls.UNAUTHORISED_URL),
    ],
  },
  {
    title: 'Eligibility',
    description: 'Claim eligibility flow (cookie-based; no civil-service required for early screens).',
    pages: [
      ready('Known claim amount', urls.ELIGIBILITY_KNOWN_CLAIM_AMOUNT_URL),
      ready('Claim value', urls.ELIGIBILITY_CLAIM_VALUE_URL),
      ready('Single defendant', urls.ELIGIBILITY_SINGLE_DEFENDANT_URL),
      ready('Over 18', urls.ELIGIBILITY_CLAIMANT_AGE_URL),
      ready('Claimant address', urls.ELIGIBILITY_CLAIMANT_ADDRESS_URL),
      ready('Defendant address', urls.ELIGIBILITY_DEFENDANT_ADDRESS_URL),
      ready('Claim type', urls.ELIGIBILITY_CLAIM_TYPE_URL),
      ready('Claim against government', urls.ELIGIBILITY_GOVERNMENT_DEPARTMENT_URL),
      ready('Tenancy deposit', urls.ELIGIBILITY_TENANCY_DEPOSIT_URL),
      ready('Defendant age', urls.ELIGIBILITY_DEFENDANT_AGE_URL),
      ready('Help with fees', urls.ELIGIBILITY_HELP_WITH_FEES_URL),
      ready('Help with fees reference', urls.ELIGIBILITY_HELP_WITH_FEES_REFERENCE_URL),
      ready('Apply for help with fees', urls.ELIGIBILITY_APPLY_HELP_WITH_FEES_URL),
      ready('Information about help with fees', urls.ELIGIBILITY_INFORMATION_ABOUT_HELP_WITH_FEES_URL),
      ready('You can use this service', urls.ELIGIBLE_FOR_THIS_SERVICE_URL),
      ready('Not eligible (default)', urls.NOT_ELIGIBLE_FOR_THIS_SERVICE_URL),
      ready('Not eligible — claim on behalf', `${urls.NOT_ELIGIBLE_FOR_THIS_SERVICE_URL}?reason=claim-on-behalf`),
      ready('Not eligible — value not known', `${urls.NOT_ELIGIBLE_FOR_THIS_SERVICE_URL}?reason=claim-value-not-known`),
      ready('Not eligible — over £25,000', `${urls.NOT_ELIGIBLE_FOR_THIS_SERVICE_URL}?reason=claim-value-over-25000`),
      ready('Not eligible — claimant under 18', `${urls.NOT_ELIGIBLE_FOR_THIS_SERVICE_URL}?reason=under-18`),
      ready('Not eligible — defendant under 18', `${urls.NOT_ELIGIBLE_FOR_THIS_SERVICE_URL}?reason=under-18-defendant`),
      ready('Not eligible — multiple claimants', `${urls.NOT_ELIGIBLE_FOR_THIS_SERVICE_URL}?reason=multiple-claimants`),
      ready('Not eligible — multiple defendants', `${urls.NOT_ELIGIBLE_FOR_THIS_SERVICE_URL}?reason=multiple-defendants`),
      ready('Not eligible — claimant address', `${urls.NOT_ELIGIBLE_FOR_THIS_SERVICE_URL}?reason=claimant-address`),
      ready('Not eligible — defendant address', `${urls.NOT_ELIGIBLE_FOR_THIS_SERVICE_URL}?reason=defendant-address`),
      ready('Not eligible — government department', `${urls.NOT_ELIGIBLE_FOR_THIS_SERVICE_URL}?reason=government-department`),
      ready('Not eligible — tenancy deposit', `${urls.NOT_ELIGIBLE_FOR_THIS_SERVICE_URL}?reason=claim-is-for-tenancy-deposit`),
    ],
  },
  {
    title: 'First contact',
    description: 'Defendant first-contact entry screens. Claim summary is omitted: it needs a PIN session.',
    pages: [
      ready('First contact start', urls.FIRST_CONTACT_SIGNPOSTING_URL),
      ready('Claim reference', urls.FIRST_CONTACT_CLAIM_REFERENCE_URL),
      ready('PIN', urls.FIRST_CONTACT_PIN_URL),
      ready('Access denied', urls.FIRST_CONTACT_ACCESS_DENIED_URL),
    ],
  },
  {
    title: 'Claim issue',
    description: 'Seeded Redis draft for fixture user someID. Task-list guard treats this as a draft claim.',
    pages: [
      ready('Create draft claim (testing support)', urls.TESTING_SUPPORT_URL, 'Uses local service stubs fees/events.'),
      ready('Claimant task list', urls.CLAIMANT_TASK_LIST_URL),
      ready('Resolving this dispute', urls.CLAIM_RESOLVING_DISPUTE_URL),
      ready('Completing your claim', urls.CLAIM_COMPLETING_CLAIM_URL),
      ready('Claimant party type', urls.CLAIMANT_PARTY_TYPE_SELECTION_URL),
      ready('Claimant individual details', urls.CLAIMANT_INDIVIDUAL_DETAILS_URL, 'Find address uses the Ordnance Survey stub.'),
      ready('Claimant company details', urls.CLAIMANT_COMPANY_DETAILS_URL),
      ready('Claimant organisation details', urls.CLAIMANT_ORGANISATION_DETAILS_URL),
      ready('Claimant sole trader details', urls.CLAIMANT_SOLE_TRADER_DETAILS_URL),
      ready('Claimant date of birth', urls.CLAIMANT_DOB_URL),
      ready('Claimant phone', urls.CLAIMANT_PHONE_NUMBER_URL),
      ready('Defendant party type', urls.CLAIM_DEFENDANT_PARTY_TYPE_URL),
      ready('Defendant individual details', urls.CLAIM_DEFENDANT_INDIVIDUAL_DETAILS_URL),
      ready('Defendant company details', urls.CLAIM_DEFENDANT_COMPANY_DETAILS_URL),
      ready('Defendant organisation details', urls.CLAIM_DEFENDANT_ORGANISATION_DETAILS_URL),
      ready('Defendant sole trader details', urls.CLAIM_DEFENDANT_SOLE_TRADER_DETAILS_URL),
      ready('Defendant email', urls.CLAIM_DEFENDANT_EMAIL_URL),
      ready('Defendant mobile', urls.CLAIM_DEFENDANT_PHONE_NUMBER_URL),
      ready('Claim amount', urls.CLAIM_AMOUNT_URL),
      ready('Delayed flight', urls.DELAYED_FLIGHT_URL),
      ready('Flight details', urls.FLIGHT_DETAILS_URL),
      ready('Claim interest', urls.CLAIM_INTEREST_URL),
      ready('Interest type', urls.CLAIM_INTEREST_TYPE_URL),
      ready('Interest rate', urls.CLAIM_INTEREST_RATE_URL),
      ready('Interest total', urls.CLAIM_INTEREST_TOTAL_URL),
      ready('Interest date', urls.CLAIM_INTEREST_DATE_URL),
      ready('Interest start date', urls.CLAIM_INTEREST_START_DATE_URL),
      ready('Interest end date', urls.CLAIM_INTEREST_END_DATE_URL),
      ready('Continue claiming interest', urls.CLAIM_INTEREST_CONTINUE_CLAIMING_URL),
      ready('How much interest', urls.CLAIM_INTEREST_HOW_MUCH_URL),
      ready('Claim details (reason)', urls.CLAIM_REASON_URL),
      ready('Timeline', urls.CLAIM_TIMELINE_URL),
      ready('Evidence', urls.CLAIM_EVIDENCE_URL),
      ready('Help with fees (claim)', urls.CLAIM_HELP_WITH_FEES_URL),
      ready('Bilingual language preference', urls.CLAIM_BILINGUAL_LANGUAGE_PREFERENCE_URL),
      ready('Incomplete submission', urls.CLAIM_INCOMPLETE_SUBMISSION_URL),
    ],
  },
  {
    title: 'Dashboard & response (awaiting defendant)',
    description: `Fixture claim ${def} (user ${UI_PREVIEW_FIXTURE_USER_ID}) — AWAITING_RESPONDENT_ACKNOWLEDGEMENT, defendant role. Directions questionnaire data is seeded on the Redis draft.`,
    pages: [
      ready('Dashboard (case list)', urls.DASHBOARD_URL),
      page('Defendant claim summary (redesign)', urls.DEFENDANT_SUMMARY_URL, def),
      page('Claimant dashboard (redesign)', urls.DASHBOARD_CLAIMANT_URL, def, 'govukTaskList when dashboard tasks are stubbed.'),
      page('Breathing space information', urls.BREATHING_SPACE_INFO_URL, def),
      page('Contact them', urls.CITIZEN_CONTACT_THEM_URL, def),
      page('View claimant info', urls.VIEW_CLAIMANT_INFO, def),
      page('View defendant info', urls.VIEW_DEFENDANT_INFO, def),
      page('Response task list', urls.RESPONSE_TASK_LIST_URL, def),
      page('Claim details (response)', urls.CLAIM_DETAILS_URL, def),
      page('Your details', urls.CITIZEN_DETAILS_URL, def),
      page('Your date of birth', urls.DOB_URL, def),
      page('Your phone', urls.CITIZEN_PHONE_NUMBER_URL, def),
      page('Response type', urls.CITIZEN_RESPONSE_TYPE_URL, def),
      page('Bilingual language preference (response)', urls.BILINGUAL_LANGUAGE_PREFERENCE_URL, def),
      page('Timeline (response)', urls.CITIZEN_TIMELINE_URL, def),
      page('Evidence (response)', urls.CITIZEN_EVIDENCE_URL, def),
      page('Your defence', urls.RESPONSE_YOUR_DEFENCE_URL, def),
      page('Reject all of claim', urls.CITIZEN_REJECT_ALL_CLAIM_URL, def),
      page('Full rejection — how much paid', urls.CITIZEN_FR_AMOUNT_YOU_PAID_URL, def),
      page('Full rejection — why you disagree', urls.CITIZEN_WHY_DO_YOU_DISAGREE_FULL_REJECTION_URL, def),
      page('Full rejection — paid less', urls.CITIZEN_FULL_REJECTION_YOU_PAID_LESS_URL, def),
      page('Under 18 eligibility', urls.AGE_ELIGIBILITY_URL, def),
      page('Send response by email', urls.SEND_RESPONSE_BY_EMAIL_URL, def),
      page('Incomplete submission (response)', urls.RESPONSE_INCOMPLETE_SUBMISSION_URL, def),
    ],
  },
  {
    title: 'Statement of means & part admission',
    description: `Fixture claim ${som} — defendant PART_ADMISSION by instalments so the statement-of-means guard allows the journey.`,
    pages: [
      page('Response task list (SoM claim)', urls.RESPONSE_TASK_LIST_URL, som),
      page('Already paid', urls.CITIZEN_ALREADY_PAID_URL, som),
      page('How much do you owe', urls.CITIZEN_OWED_AMOUNT_URL, som, 'Seeded £400 of £1,000. local service stubs CCD has specDefenceAdmittedRequired: No.'),
      page('How much have you paid', urls.CITIZEN_AMOUNT_YOU_PAID_URL, som, 'alreadyPaid is no — empty form is honest (not a fake paid amount).'),
      page('Why do you disagree (part admit)', urls.CITIZEN_WHY_DO_YOU_DISAGREE_URL, som),
      page('Part admit payment option', urls.CITIZEN_PARTIAL_ADMISSION_PAYMENT_OPTION_URL, som),
      page('Part admit payment date', urls.CITIZEN_PA_PAYMENT_DATE_URL, som),
      page('Part admit payment plan', urls.CITIZEN_REPAYMENT_PLAN_PARTIAL_URL, som),
      page('Full admission payment option', urls.CITIZEN_PAYMENT_OPTION_URL, som),
      page('Full admission payment date', urls.CITIZEN_PAYMENT_DATE_URL, som),
      page('Full admission payment plan', urls.CITIZEN_REPAYMENT_PLAN_FULL_URL, som),
      page('Statement of means intro', urls.FINANCIAL_DETAILS_URL, som),
      page('Disability', urls.CITIZEN_DISABILITY_URL, som),
      page('Severe disability', urls.CITIZEN_SEVERELY_DISABLED_URL, som),
      page('Residence', urls.CITIZEN_RESIDENCE_URL, som),
      page('Partner', urls.CITIZEN_PARTNER_URL, som),
      page('Partner age', urls.CITIZEN_PARTNER_AGE_URL, som),
      page('Partner pension', urls.CITIZEN_PARTNER_PENSION_URL, som),
      page('Partner disability', urls.CITIZEN_PARTNER_DISABILITY_URL, som),
      page('Partner severe disability', urls.CITIZEN_PARTNER_SEVERE_DISABILITY_URL, som),
      page('Dependants', urls.CITIZEN_DEPENDANTS_URL, som),
      page('Dependants education', urls.CITIZEN_DEPENDANTS_EDUCATION_URL, som),
      page('Children disability', urls.CHILDREN_DISABILITY_URL, som),
      page('Other dependants', urls.CITIZEN_OTHER_DEPENDANTS_URL, som),
      page('Carer', urls.CITIZEN_CARER_URL, som),
      page('Employment', urls.CITIZEN_EMPLOYMENT_URL, som),
      page('Who employs you', urls.CITIZEN_WHO_EMPLOYS_YOU_URL, som),
      page('Unemployment', urls.CITIZEN_UNEMPLOYED_URL, som),
      page('Self-employment', urls.CITIZEN_SELF_EMPLOYED_URL, som),
      page('On tax payments', urls.ON_TAX_PAYMENTS_URL, som),
      page('Bank accounts', urls.CITIZEN_BANK_ACCOUNT_URL, som),
      page('Court orders', urls.CITIZEN_COURT_ORDERS_URL, som),
      page('Priority debts', urls.CITIZEN_PRIORITY_DEBTS_URL, som),
      page('Debts', urls.CITIZEN_DEBTS_URL, som),
      page('Monthly expenses', urls.CITIZEN_MONTHLY_EXPENSES_URL, som),
      page('Monthly income', urls.CITIZEN_MONTHLY_INCOME_URL, som),
      page('Explanation', urls.CITIZEN_EXPLANATION_URL, som),
    ],
  },
  {
    title: 'Mediation',
    description: `Telephone mediation and document-upload screens on fixture ${def}.`,
    pages: [
      page('Free telephone mediation', urls.CITIZEN_FREE_TELEPHONE_MEDIATION_URL, def),
      page('Telephone mediation', urls.TELEPHONE_MEDIATION_URL, def),
      page('Mediation disagreement', urls.MEDIATION_DISAGREEMENT_URL, def),
      page('I do not want free mediation', urls.DONT_WANT_FREE_MEDIATION_URL, def),
      page('Can we use this number', urls.CAN_WE_USE_URL, def),
      page('Can we use (company)', urls.CAN_WE_USE_COMPANY_URL, def),
      page('Mediation contact person', urls.MEDIATION_CONTACT_PERSON_CONFIRMATION_URL, def),
      page('Alternative contact person', urls.MEDIATION_ALTERNATIVE_CONTACT_PERSON_URL, def),
      page('Alternative email', urls.MEDIATION_ALTERNATIVE_EMAIL_URL, def),
      page('Alternative phone', urls.MEDIATION_ALTERNATIVE_PHONE_URL, def),
      page('Claimant phone (mediation)', urls.MEDIATION_CLAIMANT_PHONE_URL, def),
      page('Next three months', urls.MEDIATION_NEXT_3_MONTHS_URL, def),
      page('Email confirmation', urls.MEDIATION_EMAIL_CONFIRMATION_URL, def),
      page('Phone confirmation', urls.MEDIATION_PHONE_CONFIRMATION_URL, def),
      page('Unavailable dates', urls.MEDIATION_UNAVAILABLE_SELECT_DATES_URL, def),
      page('Start upload documents', urls.START_MEDIATION_UPLOAD_FILES, def),
      page('Type of documents', urls.MEDIATION_TYPE_OF_DOCUMENTS, def),
      page('Upload documents', urls.MEDIATION_UPLOAD_DOCUMENTS, def),
      page('Upload check and send', urls.MEDIATION_UPLOAD_DOCUMENTS_CHECK_AND_SEND, def),
      page('Upload confirmation', urls.MEDIATION_UPLOAD_DOCUMENTS_CONFIRMATION, def),
      page('Cancel document upload', urls.MEDIATION_UPLOAD_DOCUMENTS_CANCEL, def),
      page('View mediation documents', urls.VIEW_MEDIATION_DOCUMENTS, def),
      page('View mediation settlement agreement', urls.VIEW_MEDIATION_SETTLEMENT_AGREEMENT_DOCUMENT, def, 'Seeded mediationAgreement document on local service stubs; mapper returns an empty table when CCD omits the file.'),
    ],
  },
  {
    title: 'Directions questionnaire',
    description: `Hearing, experts, and witnesses on fixture ${def} (Redis draft already includes DQ experts and unavailable dates).`,
    pages: [
      page('Tried to settle', urls.DQ_TRIED_TO_SETTLE_CLAIM_URL, def),
      page('Request extra 4 weeks', urls.DQ_REQUEST_EXTRA_4WEEKS_URL, def),
      page('Consider claimant documents', urls.DQ_CONSIDER_CLAIMANT_DOCUMENTS_URL, def),
      page('Give evidence yourself', urls.DQ_GIVE_EVIDENCE_YOURSELF_URL, def),
      page('Other witnesses', urls.DQ_DEFENDANT_WITNESSES_URL, def),
      page('Expert (small claims)', urls.DQ_EXPERT_SMALL_CLAIMS_URL, def),
      page('Expert guidance', urls.EXPERT_GUIDANCE_URL, def),
      page('Permission for expert', urls.PERMISSION_FOR_EXPERT_URL, def),
      page('Expert evidence', urls.DQ_DEFENDANT_EXPERT_EVIDENCE_URL, def),
      page('Expert details', urls.DQ_EXPERT_DETAILS_URL, def),
      page('Expert report details', urls.DQ_EXPERT_REPORT_DETAILS_URL, def),
      page('Shared expert', urls.DQ_SHARE_AN_EXPERT_URL, def),
      page('Expert can still examine', urls.DQ_EXPERT_CAN_STILL_EXAMINE_URL, def),
      page('Sent expert reports', urls.DQ_SENT_EXPERT_REPORTS_URL, def),
      page('Support required', urls.SUPPORT_REQUIRED_URL, def),
      page('Vulnerability', urls.VULNERABILITY_URL, def),
      page('Welsh language', urls.DQ_WELSH_LANGUAGE_URL, def),
      page('Determination without hearing', urls.DETERMINATION_WITHOUT_HEARING_URL, def),
      page('Phone or video hearing', urls.DQ_PHONE_OR_VIDEO_HEARING_URL, def),
      page('Cannot attend in next 12 months', urls.DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL, def),
      page('Unavailable for hearing', urls.DQ_UNAVAILABLE_FOR_HEARING_URL, def),
      page('Availability dates', urls.DQ_AVAILABILITY_DATES_FOR_HEARING_URL, def),
      page('Court location', urls.DQ_COURT_LOCATION_URL, def, 'Uses local service stubs court locations.'),
      page('Confirm your details', urls.DQ_CONFIRM_YOUR_DETAILS_URL, def),
      page('Subject to fixed recoverable costs', urls.SUBJECT_TO_FRC_URL, def),
      page('FRC band agreed', urls.FRC_BAND_AGREED_URL, def),
      page('Assign complexity band', urls.ASSIGN_FRC_BAND_URL, def),
      page('Reason for complexity band', urls.REASON_FOR_FRC_BAND_URL, def),
      page('Why not subject to FRC', urls.WHY_NOT_SUBJECT_TO_FRC_URL, def),
      page('Disclosure of documents', urls.DQ_DISCLOSURE_OF_DOCUMENTS_URL, def),
      page('Non-electronic documents', urls.DQ_MULTITRACK_DISCLOSURE_NON_ELECTRONIC_DOCUMENTS_URL, def),
      page('Electronic documents issues', urls.DQ_MULTITRACK_DISCLOSURE_OF_ELECTRONIC_DOCUMENTS_ISSUES_URL, def),
      page('Documents to be considered', urls.DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_URL, def),
      page('Documents to be considered details', urls.DQ_MULTITRACK_CLAIMANT_DOCUMENTS_TO_BE_CONSIDERED_DETAILS_URL, def),
      page('Agreement reached', urls.DQ_MULTITRACK_AGREEMENT_REACHED_URL, def),
    ],
  },
  {
    title: 'Full admission (claimant response)',
    description: `Fixture claim ${fa} — defendant admitted the full amount and offered £100 a month; claimant role.`,
    pages: [
      page('Claimant response task list', urls.CLAIMANT_RESPONSE_TASK_LIST_URL, fa),
      page('Review defendant\'s response', urls.CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, fa),
      page('How they want to pay', urls.CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL, fa),
      page('Settle claim', urls.CLAIMANT_RESPONSE_SETTLE_CLAIM_URL, fa),
      page('Settle admitted', urls.CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL, fa),
      page('Rejection reason', urls.CLAIMANT_RESPONSE_REJECTION_REASON_URL, fa),
      page('Intention to proceed', urls.CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL, fa),
      page('Choose how to proceed', urls.CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL, fa),
      page('Sign settlement agreement', urls.CLAIMANT_SIGN_SETTLEMENT_AGREEMENT, fa),
      page('Counter offer accepted', urls.CLAIMANT_RESPONSE_REPAYMENT_PLAN_ACCEPTED_URL, fa),
      page('Court offered instalments', urls.CLAIMANT_RESPONSE_COURT_OFFERED_INSTALMENTS_URL, fa),
      page('Court offered set date', urls.CLAIMANT_RESPONSE_COURT_OFFERED_SET_DATE_URL, fa),
      page('Payment option', urls.CLAIMANT_RESPONSE_PAYMENT_OPTION_URL, fa),
      page('Payment date', urls.CLAIMANT_RESPONSE_PAYMENT_DATE_URL, fa),
      page('Payment plan', urls.CLAIMANT_RESPONSE_PAYMENT_PLAN_URL, fa),
      page('Incomplete submission', urls.CLAIMANT_RESPONSE_INCOMPLETE_SUBMISSION_URL, fa),
      page('Confirmation', urls.CLAIMANT_RESPONSE_CONFIRMATION_URL, fa, 'Signed settlement agreement; Contact-us details open by default.'),
      page('CCJ paid amount', urls.CCJ_PAID_AMOUNT_URL, fa),
      page('CCJ paid amount summary', urls.CCJ_PAID_AMOUNT_SUMMARY_URL, fa),
      page('CCJ defendant date of birth', urls.CCJ_DEFENDANT_DOB_URL, fa),
      page('CCJ payment options', urls.CCJ_PAYMENT_OPTIONS_URL, fa),
      page('CCJ repayment plan', urls.CCJ_REPAYMENT_PLAN_INSTALMENTS_URL, fa),
      page('CCJ pay by set date', urls.CCJ_DEFENDANT_PAYMENT_DATE_URL, fa),
      page('CCJ check and send', urls.CCJ_CHECK_AND_SEND_URL, fa),
      page('CCJ repayment plan summary (claimant)', urls.CCJ_REPAYMENT_PLAN_CLAIMANT_URL, fa),
      page('Date paid in full', urls.DATE_PAID_URL, fa),
      page('Date paid confirmation', urls.DATE_PAID_CONFIRMATION_URL, fa),
    ],
  },
  {
    title: 'Part admission (claimant response)',
    description: `Fixture claim ${pa} — defendant admits £400 of £1,000, not already paid, £100 a month; claimant role.`,
    pages: [
      page('Claimant response task list', urls.CLAIMANT_RESPONSE_TASK_LIST_URL, pa),
      page('Review defendant\'s response', urls.CLAIMANT_RESPONSE_REVIEW_DEFENDANTS_RESPONSE_URL, pa),
      page('How they want to pay', urls.CLAIMANT_RESPONSE_ACCEPT_REPAYMENT_PLAN_URL, pa),
      page('Part payment received', urls.CLAIMANT_RESPONSE_PART_PAYMENT_RECEIVED_URL, pa),
      page('Settle admitted', urls.CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL, pa),
      page('Intention to proceed', urls.CLAIMANT_RESPONSE_INTENTION_TO_PROCEED_URL, pa),
      page('Choose how to proceed', urls.CLAIMANT_RESPONSE_CHOOSE_HOW_TO_PROCEED_URL, pa),
    ],
  },
  {
    title: 'Case progression',
    description: `Fixture claim ${cp} — CASE_PROGRESSION, claimant, FAST_CLAIM so trial-arrangement screens are not redirected.`,
    pages: [
      page('Claimant dashboard (redesign)', urls.DASHBOARD_CLAIMANT_URL, cp),
      page('Upload your documents', urls.UPLOAD_YOUR_DOCUMENTS_URL, cp),
      page('Type of documents', urls.TYPES_OF_DOCUMENTS_URL, cp),
      page('Upload documents', urls.CP_UPLOAD_DOCUMENTS_URL, cp),
      page('Cancel document upload', urls.CP_EVIDENCE_UPLOAD_CANCEL, cp),
      page('Check and send (evidence)', urls.CP_CHECK_ANSWERS_URL, cp),
      page('Documents uploaded', urls.CP_EVIDENCE_UPLOAD_SUBMISSION_URL, cp),
      page('Evidence upload documents', urls.EVIDENCE_UPLOAD_DOCUMENTS_URL, cp),
      page('Finalise trial arrangements', urls.CP_FINALISE_TRIAL_ARRANGEMENTS_URL, cp),
      page('Is the case ready', urls.IS_CASE_READY_URL, cp),
      page('Has anything changed', urls.HAS_ANYTHING_CHANGED_URL, cp),
      page('Hearing duration', urls.TRIAL_ARRANGEMENTS_HEARING_DURATION, cp),
      page('Trial arrangements check answers', urls.TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS, cp),
      page('Trial arrangements confirmation', urls.CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL, cp),
      page('Pay hearing fee', urls.PAY_HEARING_FEE_URL, cp),
      page('Apply help fee selection', urls.HEARING_FEE_APPLY_HELP_FEE_SELECTION, cp),
      page('Help with fees start', urls.APPLY_HELP_WITH_FEES_START, cp),
      page('Help with fees reference', urls.APPLY_HELP_WITH_FEES_REFERENCE, cp),
      page('Hearing fee confirmation', urls.HEARING_FEE_CONFIRMATION_URL, cp),
      page('Hearing fee unsuccessful', urls.PAY_HEARING_FEE_UNSUCCESSFUL_URL, cp),
      page('Request for reconsideration', urls.REQUEST_FOR_RECONSIDERATION_URL, cp),
      page('Request for reconsideration confirmation', urls.REQUEST_FOR_RECONSIDERATION_CONFIRMATION_URL, cp),
      page('Comments for reconsideration', urls.REQUEST_FOR_RECONSIDERATION_COMMENTS_URL, cp),
      page('Comments confirmation', urls.REQUEST_FOR_RECONSIDERATION_COMMENTS_CONFIRMATION_URL, cp),
      page('Bundles', urls.BUNDLES_URL, cp),
      page('View the hearing', urls.VIEW_THE_HEARING_URL, cp),
      page('View the judgment', urls.VIEW_THE_JUDGMENT_URL, cp),
      page('View orders and notices', urls.VIEW_ORDERS_AND_NOTICES_URL, cp),
      page('View response to claim', urls.VIEW_RESPONSE_TO_CLAIM, cp),
    ],
  },
  {
    title: 'General application',
    description: `Fixture claim ${ga} — defendant role with seeded general application ${UI_PREVIEW_GA_APP_ID}.`,
    pages: [
      page('Application type', urls.APPLICATION_TYPE_URL, ga),
      page('Agreement from other party', urls.GA_AGREEMENT_FROM_OTHER_PARTY_URL, ga),
      page('Inform other parties', urls.INFORM_OTHER_PARTIES_URL, ga),
      page('Claim application cost', urls.GA_CLAIM_APPLICATION_COST_URL, ga),
      page('Application costs', urls.GA_APPLICATION_COSTS_URL, ga),
      page('Paying for application', urls.PAYING_FOR_APPLICATION_URL, ga),
      page('Order judge', urls.ORDER_JUDGE_URL, ga),
      page('Requesting reason', urls.GA_REQUESTING_REASON_URL, ga),
      page('Add another application', urls.GA_ADD_ANOTHER_APPLICATION_URL, ga),
      page('Hearing arrangements guidance', urls.GA_HEARING_ARRANGEMENTS_GUIDANCE_URL, ga),
      page('Hearing arrangement', urls.GA_HEARING_ARRANGEMENT_URL, ga, 'Uses local service stubs court locations.'),
      page('Hearing contact details', urls.GA_HEARING_CONTACT_DETAILS_URL, ga),
      page('Hearing support', urls.GA_HEARING_SUPPORT_URL, ga),
      page('Unavailable dates', urls.GA_UNAVAILABLE_HEARING_DATES_URL, ga),
      page('Unavailability confirmation', urls.GA_UNAVAILABILITY_CONFIRMATION_URL, ga),
      page('Want to upload documents', urls.GA_WANT_TO_UPLOAD_DOCUMENTS_URL, ga),
      page('Upload documents', urls.GA_UPLOAD_DOCUMENTS_URL, ga),
      page('Check and send', urls.GA_CHECK_ANSWERS_URL, ga),
      page('Application summary', urls.GA_APPLICATION_SUMMARY_URL, ga),
      page('Application submitted', urls.GA_APPLICATION_SUBMITTED_URL, ga),
      page('Submit confirmation', urls.GENERAL_APPLICATION_CONFIRM_URL, ga),
      page('Submit application offline', urls.GA_SUBMIT_OFFLINE, ga),
      page('View application', urls.GA_VIEW_APPLICATION_URL, ga),
      page('Payment successful', urls.GA_PAYMENT_SUCCESSFUL_URL, ga),
      page('Payment unsuccessful', urls.GA_PAYMENT_UNSUCCESSFUL_URL, ga),
      page('Apply help fee selection', urls.GA_APPLY_HELP_WITH_FEE_SELECTION, ga),
      page('Help with fees start', urls.GA_APPLY_HELP_WITH_FEES_START, ga),
      page('Help with fees reference', urls.GA_APPLY_HELP_WITH_FEE_REFERENCE, ga),
      page('Application fee confirmation', urls.GA_APPLICATION_FEE_CONFIRMATION_URL, ga),
      page('Respondent information', urls.GA_RESPONDENT_INFORMATION_URL, ga),
      page('Respondent agreement', urls.GA_RESPONDENT_AGREEMENT_URL, ga),
      page('Agree to order', urls.GA_AGREE_TO_ORDER_URL, ga),
      page('Accept defendant offer', urls.GA_ACCEPT_DEFENDANT_OFFER_URL, ga),
      page('Respondent hearing preference', urls.GA_RESPONDENT_HEARING_PREFERENCE_URL, ga),
      page('Respondent want to upload', urls.GA_RESPONDENT_WANT_TO_UPLOAD_DOCUMENT_URL, ga),
      page('Respondent upload documents', urls.GA_RESPONDENT_UPLOAD_DOCUMENT_URL, ga),
      page('Response hearing arrangement', urls.GA_RESPONSE_HEARING_ARRANGEMENT_URL, ga),
      page('Response hearing contact', urls.GA_RESPONSE_HEARING_CONTACT_DETAILS_URL, ga),
      page('Response hearing support', urls.GA_RESPONSE_HEARING_SUPPORT_URL, ga),
      page('Response unavailable dates', urls.GA_RESPONSE_UNAVAILABLE_HEARING_DATES_URL, ga),
      page('Response unavailability confirmation', urls.GA_UNAVAILABILITY_RESPONSE_CONFIRMATION_URL, ga),
      page('Response confirmation', urls.GA_RESPONSE_CONFIRMATION_URL, ga),
      page('Response application summary', urls.GA_APPLICATION_RESPONSE_SUMMARY_URL, ga),
      page('COSC debt payment evidence', urls.GA_DEBT_PAYMENT_EVIDENCE_COSC_URL, ga),
      page('COSC ask proof of debt guidance', urls.GA_ASK_PROOF_OF_DEBT_PAYMENT_GUIDANCE_URL, ga),
      page('COSC final payment date', urls.COSC_FINAL_PAYMENT_DATE_URL, ga),
      page('COSC upload documents', urls.GA_UPLOAD_DOCUMENTS_COSC_URL, ga),
      page('COSC check your answers', urls.GA_CHECK_YOUR_ANSWERS_COSC_URL, ga),
      page('COSC confirmation', urls.GA_COSC_CONFIRM_URL, ga),
    ],
  },
  {
    title: 'Query management, settlement, judgment',
    description: `Query screens on ${cp} (sample court-message threads on the case). Settlement on the full-admit claimant claim. Query management is not LaunchDarkly-gated on these GETs.`,
    pages: [
      page('Query management start', urls.QM_START_URL, cp),
      page('View queries', urls.QM_VIEW_QUERY_URL, cp),
      page('Query details', urls.QM_QUERY_DETAILS_URL, cp, undefined, {queryId: UI_PREVIEW_QM_QUERY_ID}),
      page('Share query', urls.QM_SHARE_QUERY_CONFIRMATION, cp),
      page('Query confirmation', urls.QM_CONFIRMATION_URL, cp),
      page('Defendant sign settlement', urls.DEFENDANT_SIGN_SETTLEMENT_AGREEMENT, fa),
      page('Confirm you have been paid', urls.CONFIRM_YOU_HAVE_BEEN_PAID_URL, fa),
      page('Confirm paid confirmation', urls.CONFIRM_YOU_HAVE_BEEN_PAID_CONFIRMATION_URL, fa),
    ],
  },
];

// Verified against current real controllers. Non-ready entries remain discoverable
// with their prerequisite, and are excluded from automatic read-only sweeps.
const verification: Record<string, {view?: string; reason?: string; action?: boolean}> = require('./pageCatalogVerification.json');
export const getUiPreviewPageCatalog = (): PreviewPageGroup[] => candidateCatalog().map(group => ({
  ...group,
  pages: group.pages.map(entry => {
    if (!entry.path.startsWith('/') || entry.path.startsWith('//') || /[:{}<>\\]/.test(entry.path)) {
      throw new Error(`Invalid preview route: ${entry.path}`);
    }
    const checked = verification[entry.path];
    return {...entry, status: checked?.action ? 'action' : checked?.view ? 'ready' : 'prerequisite',
      notes: checked?.reason || entry.notes || (checked?.view ? undefined : 'Requires prior journey answers or an unsupported service response.')};
  }),
}));
