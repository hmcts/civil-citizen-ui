export class SummaryList {
  classes?: string;
  rows: Row[];
}

class Row {
  key: Key;
  value: Value;
  actions?: Actions;
}

type Key = { text: string } | { html: string }

type Value = { text: string } | { html: string }

type Actions = {
  classes?: string;
  items: Item[];
}

type Item = {
  href: string;
  visuallyHiddenText?: string;
} & ({ text: string } | { html: string })
