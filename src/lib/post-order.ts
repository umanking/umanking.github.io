type DatedPost = { data: { date: Date; firstPublishedAt?: Date; permalink: string } };

/** Edits never change publication order. Legacy entries retain their original date. */
export function newestPublishedFirst(a: DatedPost, b: DatedPost): number {
  const difference = (b.data.firstPublishedAt ?? b.data.date).getTime()
    - (a.data.firstPublishedAt ?? a.data.date).getTime();
  // Same-batch publication ties are deterministic, independent of filesystem order.
  return difference || b.data.permalink.localeCompare(a.data.permalink);
}
