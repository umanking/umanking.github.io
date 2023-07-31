---
layout: post
title: Javascript queryselector 사용예제
date: 2023-07-31 14:31 +0900
image: https://blog.kakaocdn.net/dn/cr1ks0/btqAq3iFZQH/m9yoWxkN0SfKHpZ2MnfyKk/img.png
tags: [js]
---
JavaScript의 `querySelector()` 메서드는 CSS 선택자를 사용하여 DOM(Document Object Model)에서 요소를 선택하는 데 사용되는 메서드입니다. `querySelector()`는 해당 CSS 선택자에 일치하는 첫 번째 요소를 반환합니다. 즉, 가장 처음에 일치하는 하나의 요소만 선택됩니다.

`querySelector()` 메서드는 `document` 객체 뿐만 아니라 다른 요소들에서도 사용할 수 있습니다. 이 메서드를 사용하여 DOM 내의 요소를 쉽게 선택하고 조작할 수 있습니다.

## querySelector() 메서드의 구문은 다음과 같습니다:

```javascript
const element = document.querySelector(CSS_Selector);
```

- `element`: 선택한 요소를 반환합니다.
- `CSS_Selector`: CSS 선택자를 입력합니다. 예를 들어, 클래스 선택자 `.classname`, 아이디 선택자 `#id`, 요소 선택자 `elementName` 등을 사용할 수 있습니다.

## 예시를 살펴봅시다:

```html
<!DOCTYPE html>
<html>
<head>
  <title>querySelector Example</title>
</head>
<body>
  <div class="container">
    <h1>Hello, World!</h1>
    <p>This is a paragraph.</p>
  </div>

  <script>
    const heading = document.querySelector('h1');
    console.log(heading.textContent); // 출력 결과: "Hello, World!"

    const paragraph = document.querySelector('.container p');
    console.log(paragraph.textContent); // 출력 결과: "This is a paragraph."
  </script>
</body>
</html>
```

위의 예시에서 `querySelector()` 메서드를 사용하여 `h1` 요소와 `.container p` 선택자에 일치하는 요소를 선택합니다. 선택된 요소의 `textContent` 속성을 사용하여 해당 요소의 텍스트 콘텐츠를 가져옵니다.

`querySelector()` 메서드는 해당 선택자에 일치하는 첫 번째 요소만 반환하므로, 여러 개의 요소를 선택해야 한다면 `querySelectorAll()` 메서드를 사용해야 합니다. 이 메서드는 해당 선택자에 일치하는 모든 요소를 NodeList로 반환합니다.