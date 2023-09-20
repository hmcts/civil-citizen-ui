import {DashboardDefendantItem} from 'common/models/dashboard/dashboardItem';
import { buildPagination } from 'services/features/dashboard/claimPaginationService';

jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('buildPaginationData Service', () => {
  const lang = 'en';

  // claims undefined
  it('should return paginationArguments undefined when there is no claims', async () => {
    // Given
    const totalPages: number = undefined;
    const currentPageAsString: string = undefined;
    // When
    const result = buildPagination(totalPages, currentPageAsString, lang);
    // Then
    expect(result).toBeUndefined();
  });
  // claims less than 10
  it('should return pagination arguments as undefined when claims are less than case per page', async () => {
    // Given
    const totalPages = 1;
    const currentPageAsString = '2';
    // When
    const result = buildPagination(totalPages, currentPageAsString, lang);
    // Then
    expect(result).toBeUndefined();
  });
  // claims more than 10
  it('should return both pagination arguments and paginated claims when there is more than case per page', async () => {
    // Given
    const totalPages = 2;
    const currentPageAsString = '2';
    // When
    const result = buildPagination(totalPages, currentPageAsString, lang, 'claimantPage');
    // Then
    expect(result.items.length).toEqual(2);
    expect(result.items[0]).toStrictEqual({ 'current': false, 'href': '/dashboard?lang=en&claimantPage=1', 'number': 1 });
    expect(result.items[1]).toStrictEqual({ 'current': true, 'href': '/dashboard?lang=en&claimantPage=2', 'number': 2 });
    expect(result.next).toBeUndefined();
    expect(result.previous).toStrictEqual({ 'href': '/dashboard?lang=en&claimantPage=1', 'text': 'PAGES.DASHBOARD.PREVIOUS' });
  });

  // claims more than 10
  it('should return both pagination arguments and paginated claims when there is more than case per page for claimant and defendant', async () => {
    // Given
    const totalPages = 2;
    const currentPageAsString = '2';
    // When
    const result = buildPagination(totalPages, currentPageAsString, lang, 'defendantPage', 'claimantPage=1');
    // Then
    expect(result.items.length).toEqual(2);
    expect(result.items[0]).toStrictEqual({ 'current': false, 'href': '/dashboard?lang=en&defendantPage=1&claimantPage=1', 'number': 1 });
    expect(result.items[1]).toStrictEqual({ 'current': true, 'href': '/dashboard?lang=en&defendantPage=2&claimantPage=1', 'number': 2 });
    expect(result.next).toBeUndefined();
    expect(result.previous).toStrictEqual({ 'href': '/dashboard?lang=en&defendantPage=1&claimantPage=1', 'text': 'PAGES.DASHBOARD.PREVIOUS' });
  });
});

const claimsMoreThan10 = [
  {
    url: '/dashboard/:claimId/defendant',
    claimId: '1683533648644641',
    claimNumber: '000MC035',
    claimantName: 'V1',
    defendantName: 'FELIOPOLIS',
    ocmc: false,
    claimAmount: '200',
    responseDeadline: '2023-06-05',
    paymentDate: '2023-06-01',
    status: 'DEFENDANT_PART_ADMIT',
    numberOfDaysOverdue: 0,
    numberOfDays: 27,
  } as unknown as DashboardDefendantItem,
  {
    url: '/dashboard/:claimId/defendant',
    claimId: '1683534585097207',
    claimNumber: '000MC036',
    claimantName: 'GINNY Perro',
    defendantName: 'GINNY Perro',
    ocmc: false,
    claimAmount: '300',
    responseDeadline: '2023-06-05',
    paymentDate: '2023-06-01',
    status: 'DEFENDANT_PART_ADMIT',
    numberOfDaysOverdue: 0,
    numberOfDays: 27,
  } as unknown as DashboardDefendantItem,
  {
    url: '/dashboard/:claimId/defendant',
    claimId: 'string',
    claimNumber: '256MC007',
    claimantName: 'Mr Baddy Bad',
    defendantName: 'Mr Bad Guy',
    ocmc: true,
    claimAmount: '1000',
    admittedAmount: '200',
    responseDeadline: '2023-02-05',
    paymentDate: '2022-06-21',
    ccjRequestedDate: '2023-02-24',
    status: 'CLAIMANT_ACCEPTED_ADMISSION_OF_AMOUNT',
    numberOfDaysOverdue: 93,
    numberOfDays: 0,
  } as unknown as DashboardDefendantItem,
  {
    url: '/dashboard/:claimId/defendant',
    claimId: 'string',
    claimNumber: '256MC008',
    claimantName: 'Mr John Clark',
    defendantName: 'Mr Bad Guy',
    ocmc: true,
    claimAmount: '1000',
    responseDeadline: '2023-05-22',
    status: 'RESPONSE_BY_POST',
    numberOfDaysOverdue: 0,
    numberOfDays: 13,
  } as unknown as DashboardDefendantItem,
  {
    url: '/dashboard/:claimId/defendant',
    claimId: 'string',
    claimNumber: '256MC009',
    claimantName: 'Mr John Clark',
    defendantName: 'Mr Bad Guy',
    ocmc: true,
    claimAmount: '1000',
    responseDeadline: '2022-06-21',
    status: 'SETTLED',
    numberOfDaysOverdue: 322,
    numberOfDays: 0,
  } as unknown as DashboardDefendantItem,
  {
    url: '/dashboard/:claimId/defendant',
    claimId: '1683624798142336',
    claimNumber: '000MC037',
    claimantName: 'GINNY Perro',
    defendantName: 'GINNY Perro',
    ocmc: false,
    claimAmount: '500',
    responseDeadline: '2023-06-06',
    status: 'DEFENDANT_PART_ADMIT',
    numberOfDaysOverdue: 0,
    numberOfDays: 28,
  } as unknown as DashboardDefendantItem,
  {
    url: '/dashboard/:claimId/defendant',
    claimId: '1683199462265796',
    claimNumber: '000MC032',
    claimantName: 'GINNY Perro',
    defendantName: 'ORG',
    ocmc: false,
    claimAmount: '600',
    responseDeadline: '2023-06-01',
    status: 'ADMIT_PAY_INSTALLMENTS',
    numberOfDaysOverdue: 0,
    numberOfDays: 23,
  } as unknown as DashboardDefendantItem,
  {
    url: '/dashboard/:claimId/defendant',
    claimId: '1683533000908667',
    claimNumber: '000MC033',
    claimantName: 'GINNY Perro',
    defendantName: 'GINNY Perro',
    ocmc: false,
    claimAmount: '100',
    responseDeadline: '2023-06-05',
    status: 'DEFENDANT_PART_ADMIT_PAID',
    numberOfDaysOverdue: 0,
    numberOfDays: 27,
  } as unknown as DashboardDefendantItem,
  {
    url: '/dashboard/:claimId/defendant',
    claimId: '1683197127052377',
    claimNumber: '000MC029',
    claimantName: 'GINNY Perro',
    defendantName: 'GINNY Perro',
    ocmc: false,
    claimAmount: '300',
    responseDeadline: '2023-06-01',
    paymentDate: '2023-10-25',
    status: 'ADMIT_PAY_BY_SET_DATE',
    numberOfDaysOverdue: 0,
    numberOfDays: 23,
  } as unknown as DashboardDefendantItem,
  {
    url: '/dashboard/:claimId/defendant',
    claimId: '1683192679072964',
    claimNumber: '000MC027',
    claimantName: 'GINNY Perro',
    defendantName: 'GINNY Perro',
    ocmc: false,
    claimAmount: '100',
    responseDeadline: '2023-06-01',
    status: 'ADMIT_PAY_IMMEDIATELY',
    numberOfDaysOverdue: 0,
    numberOfDays: 23,
  } as unknown as DashboardDefendantItem,
  {
    url: '/dashboard/:claimId/defendant',
    claimId: '1683627421760374',
    claimNumber: '000MC038',
    claimantName: 'GINNY Perro',
    defendantName: 'Bruce Lee',
    ocmc: false,
    claimAmount: '100',
    responseDeadline: '2023-06-06',
    status: 'ADMIT_PAY_INSTALLMENTS',
    numberOfDaysOverdue: 0,
    numberOfDays: 28,
  } as unknown as DashboardDefendantItem,
  {
    url: '/dashboard/:claimId/defendant',
    claimId: '1683197662904305',
    claimNumber: '000MC030',
    claimantName: 'GINNY Perro',
    defendantName: 'Feliopolis',
    ocmc: false,
    claimAmount: '400',
    responseDeadline: '2023-06-01',
    paymentDate: '2023-10-01',
    status: 'ADMIT_PAY_BY_SET_DATE',
    numberOfDaysOverdue: 0,
    numberOfDays: 23,
  } as unknown as DashboardDefendantItem,
  {
    url: '/dashboard/:claimId/defendant',
    claimId: '1683197964174755',
    claimNumber: '000MC031',
    claimantName: 'GINNY Perro',
    defendantName: 'GINNY Perro',
    ocmc: false,
    claimAmount: '500',
    responseDeadline: '2023-06-01',
    status: 'ADMIT_PAY_INSTALLMENTS',
    numberOfDaysOverdue: 0,
    numberOfDays: 23,
  } as unknown as DashboardDefendantItem,
];

const claimsLessThan10 = [
  {
    url: '/dashboard/:claimId/defendant',
    claimId: 'string',
    claimNumber: '256MC007',
    claimantName: 'Mr Baddy Bad',
    defendantName: 'Mr Bad Guy',
    ocmc: true,
    claimAmount: '1000',
    admittedAmount: '200',
    responseDeadline: '2023-02-05',
    paymentDate: '2022-06-21',
    ccjRequestedDate: '2023-02-24',
    createdDate: '2022-06-21',
    status: 'CLAIMANT_ACCEPTED_ADMISSION_OF_AMOUNT',
    numberOfDaysOverdue: 99,
    numberOfDays: 0,
  } as unknown as DashboardDefendantItem,
  {
    url: '/dashboard/:claimId/defendant',
    claimId: 'string',
    claimNumber: '256MC008',
    claimantName: 'Mr John Clark',
    defendantName: 'Mr Bad Guy',
    ocmc: true,
    claimAmount: '1000',
    responseDeadline: '2023-05-22',
    createdDate: '2022-06-21',
    status: 'RESPONSE_BY_POST',
    numberOfDaysOverdue: 0,
    numberOfDays: 7,
  } as unknown as DashboardDefendantItem,
  {
    url: '/dashboard/:claimId/defendant',
    claimId: 'string',
    claimNumber: '256MC009',
    claimantName: 'Mr John Clark',
    defendantName: 'Mr Bad Guy',
    ocmc: true,
    claimAmount: '1000',
    responseDeadline: '2022-06-21',
    createdDate: '2022-06-21',
    status: 'SETTLED',
    numberOfDaysOverdue: 328,
    numberOfDays: 0,
  } as unknown as DashboardDefendantItem,
  {
    url: '/dashboard/:claimId/defendant',
    claimId: '1683197964174755',
    claimNumber: '000MC031',
    claimantName: 'GINNY Perro',
    defendantName: 'GINNY Perro',
    ocmc: false,
    claimAmount: '500',
    responseDeadline: '2023-06-01',
    status: 'ADMIT_PAY_INSTALLMENTS',
    numberOfDaysOverdue: 0,
    numberOfDays: 23,
  } as unknown as DashboardDefendantItem,
];

export function generateClaims(isLessThan10: boolean) {
  if (isLessThan10) {
    return claimsLessThan10;
  }
  return claimsMoreThan10;
}
