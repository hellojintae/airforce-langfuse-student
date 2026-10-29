/** Drain scores after producers finish, including a batch already in flight. */
export async function flushScores(client: { flush(): Promise<unknown> } | null) {
  // @langfuse/client 5.13.1 flush() first awaits an active automatic batch.
  // A second pass sends scores queued while that request was in flight.
  await client?.flush();
  await client?.flush();
}
