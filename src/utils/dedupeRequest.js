/** Share in-flight GETs so React StrictMode double-effects don't hit the network twice. */
const inflight = new Map();

export async function dedupeRequest(key, runner) {
  if (inflight.has(key)) return inflight.get(key);
  const promise = Promise.resolve()
    .then(runner)
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, promise);
  return promise;
}
