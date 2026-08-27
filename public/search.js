(() => {
  const query = new URLSearchParams(location.search).get("q") || "";
  const root = document.querySelector("#search");
  if (!root) return;

  if (typeof window.PagefindUI === "function") {
    new window.PagefindUI({
      element: "#search",
      showSubResults: true,
      showImages: false,
      translations: {
        placeholder: "검색어를 입력하세요",
        zero_results: "[SEARCH_TERM]에 대한 결과가 없습니다",
        many_results: "[SEARCH_TERM] 검색 결과 [COUNT]건",
        one_result: "[SEARCH_TERM] 검색 결과 1건",
      },
    });
    const input = query && root.querySelector("input");
    if (input) {
      input.value = query;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    return;
  }

  const dataElement = document.querySelector("#search-data");
  const documents = dataElement ? JSON.parse(dataElement.textContent || "[]") : [];
  const form = document.createElement("form");
  const input = document.createElement("input");
  const status = document.createElement("p");
  const list = document.createElement("ul");

  form.className = "local-search__form";
  input.className = "local-search__input";
  input.type = "search";
  input.name = "q";
  input.placeholder = "검색어를 입력하세요";
  input.autocomplete = "off";
  input.value = query;
  status.className = "local-search__status";
  status.setAttribute("aria-live", "polite");
  list.className = "local-search__list";
  form.append(input);
  root.append(form, status, list);

  const render = () => {
    const term = input.value.trim().toLocaleLowerCase("ko-KR");
    const results = term
      ? documents.filter((document) =>
          [document.title, document.description, ...(document.tags || [])]
            .join(" ")
            .toLocaleLowerCase("ko-KR")
            .includes(term),
        )
      : [];
    list.replaceChildren();
    status.textContent = term ? `${term} 검색 결과 ${results.length}건` : "검색어를 입력해 주세요.";
    for (const result of results.slice(0, 30)) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const description = document.createElement("p");
      item.className = "local-search__item";
      link.className = "local-search__title";
      link.href = result.url;
      link.textContent = result.title;
      description.className = "local-search__description";
      description.textContent = result.description;
      item.append(link, description);
      list.append(item);
    }
  };

  form.addEventListener("submit", (event) => event.preventDefault());
  input.addEventListener("input", render);
  render();
})();
