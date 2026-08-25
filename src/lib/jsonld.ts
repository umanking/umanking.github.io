import { SITE, absolute } from "./seo";

const ORG_ID = `${SITE.url}/#organization`;

export function organizationLd() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    url: SITE.url,
    logo: { "@type": "ImageObject", url: absolute("/images/og-default.png") },
  };
}

export function webSiteLd() {
  return {
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    inLanguage: "ko-KR",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/search/?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function blogPostingLd(args: {
  title: string;
  description: string;
  url: string;
  datePublished: Date;
  dateModified: Date;
  image: string;
  section: string;
  keywords: string[];
}) {
  return {
    "@type": "BlogPosting",
    headline: args.title,
    description: args.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": args.url },
    url: args.url,
    datePublished: args.datePublished.toISOString(),
    dateModified: args.dateModified.toISOString(),
    image: args.image,
    articleSection: args.section,
    keywords: args.keywords.join(", "),
    inLanguage: "ko-KR",
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

export function breadcrumbLd(items: Array<{ label: string; href?: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: absolute(item.href) } : {}),
    })),
  };
}

export function itemListLd(args: { name: string; items: Array<{ title: string; url: string }> }) {
  return {
    "@type": "ItemList",
    name: args.name,
    numberOfItems: args.items.length,
    itemListElement: args.items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.title,
      url: absolute(it.url),
    })),
  };
}

export function faqPageLd(items: Array<{ q: string; a: string }>) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** 여러 노드를 하나의 @graph로 묶는다 */
export function graph(nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
