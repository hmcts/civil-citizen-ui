import {t} from 'i18next';
import {getLng} from '../languageToggleUtils';

export const changeLabel = (lang: string ): string => t('COMMON.BUTTONS.CHANGE', {lng: getLng(lang)});
