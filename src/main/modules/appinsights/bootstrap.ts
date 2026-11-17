/**
 * Process bootstrap: everything that has to happen before express, http, https or axios are loaded.
 *
 * App Insights SDK 3 collects requests and dependencies through OpenTelemetry, which instruments
 * those modules as they are required. Starting it afterwards leaves them unpatched, so no request
 * or dependency telemetry is produced at all. That is what happened when the SDK 2 to SDK 3 upgrade
 * shipped with `new AppInsights().enable()` still in app.ts, below that file's own imports: prod
 * recorded zero requests and zero dependencies from 5 November 2026, while exceptions kept arriving
 * because trackException is a manual call and does not depend on instrumentation.
 *
 * Nothing may be imported above this module in server.ts, and nothing that reaches express, http or
 * axios may be imported inside it. The imports below are limited to config and logging for that
 * reason, and AppInsights itself is required rather than imported so that it loads after the
 * redaction wrapper is installed.
 */
import {installPiiLoggingRedaction} from '../../common/logging/piiRedaction';
import {PropertiesVolume} from '../properties-volume';

// Wrap Logger.getLogger before any module-level logger is created, including this module's own.
installPiiLoggingRedaction();

// App Insights reads its instrumentation key from the mounted secrets, so the volume has to be
// loaded first. The chart supplies that key only through properties-volume, never as an environment
// variable, so starting App Insights ahead of this would silently disable telemetry entirely.
PropertiesVolume.enable(process.env.NODE_ENV || 'development');

// Required, not imported: an import is hoisted above installPiiLoggingRedaction() and the module
// creates a logger at module scope, which would then not be wrapped.
const {AppInsights} = require('./index');

if (new AppInsights().enable()) {
  // Azure Monitor supplies HTTP instrumentation but not Express route metadata. Register against
  // its global provider after SDK startup and before express is required by the application.
  const {registerInstrumentations} = require('@opentelemetry/instrumentation');
  const {ExpressInstrumentation} = require('@opentelemetry/instrumentation-express');
  // The scoped Express patch keeps route tracking and next() cleanup while avoiding SDK spans
  // for the hundreds of controller routers mounted at '/'. Those would become Azure dependencies.
  registerInstrumentations({instrumentations: [new ExpressInstrumentation({emitLayerSpans: false})]});
}
