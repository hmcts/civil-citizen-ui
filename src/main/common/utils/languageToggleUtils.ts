const getLng = (lang: string | unknown): string => {
  return lang ? String(lang) : 'en';
};

export {
  getLng,
};
