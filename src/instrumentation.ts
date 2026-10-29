import 'dotenv/config';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseSpanProcessor } from '@langfuse/otel';
export const traceEnabled = process.env.TRACE_ENABLED === 'true';
if (traceEnabled && (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY || !process.env.LANGFUSE_BASE_URL)) {
  throw new Error('Trace enabled: set the three LANGFUSE credentials/base URL variables.');
}
export const sdk = traceEnabled ? new NodeSDK({ spanProcessors: [new LangfuseSpanProcessor()] }) : null;
sdk?.start();
export async function shutdown() { await sdk?.shutdown(); }
