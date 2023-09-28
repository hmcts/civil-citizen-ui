import { t } from 'i18next';
import {DASHBOARD_URL} from 'routes/urls';

const DEFAULT_PAGE_NUMBER = 1;

export function buildPagination(totalPages: number, currentPageAsString: string, lang: string, pageName?: string, otherPages?: string) {
  const currentPage = Number(currentPageAsString) ? Number(currentPageAsString) : DEFAULT_PAGE_NUMBER;
  return totalPages > 1 ? buildPaginationListArgs(totalPages, currentPage, lang, pageName, otherPages) : undefined;
}

function buildPaginationListArgs(totalPages: number, currentPage: number, lang: string, page?: string, otherPages?: string) {
  const items = [];
  for (let i = 1; i <= totalPages; i++) {
    items.push({
      number: i,
      current: currentPage === i,
      href: otherPages ? `${DASHBOARD_URL}?lang=${lang}&${page}=${i}&${otherPages}` : `${DASHBOARD_URL}?lang=${lang}&${page}=${i}`,
    });
  }
  return {
    previous: currentPage > 1 ? {
      text: t('PAGES.DASHBOARD.PREVIOUS', {lng: lang}),
      href: otherPages ? `/dashboard?lang=${lang}&${page}=${currentPage - 1}&${otherPages}` : `/dashboard?lang=${lang}&${page}=${currentPage - 1}`,
    } : undefined,
    next: currentPage < totalPages ? {
      text: t('PAGES.DASHBOARD.NEXT', {lng: lang}),
      href: otherPages ? `${DASHBOARD_URL}?lang=${lang}&${page}=${currentPage + 1}&${otherPages}` : `${DASHBOARD_URL}?lang=${lang}&${page}=${currentPage + 1}`,
    } : undefined,
    items,
  };
}
