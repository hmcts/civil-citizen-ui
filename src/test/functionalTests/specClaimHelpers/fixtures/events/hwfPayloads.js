module.exports = {
  updateHWFNumber: () => {
    return {
      event: 'UPDATE_HELP_WITH_FEE_NUMBER',
      caseData: {
        'hwfFeeType': 'CLAIMISSUED',
        'helpWithFees': {
          'helpWithFee': 'Yes',
          'helpWithFeesReferenceNumber': 'HWF-123-466',
        },
        'claimIssuedHwfDetails': {
          'hwfReferenceNumber': 'HWF-345-908',
          'noRemissionDetails': null,
          'noRemissionDetailsSummary': null,
          'remissionAmount': null,
          'outstandingFeeInPounds': null,
          'hwfCaseEvent': null,
        },
      },
    };
  },

  partRemission: () => {
    return {
      event: 'PARTIAL_REMISSION_HWF_GRANTED',
      caseData: {
        'helpWithFees': {
          'helpWithFee': 'Yes',
          'helpWithFeesReferenceNumber': 'HWF-345-908',
        },
        'hwfFeeType': 'CLAIMISSUED',
        'claimIssuedHwfDetails': {
          'remissionAmount': '2300',
          'noRemissionDetails': null,
          'noRemissionDetailsSummary': null,
          'hwfReferenceNumber': null,
          'outstandingFeeInPounds': null,
          'hwfCaseEvent': 'UPDATE_HELP_WITH_FEE_NUMBER',
        },
      },
    };
  },

  fullRemission: () => {
    return {
      event: 'FULL_REMISSION_HWF',
      caseData: {
        'hwfFeeType': 'CLAIMISSUED',
        'helpWithFees': {
          'helpWithFee': 'Yes',
          'helpWithFeesReferenceNumber': 'HWF-345-908',
        },
        'claimIssuedHwfDetails': null,
      },
    };
  },

  moreInfoHWF: () => {
    return {
      event: 'MORE_INFORMATION_HWF',
      caseData: {
        'helpWithFees': {
          'helpWithFee': 'Yes',
          'helpWithFeesReferenceNumber': 'HWF-345-908',
        },
        'hwfFeeType': 'CLAIMISSUED',
        'applicant1': {
          'type': 'INDIVIDUAL',
          'flags': {
            'partyName': 'Mr Claimant person',
            'roleOnCase': 'Claimant 1',
          },
          'partyName': 'Mr Claimant person',
          'partyEmail': 'civilmoneyclaimsdemo@gmail.com',
          'primaryAddress': {
            'PostCode': 'S12eu',
            'PostTown': 'sheffield',
            'AddressLine1': '123',
            'AddressLine2': 'Fake Street',
          },
          'individualTitle': 'Mr',
          'individualLastName': 'person',
          'individualFirstName': 'Claimant',
          'individualDateOfBirth': '1993-08-28',
          'partyTypeDisplayValue': 'Individual',
        },
        'respondent1': {
          'type': 'INDIVIDUAL',
          'flags': {
            'partyName': 'mr defendant person',
            'roleOnCase': 'Defendant 1',
          },
          'partyName': 'mr defendant person',
          'partyEmail': 'civilmoneyclaimsdemo@gmail.com',
          'partyPhone': '07800000000',
          'primaryAddress': {
            'PostCode': 'L7 2PZ',
            'PostTown': 'Liverpool',
            'AddressLine1': '123',
            'AddressLine2': 'Claim Road',
          },
          'individualTitle': 'mr',
          'individualLastName': 'person',
          'individualFirstName': 'defendant',
          'partyTypeDisplayValue': 'Individual',
        },
        'helpWithFeesMoreInformationClaimIssue': {
          'hwFMoreInfoDetails': 'other income details',
          'hwFMoreInfoDocumentDate': '2025-09-09',
          'hwFMoreInfoRequiredDocuments': [
            'BANK_STATEMENTS',
            'BENEFITS_AND_TAX_CREDITS',
            'CHILD_MAINTENANCE',
            'WAGE_SLIPS',
            'PENSIONS',
            'RENTAL_INCOME',
            'INCOME_FROM_SELLING_GOODS',
            'PRISONERS_INCOME',
            'ANY_OTHER_INCOME',
          ],
        },
      },
    };
  },
};
