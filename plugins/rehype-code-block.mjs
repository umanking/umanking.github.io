import { visit } from "unist-util-visit";

export default function rehypeCodeBlock() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "pre" || !parent || index === null) return;
      // 이미 감싼 것을 다시 감싸지 않는다 (플러그인이 두 번 실행되는 경우 대비)
      if (parent.type === "element" && parent.properties?.className?.includes?.("codeblock")) return;

      let lang = node.properties?.dataLanguage ?? "";
      if (!lang || typeof lang !== "string") {
        // Shiki 버전에 따라 data-language가 없을 수 있다 —
        // <code>의 className에서 language-xxx를 파싱하는 경로.
        const codeChild = node.children?.find(
          (c) => c.type === "element" && c.tagName === "code",
        );
        const codeClass = codeChild?.properties?.className;
        const classes = Array.isArray(codeClass) ? codeClass : [];
        const langClass = classes.find(
          (c) => typeof c === "string" && c.startsWith("language-"),
        );
        if (langClass) lang = langClass.slice("language-".length);
      }
      const label = typeof lang === "string" && lang ? lang : "code";

      parent.children[index] = {
        type: "element",
        tagName: "figure",
        properties: { className: ["codeblock"] },
        children: [
          {
            type: "element",
            tagName: "figcaption",
            properties: { className: ["codeblock__bar"] },
            children: [
              {
                type: "element",
                tagName: "span",
                properties: { className: ["codeblock__lang"] },
                children: [{ type: "text", value: label }],
              },
              {
                type: "element",
                tagName: "button",
                properties: {
                  type: "button",
                  className: ["codeblock__copy"],
                  "data-copy": "",
                  "aria-label": `${label} 코드 복사`,
                },
                children: [{ type: "text", value: "복사" }],
              },
            ],
          },
          node,
        ],
      };
    });
  };
}
