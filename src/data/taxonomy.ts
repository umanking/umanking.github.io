export type SectionId = "architecture" | "backend" | "web" | "data" | "infra" | "ai" | "finance" | "realestate" | "news";

export type ChannelId = "technology" | "finance" | "realestate";

export interface Channel {
  id: ChannelId;
  label: string;
  description: string;
  href: string;
  sections: readonly SectionId[];
}

/** 독자에게 보이는 상위 정보 구조. 기존 섹션 URL은 유지하고 메뉴만 범용 채널로 묶는다. */
export const CHANNELS: readonly Channel[] = [
  {
    id: "technology",
    label: "기술·AI",
    description: "소프트웨어 설계와 운영부터 AI 모델·도구·산업의 변화까지 깊이 있게 다룹니다.",
    href: "/technology/",
    sections: ["architecture", "backend", "web", "data", "infra", "ai"],
  },
  {
    id: "finance",
    label: "금융·투자",
    description: "시장과 기업, 자산관리와 투자 원칙을 데이터에 근거해 정리합니다.",
    href: "/finance/",
    sections: ["finance"],
  },
  {
    id: "realestate",
    label: "부동산",
    description: "주택시장과 공급, 정책, 청약과 임대차를 공식 자료에 근거해 해석합니다.",
    href: "/realestate/",
    sections: ["realestate"],
  },
] as const;

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
  /** 허브 아바타에 표시할 짧은 심볼. 없으면 label 앞 두 글자로 대체한다. */
  symbol?: string;
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
      {
        id: "spring",
        label: "Spring · Spring Boot",
        description: "Spring 핵심 개념부터 실무 설정까지.",
        keywords: ["spring", "spring-boot", "springboot"],
        symbol: "SB",
        faq: [
          {
            q: "Spring과 Spring Boot는 무엇이 다른가요?",
            a: "Spring은 DI 컨테이너를 중심으로 한 프레임워크이고, Spring Boot는 그 위에서 자동 설정과 내장 서버, 의존성 묶음(starter)을 제공해 설정을 줄여 주는 도구입니다. Spring Boot를 쓴다고 Spring을 안 쓰는 것이 아니라, Spring을 더 적은 설정으로 쓰는 것입니다.",
          },
          {
            q: "빈 순환 참조(circular dependency)는 왜 생기고 어떻게 푸나요?",
            a: "두 빈이 생성자에서 서로를 주입받으면 어느 쪽도 먼저 만들어질 수 없어 발생합니다. 근본 해법은 책임을 분리해 의존 방향을 한쪽으로 정리하는 것이고, 불가피하면 setter 주입이나 @Lazy로 생성 시점을 늦출 수 있습니다.",
          },
          {
            q: "빈 주입은 생성자와 필드 중 어느 쪽이 좋나요?",
            a: "생성자 주입이 기본입니다. 필수 의존성이 누락되면 객체 생성 단계에서 바로 드러나고, 필드를 final로 둘 수 있어 불변성이 보장되며, 테스트에서 의존성을 직접 넣기도 쉽습니다.",
          },
        ],
      },
      {
        id: "jpa",
        label: "JPA · Hibernate",
        description: "연관관계 매핑, 영속성 컨텍스트, 성능 최적화.",
        keywords: ["jpa", "hibernate", "querydsl", "orm", "영속성"],
        symbol: "JPA",
        faq: [
          {
            q: "연관관계의 주인은 무엇이고 어떻게 정하나요?",
            a: "외래 키를 실제로 관리하는 쪽이 연관관계의 주인입니다. 다대일 관계에서는 외래 키를 가진 다(N) 쪽이 주인이 되며, 반대편에는 mappedBy를 지정합니다. 주인이 아닌 쪽에서 값을 바꿔도 DB에 반영되지 않습니다.",
          },
          {
            q: "persist와 merge는 어떻게 다른가요?",
            a: "persist는 새 엔티티를 영속 상태로 만들고 그 인스턴스 자체가 관리됩니다. merge는 준영속·비영속 엔티티의 값을 복사한 새로운 영속 인스턴스를 반환하므로, 넘긴 객체가 아니라 반환된 객체를 써야 합니다.",
          },
          {
            q: "지연 로딩과 즉시 로딩 중 무엇을 써야 하나요?",
            a: "기본은 지연 로딩입니다. 즉시 로딩은 예상하지 못한 조인과 N+1 쿼리를 만들기 쉽습니다. 함께 조회해야 하는 구간은 fetch join이나 엔티티 그래프로 그 시점에만 명시적으로 해결합니다.",
          },
        ],
      },
      { id: "java", label: "Java", description: "언어 기능, 동시성, GC.", keywords: ["java"], symbol: "J" },
      { id: "testing", label: "테스트", description: "JUnit, AssertJ, 테스트 전략.", keywords: ["junit", "junit5", "assertj", "test"], symbol: "T" },
    ],
  },
  {
    id: "web",
    label: "웹",
    description: "JavaScript, TypeScript, Node.js 실무 예제와 자주 쓰는 패턴.",
    hubs: [
      { id: "javascript", label: "JavaScript", description: "배열·문자열·비동기 등 자주 쓰는 문법과 패턴.", keywords: ["javascript", "js", "promise", "lodash"], symbol: "JS" },
      { id: "typescript", label: "TypeScript", description: "타입 시스템과 유틸리티 타입.", keywords: ["typescript", "ts"], symbol: "TS" },
      { id: "nodejs", label: "Node.js", description: "Node 런타임, NestJS, 패키지 관리.", keywords: ["nodejs", "node", "nestjs", "npm", "yarn", "socket"], symbol: "N" },
    ],
  },
  {
    id: "data",
    label: "데이터",
    description: "MySQL, Redis를 비롯한 데이터 저장소의 동작 원리와 튜닝.",
    hubs: [
      { id: "mysql", label: "MySQL", description: "인덱스, 쿼리 튜닝, 트리거.", keywords: ["mysql", "sql"], symbol: "SQL" },
      { id: "redis", label: "Redis", description: "캐시 전략과 운영 주의점.", keywords: ["redis", "cache"], symbol: "R" },
      { id: "modeling", label: "데이터 모델링", description: "스키마 설계와 마이그레이션.", keywords: ["flyway", "migration", "모델링"] },
    ],
  },
  {
    id: "infra",
    label: "인프라",
    description: "Docker, AWS, CI/CD, 관측성, 그리고 개발 환경 세팅.",
    hubs: [
      { id: "docker", label: "Docker", description: "컨테이너 빌드와 로컬 개발 환경.", keywords: ["docker", "dockerfile", "container"], symbol: "D" },
      { id: "aws", label: "AWS", description: "서버리스와 클라우드 운영.", keywords: ["aws", "lambda"], symbol: "AWS" },
      { id: "cicd", label: "CI/CD", description: "빌드·배포 파이프라인 자동화.", keywords: ["ci", "cd", "github action", "githubaction"] },
      { id: "observability", label: "관측성", description: "모니터링, 로깅, 에러 트래킹.", keywords: ["prometheus", "grafana", "sentry", "monitoring"] },
      { id: "tools", label: "개발 도구", description: "IntelliJ, Mac, 터미널, Git 생산성.", keywords: ["intellij", "mac", "vim", "shell", "git", "ssh", "iterm", "vscode", "linux", "리눅스"], symbol: "TL" },
    ],
  },
  {
    id: "ai",
    label: "AI",
    description: "LLM 활용, AI 코딩 도구, RAG와 에이전트 설계.",
    hubs: [
      { id: "llm", label: "LLM", description: "모델 비교와 기본 개념.", keywords: ["llm", "gpt", "claude"], symbol: "AI" },
      { id: "ai-coding", label: "AI 코딩", description: "AI 코딩 도구와 에이전트 활용.", keywords: ["ai coding", "copilot", "agent"] },
      { id: "rag", label: "RAG", description: "임베딩, 벡터 검색, 검색 증강 생성.", keywords: ["rag", "embedding", "vector"] },
      { id: "engineering", label: "LLM 엔지니어링", description: "LLM 애플리케이션 설계와 운영.", keywords: ["prompt", "llmops"] },
    ],
  },
  {
    id: "finance",
    label: "금융·투자",
    description: "시장과 기업을 읽는 데이터, 자산관리와 장기 투자 원칙을 다룹니다.",
    hubs: [
      { id: "macro", label: "거시경제", description: "금리, 물가, 고용과 경기 흐름.", keywords: ["macro", "금리", "물가", "경기"] },
      { id: "forex", label: "환율", description: "원·달러 환율과 통화정책, 자금 흐름.", keywords: ["환율", "원달러", "외환", "currency"] },
      { id: "stocks", label: "개별주", description: "기업 실적과 사업 구조, 위험 요인 분석.", keywords: ["개별주", "기업", "실적", "earnings"] },
      { id: "semiconductors", label: "반도체", description: "메모리, 파운드리, AI 가속기 산업과 기업.", keywords: ["반도체", "semiconductor", "AI chip"] },
      { id: "indices", label: "증시·지수", description: "KOSPI, Nasdaq 100 등 주요 지수의 구조와 흐름.", keywords: ["kospi", "nasdaq100", "지수", "index"] },
      { id: "etf", label: "ETF 분석", description: "지수 추종 상품의 구성, 비용, 분배와 위험을 비교합니다.", keywords: ["etf", "qqq", "qqqm", "상장지수펀드"] },
      { id: "personal-finance", label: "자산관리", description: "현금 흐름, 세금, 연금과 개인 재무.", keywords: ["자산관리", "연금", "세금", "재무"] },
    ],
  },
  {
    id: "realestate",
    label: "부동산",
    description: "주택시장·공급·정책·청약·임대차·리츠를 공식 자료와 확인 가능한 조건으로 해설합니다.",
    hubs: [
      { id: "market-trends", label: "시장동향", description: "가격·거래·전세·입주 흐름.", keywords: ["시장동향", "주택가격", "거래"] },
      { id: "supply", label: "공급", description: "인허가·착공·분양·입주와 공급 계획.", keywords: ["공급", "인허가", "착공", "입주"] },
      { id: "policy", label: "정책", description: "주택·토지 정책과 제도 변화.", keywords: ["정책", "토지거래허가", "제도"] },
      { id: "subscription", label: "청약", description: "청약 자격·일정·공고 해설.", keywords: ["청약", "분양", "공고"] },
      { id: "rent", label: "임대차", description: "전세·월세와 임차인 보호.", keywords: ["전세", "월세", "임대차"] },
      { id: "reits", label: "리츠", description: "부동산 간접투자와 임대수익 구조.", keywords: ["리츠", "REITs", "임대수익"] },
    ],
  },
  // 기존 뉴스 포스트의 URL·스키마 호환을 위한 보관 섹션. 신규 발행과 주 메뉴에서는 사용하지 않는다.
  {
    id: "news",
    label: "뉴스·인사이트",
    description: "기술, AI, 금융의 중요한 흐름을 선별해 맥락과 함께 전합니다.",
    hubs: [
      { id: "releases", label: "릴리스", description: "주요 도구·프레임워크 릴리스 정리.", keywords: ["release"] },
      { id: "analysis", label: "이슈 해설", description: "중요한 사건의 배경과 영향을 설명합니다.", keywords: ["analysis", "인사이트", "해설"] },
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
