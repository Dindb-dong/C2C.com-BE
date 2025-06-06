export async function batchProcess<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
    // 배치 사이에 300ms 쉬기
    if (i + batchSize < items.length) {
      await new Promise(res => setTimeout(res, 300));
    }
  }
  return results;
}