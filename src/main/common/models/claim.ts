export class Claim {
  legacyCaseReference: string;
  applicant1: Individual;
  totalClaimAmount: number;
  respondent1ResponseDeadline: Date;
}

class Individual {
  individualTitle: string;
  individualLastName: string;
  individualFirstName: string;
}
