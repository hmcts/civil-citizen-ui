//https://developer.mozilla.org/en-US/docs/Web/API/XPathResult
const ORDERED_NODE_SNAPSHOT_TYPE = 7;

function getElementsByXPath(xpath: string, htmlDocument: Document): Node[] {
  const results: Node[] = [];
  const query: XPathResult = htmlDocument.evaluate(xpath, htmlDocument,
    null, ORDERED_NODE_SNAPSHOT_TYPE, null);
  for (let i = 0, length = query.snapshotLength; i < length; ++i) {
    results.push(query.snapshotItem(i));
  }
  return results;
}

export {
  getElementsByXPath,
};
