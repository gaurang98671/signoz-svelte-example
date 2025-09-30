'use strict'
import { defaultResource, resourceFromAttributes } from '@opentelemetry/resources';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor, AlwaysOnSampler, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { trace } from '@opentelemetry/api';

console.log("Loaded tracing");

const resource = defaultResource().merge(
  resourceFromAttributes({
    'service.name': 'svelte_kit_service',
    'service.version': '0.1.0',
  })
);

const exporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces'
});

const provider = new WebTracerProvider({
  resource: resource,
  sampler: new AlwaysOnSampler(),
  spanProcessors: [new SimpleSpanProcessor(exporter)],
});


provider.register({
  contextManager: new ZoneContextManager(),
});

registerInstrumentations({
  instrumentations: [
    getWebAutoInstrumentations({
      '@opentelemetry/instrumentation-xml-http-request': {
        propagateTraceHeaderCorsUrls: [/.+/g],
      },
      '@opentelemetry/instrumentation-fetch': {
        propagateTraceHeaderCorsUrls: [/.+/g],
      },
    }),
  ],
});