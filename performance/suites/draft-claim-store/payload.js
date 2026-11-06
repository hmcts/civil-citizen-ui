const repeat = (items, count, relabel) => Array.from({length: count}, (_, index) => relabel(JSON.parse(JSON.stringify(items[index % items.length])), index));

export const buildPayload = (base, size) => {
  const payload = JSON.parse(JSON.stringify(base));
  if (size !== 'large') {
    return payload;
  }
  const details = payload.claimDetails || {};
  if (details.timeline && details.timeline.rows && details.timeline.rows.length) {
    details.timeline.rows = repeat(details.timeline.rows, 60, (row, index) => Object.assign(row, {description: `${row.description || 'Event'} ${index + 1} `.repeat(4).trim()}));
  }
  if (details.evidence && details.evidence.evidenceItem && details.evidence.evidenceItem.length) {
    details.evidence.evidenceItem = repeat(details.evidence.evidenceItem, 30, (item, index) => Object.assign(item, {description: `Evidence item ${index + 1} `.repeat(6).trim()}));
  }
  if (Array.isArray(payload.claimAmountBreakup) && payload.claimAmountBreakup.length) {
    payload.claimAmountBreakup = repeat(payload.claimAmountBreakup, 25, (row, index) => {
      if (row.value) {
        row.value.claimReason = `${row.value.claimReason || 'Item'} ${index + 1}`;
      }
      return row;
    });
  }
  return payload;
};

export const withMarker = (payload, marker) => Object.assign({}, payload, {perfRunMarker: marker});
