import { SECTIONS, HUB_OPEN_THRESHOLD, type Section, type SectionId } from "../data/taxonomy";
import { getAllPosts } from "./posts";

export type HubState = "closed" | "partial" | "open";

export function hubState(count: number): HubState {
  if (count === 0) return "closed";
  if (count < HUB_OPEN_THRESHOLD) return "partial";
  return "open";
}

export function getSection(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export function getHub(sectionId: string, hubId: string) {
  return getSection(sectionId)?.hubs.find((h) => h.id === hubId);
}

/** "section/hub" → 글 수 */
export async function getHubCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const post of await getAllPosts()) {
    const key = `${post.data.section}/${post.data.hub}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/** 섹션 id → 글 수 (허브 상태와 무관하게 섹션에 속한 전체 글 수) */
export async function getSectionCounts(): Promise<Map<SectionId, number>> {
  const counts = new Map<SectionId, number>();
  for (const post of await getAllPosts()) {
    const id = post.data.section as SectionId;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

export interface NavHub { id: string; label: string; count: number }
export interface NavSection { id: SectionId; label: string; hubs: NavHub[] }

/** 메뉴에 노출할 트리. open 상태 허브만 담는다. */
export async function getNavTree(): Promise<NavSection[]> {
  const counts = await getHubCounts();
  return SECTIONS.map((s) => ({
    id: s.id,
    label: s.label,
    hubs: s.hubs
      .map((h) => ({ id: h.id, label: h.label, count: counts.get(`${s.id}/${h.id}`) ?? 0 }))
      .filter((h) => hubState(h.count) === "open")
      .sort((a, b) => b.count - a.count),
  }));
}

export interface TopHub { sectionId: SectionId; sectionLabel: string; id: string; label: string; count: number }

/** 이미 계산된 트리에서 인기 허브를 뽑는 순수 함수 (getNavTree를 다시 호출하지 않는다) */
export function topHubsFromTree(tree: NavSection[], limit = 5): TopHub[] {
  const flat: TopHub[] = [];
  for (const section of tree) {
    for (const hub of section.hubs) {
      flat.push({ sectionId: section.id, sectionLabel: section.label, id: hub.id, label: hub.label, count: hub.count });
    }
  }
  return flat.sort((a, b) => b.count - a.count).slice(0, limit);
}

/** 사이트 전체에서 글 수가 많은 순으로 정렬한 오픈 허브 목록 (우측 레일 "인기 주제" 위젯용) */
export async function getTopHubs(limit = 5): Promise<TopHub[]> {
  return topHubsFromTree(await getNavTree(), limit);
}
