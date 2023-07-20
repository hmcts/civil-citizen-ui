import {t} from 'i18next';
import {DashboardDefendantItem} from 'common/models/dashboard/dashboardItem';
import {DASHBOARD_URL} from 'routes/urls';

const CASE_PER_PAGE = 10;
const DEFAULT_PAGE_NUMBER = 1;

export function buildPaginationData(claims: DashboardDefendantItem[], currentPageAsString: string, lang: string) {
  const currentPage = Number(currentPageAsString) ? Number(currentPageAsString) : DEFAULT_PAGE_NUMBER;
  const totalPages = claims?.length ? Math.ceil(claims.length / CASE_PER_PAGE) : undefined;
  const paginationArguments = totalPages > 1 ? buildPaginationListArgs(totalPages, currentPage, lang) : undefined;
  const paginatedClaims = totalPages > 1 ? getPaginatedClaims(claims, currentPage) : claims;
  return {
    paginationArguments,
    paginatedClaims,
  };
}

function getPaginatedClaims(claims: DashboardDefendantItem[], currentPage: number): DashboardDefendantItem[] {
  return claims.slice((currentPage - 1) * CASE_PER_PAGE, currentPage * CASE_PER_PAGE);
}

function buildPaginationListArgs(totalPages: number, currentPage: number, lang: string) {
  const items = [];
  for (let i = 1; i <= totalPages; i++) {
    items.push({
      number: i,
      current: currentPage === i,
      href: `${DASHBOARD_URL}?lang=${lang}&page=${i}`,
    });
  }
  return {
    previous: currentPage > 1 ? {
      text: t('PAGES.DASHBOARD.PREVIOUS', {lng: lang}),
      href: `/dashboard?lang=${lang}&page=${currentPage - 1}`,
    } : undefined,
    next: currentPage < totalPages ? {
      text: t('PAGES.DASHBOARD.NEXT', {lng: lang}),
      href: `${DASHBOARD_URL}?lang=${lang}&page=${currentPage + 1}`,
    } : undefined,
    items,
  };
}
