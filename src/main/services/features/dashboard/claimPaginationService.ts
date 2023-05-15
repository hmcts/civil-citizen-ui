import {t} from 'i18next';
import {DashboardDefendantItem} from 'common/models/dashboard/dashboardItem';
import {DASHBOARD_URL} from 'routes/urls';

const DEFAULT_PAGE_NUMBER = 1;

export function buildPaginationData(claims: DashboardDefendantItem[], currentPageAsString: string, casePerPage: number, lang: string) {
  const currentPage = Number(currentPageAsString) ? Number(currentPageAsString) : DEFAULT_PAGE_NUMBER;
  const totalPages = claims?.length ? Math.ceil(claims.length / casePerPage) : undefined;
  const paginationArguments: object = totalPages > 1 ? buildPaginationListArgs(totalPages, currentPage, lang) : undefined;
  const paginatedClaims = totalPages > 1 ? getPaginatedClaims(claims, currentPage, casePerPage) : claims;
  return {
    paginationArguments,
    paginatedClaims,
  };
}

function getPaginatedClaims(claims: DashboardDefendantItem[], currentPage: number, casePerPage: number): DashboardDefendantItem[] {
  return claims.slice((currentPage - 1) * casePerPage, currentPage * casePerPage)
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