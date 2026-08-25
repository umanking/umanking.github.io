export type SectionId = "architecture" | "backend" | "web" | "data" | "infra" | "ai" | "news";

export interface FaqItem {
  q: string;
  a: string;
}

export interface Hub {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  /** 허브 pillar 페이지의 FAQ. 있으면 FAQPage 스키마로도 출력한다. */
  faq?: FaqItem[];
}

export interface Section {
  id: SectionId;
  label: string;
  description: string;
  hubs: Hub[];
}

export const SECTIONS: readonly Section[] = [
  {
    id: "architecture",
    label: "아키텍처",
    description: "시스템 설계, 분산 처리, 성능과 확장성, 설계 패턴을 다룹니다.",
    hubs: [
      { id: "msa", label: "마이크로서비스", description: "서비스 분리와 통신, 데이터 일관성.", keywords: ["msa", "microservice"] },
      { id: "performance", label: "성능과 확장성", description: "부하 대응, 캐시 전략, 병목 분석.", keywords: ["성능", "확장성", "부하"] },
      { id: "patterns", label: "설계 패턴", description: "설계 패턴과 DDD.", keywords: ["패턴", "ddd"] },
      { id: "system-design", label: "시스템 설계", description: "실제 시스템 설계 사례.", keywords: ["시스템 설계"] },
    ],
  },
  {
    id: "backend",
    label: "백엔드",
    description: "Spring, JPA, Java로 서버를 만들며 마주친 문제와 해결 과정을 정리합니다.",
    hubs: [
      { id: "spring", label: "Spring · Spring Boot", description: "Spring 핵심 개념부터 실무 설정까지.", keywords: ["spring", "spring-boot", "springboot"] },
      { id: "jpa", label: "JPA · Hibernate", description: "연관관계 매핑, 영속성 컨텍스트, 성능 최적화.", keywords: ["jpa", "hibernate", "querydsl", "orm", "영속성"] },
      { id: "java", label: "Java", description: "언어 기능, 동시성, GC.", keywords: ["java"] },
      { id: "testing", label: "테스트", description: "JUnit, AssertJ, 테스트 전략.", keywords: ["junit", "junit5", "assertj", "test"] },
    ],
  },
  {
    id: "web",
    label: "웹",
    description: "JavaScript, TypeScript, Node.js 실무 예제와 자주 쓰는 패턴.",
    hubs: [
      { id: "javascript", label: "JavaScript", description: "배열·문자열·비동기 등 자주 쓰는 문법과 패턴.", keywords: ["javascript", "js", "promise", "lodash"] },
      { id: "typescript", label: "TypeScript", description: "타입 시스템과 유틸리티 타입.", keywords: ["typescript", "ts"] },
      { id: "nodejs", label: "Node.js", description: "Node 런타임, NestJS, 패키지 관리.", keywords: ["nodejs", "node", "nestjs", "npm", "yarn", "socket"] },
    ],
  },
  {
    id: "data",
    label: "데이터",
    description: "MySQL, Redis를 비롯한 데이터 저장소의 동작 원리와 튜닝.",
    hubs: [
      { id: "mysql", label: "MySQL", description: "인덱스, 쿼리 튜닝, 트리거.", keywords: ["mysql", "sql"] },
      { id: "redis", label: "Redis", description: "캐시 전략과 운영 주의점.", keywords: ["redis", "cache"] },
      { id: "modeling", label: "데이터 모델링", description: "스키마 설계와 마이그레이션.", keywords: ["flyway", "migration", "모델링"] },
    ],
  },
  {
    id: "infra",
    label: "인프라",
    description: "Docker, AWS, CI/CD, 관측성, 그리고 개발 환경 세팅.",
    hubs: [
      { id: "docker", label: "Docker", description: "컨테이너 빌드와 로컬 개발 환경.", keywords: ["docker", "dockerfile", "container"] },
      { id: "aws", label: "AWS", description: "서버리스와 클라우드 운영.", keywords: ["aws", "lambda"] },
      { id: "cicd", label: "CI/CD", description: "빌드·배포 파이프라인 자동화.", keywords: ["ci", "cd", "github action", "githubaction"] },
      { id: "observability", label: "관측성", description: "모니터링, 로깅, 에러 트래킹.", keywords: ["prometheus", "grafana", "sentry", "monitoring"] },
      { id: "tools", label: "개발 도구", description: "IntelliJ, Mac, 터미널, Git 생산성.", keywords: ["intellij", "mac", "vim", "shell", "git", "ssh", "iterm", "vscode", "linux", "리눅스"] },
    ],
  },
  {
    id: "ai",
    label: "AI",
    description: "LLM 활용, AI 코딩 도구, RAG와 에이전트 설계.",
    hubs: [
      { id: "llm", label: "LLM", description: "모델 비교와 기본 개념.", keywords: ["llm", "gpt", "claude"] },
      { id: "ai-coding", label: "AI 코딩", description: "AI 코딩 도구와 에이전트 활용.", keywords: ["ai coding", "copilot", "agent"] },
      { id: "rag", label: "RAG", description: "임베딩, 벡터 검색, 검색 증강 생성.", keywords: ["rag", "embedding", "vector"] },
      { id: "engineering", label: "LLM 엔지니어링", description: "LLM 애플리케이션 설계와 운영.", keywords: ["prompt", "llmops"] },
    ],
  },
  {
    id: "news",
    label: "뉴스",
    description: "매주 정리하는 AI · 개발 소식과 주요 릴리스.",
    hubs: [
      { id: "weekly", label: "위클리 다이제스트", description: "주간 AI · 개발 뉴스 큐레이션.", keywords: ["weekly", "digest"] },
      { id: "releases", label: "릴리스", description: "주요 도구·프레임워크 릴리스 정리.", keywords: ["release"] },
    ],
  },
] as const;

export const SECTION_IDS = SECTIONS.map((s) => s.id) as SectionId[];

export const POST_TYPES = ["tutorial", "reference", "troubleshooting", "deepdive", "news"] as const;
export const POST_LEVELS = ["입문", "중급", "심화"] as const;

export type PostType = (typeof POST_TYPES)[number];
export type PostLevel = (typeof POST_LEVELS)[number];

export const TYPE_LABELS: Record<PostType, string> = {
  tutorial: "튜토리얼",
  reference: "레퍼런스",
  troubleshooting: "트러블슈팅",
  deepdive: "딥다이브",
  news: "뉴스",
};

/** 허브가 정식 오픈되는 최소 글 수 */
export const HUB_OPEN_THRESHOLD = 3;
