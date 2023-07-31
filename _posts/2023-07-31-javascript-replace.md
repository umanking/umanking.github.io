---
layout: post
title: Javascript replace 예제
date: 2023-07-31 14:41 +0900
image: https://blog.kakaocdn.net/dn/cr1ks0/btqAq3iFZQH/m9yoWxkN0SfKHpZ2MnfyKk/img.png
tags: [js]
---
JavaScript의 `replace()` 메서드는 문자열에서 특정 패턴(문자열 또는 정규식)을 검색하여 해당 패턴을 새로운 문자열로 치환하는 메서드입니다. 이를 통해 문자열 내에서 원하는 부분을 변경하거나 제거하는 작업을 할 수 있습니다.

## replace() 메서드의 구문은 다음과 같습니다:

```javascript
const newString = originalString.replace(searchValue, newValue);
```

- `originalString`: 원본 문자열입니다. `replace()` 메서드는 원본 문자열을 직접 변경하지 않고, 새로운 문자열을 반환합니다.
- `searchValue`: 변경하고자 하는 대상을 나타내는 패턴(문자열 또는 정규식)입니다.
- `newValue`: `searchValue`와 일치하는 부분을 찾았을 때 대체할 새로운 값입니다.

`searchValue`는 문자열 또는 정규식이 될 수 있습니다. 문자열로 검색하는 경우, 첫 번째 발견된 하나만 바뀝니다. 정규식으로 검색하는 경우, 기본적으로 첫 번째 발견된 하나만 바뀝니다. 하지만 정규식에 `g` 플래그를 추가하여 전역 검색(global search)을 활성화하면 모든 발견된 부분이 바뀝니다.

## 예시를 살펴봅시다:

```javascript
const originalString = "Hello, world! Hello, world!";

const replacedString = originalString.replace("world", "JavaScript");
console.log(replacedString); // "Hello, JavaScript! Hello, world!"

const regex = /Hello/g;
const replacedStringRegex = originalString.replace(regex, "Hi");
console.log(replacedStringRegex); // "Hi, world! Hi, world!"
```

위의 예시에서 `replace()` 메서드를 사용하여 원본 문자열 `originalString`에서 "world"를 "JavaScript"로 바꿨습니다. 그리고 정규식 `/Hello/g`를 사용하여 "Hello"를 "Hi"로 바꿨습니다. `g` 플래그를 사용했기 때문에 모든 "Hello"가 "Hi"로 바뀌었습니다.

참고로, `replace()` 메서드는 원본 문자열을 직접 변경하지 않고 새로운 문자열을 반환합니다. 따라서 `originalString`은 변경되지 않습니다. 만약 원본 문자열을 변경하고자 한다면, `replace()` 메서드의 결과를 다시 변수에 할당하거나 원본 문자열에 직접 대입해야 합니다.