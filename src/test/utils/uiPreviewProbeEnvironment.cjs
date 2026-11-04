const {isolatedEnvironment} = require('../../../bin/ui-preview.cjs');

// Set the environment before starting Node: inherited NODE_OPTIONS and ts-node
// settings can take effect before a probe has a chance to sanitise process.env.
function uiPreviewProbeEnvironment(directory, mode = 'e2eTest', enabled = 'true') {
  return {
    ...isolatedEnvironment('http://127.0.0.1:1', directory),
    NODE_ENV: mode,
    UI_PREVIEW_ENABLED: enabled,
    UI_PREVIEW_FIXTURE_NOW: '2026-10-20T12:00:00Z',
    // Jenkins may omit TMPDIR. Exercise the portable fallback in a private directory.
    TMPDIR: undefined,
    TMP: directory,
    TEMP: directory,
  };
}

module.exports = {uiPreviewProbeEnvironment};
