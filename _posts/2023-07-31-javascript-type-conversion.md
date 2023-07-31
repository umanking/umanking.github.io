---
layout: post
title: Javascript type conversion(형변환)
date: 2023-07-31 14:38 +0900
image: https://blog.kakaocdn.net/dn/cr1ks0/btqAq3iFZQH/m9yoWxkN0SfKHpZ2MnfyKk/img.png
tags: [js, type-conversion]
---
JavaScript는 동적 타입(dynamic typing) 언어이기 때문에 변수의 타입을 선언할 필요 없이, 할당되는 값에 따라 자동으로 타입이 결정됩니다. 이러한 특성으로 인해 JavaScript에서는 형변환이 자주 발생합니다. 즉, 변수의 값이 자동으로 다른 타입으로 변환되는 것을 의미합니다.

JavaScript에서 주요한 형변환 방법은 다음과 같습니다:

## 1. 암시적 형변환 (Implicit Type Conversion):
   JavaScript는 특정 연산자 또는 연산에 따라 자동으로 형변환을 수행합니다. 예를 들어, 숫자와 문자열을 더하려고 할 때, JavaScript는 숫자를 문자열로 변환하여 연결합니다.

   ```javascript
   const num = 10;
   const str = "5";

   const result = num + str; // "105" (숫자 10이 문자열로 변환되어 "5"와 연결됨)
   ```

## 2. 명시적 형변환 (Explicit Type Conversion):
   개발자가 의도적으로 타입을 변환하는 것을 말합니다. JavaScript에서는 여러 가지 방법으로 명시적 형변환을 수행할 수 있습니다.

   - 문자열을 숫자로 변환:
     - `parseInt()`: 문자열을 정수로 변환합니다.
     - `parseFloat()`: 문자열을 부동소수점 숫자로 변환합니다.

   ```javascript
   const strNumber = "10";
   const number = parseInt(strNumber); // 10

   const strFloat = "3.14";
   const floatNumber = parseFloat(strFloat); // 3.14
   ```

   - 숫자를 문자열로 변환:
     - `String()`: 숫자를 문자열로 변환합니다.
     - `toString()`: 숫자를 문자열로 변환합니다.

   ```javascript
   const number = 42;
   const strNumber = String(number); // "42"

   const anotherNumber = 3.14159;
   const strFloat = anotherNumber.toString(); // "3.14159"
   ```

   - 불리언(Boolean)을 숫자 또는 문자열로 변환:
     - `Number()`: 불리언 값을 1(참) 또는 0(거짓)으로 변환합니다.
     - `String()`: 불리언 값을 "true" 또는 "false"로 변환합니다.

   ```javascript
   const boolValue = true;
   const numberValue = Number(boolValue); // 1

   const anotherBoolValue = false;
   const stringValue = String(anotherBoolValue); // "false"
   ```

주의할 점은 형변환을 사용할 때 주어진 값이 해당 타입으로 유효한지 확인하는 것입니다. 예상치 못한 결과가 발생할 수 있으므로 형변환을 사용할 때는 항상 주의하여야 합니다.