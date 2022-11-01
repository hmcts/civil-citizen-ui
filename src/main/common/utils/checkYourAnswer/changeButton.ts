import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';

export const changeLabel = (lang: string | unknown): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});
