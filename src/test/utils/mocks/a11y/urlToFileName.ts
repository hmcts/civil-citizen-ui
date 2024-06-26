
function translateUrlToFilename (url: string) {
  return 'mock'+url
    .replace(/:id/g,'1645882162449409')
    .replace(/:documentId/g,'2')
    .replace(/:uniqueId/g,'3')
    .replace(/:tab/g,'4')
    .replace(/\//g, '-');
}

export function translateUrlToFilePath (url: string) {
  return './src/test/utils/mocks/a11y/'+translateUrlToFilename(url)+'.html';
}
