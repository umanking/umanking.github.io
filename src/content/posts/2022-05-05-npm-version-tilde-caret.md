---
title: npm package.json의 verison과 틸드tilde(~)와 캐럿caret(^)
description: package.json의 version을 명시하는 방법과 틸드와 캐럿에 대해서 알아보자
date: '2022-05-05T11:27:00+09:00'
permalink: /2022/05/05/npm-version-tilde-caret/
section: web
hub: nodejs
type: reference
level: 중급
tags:
  - npm
image: 'https://heropy.blog/css/images/vendor_icons/npm.png'
---

## Semantic Versioning

1.2.3와 같은 버전은 `MAJOR.MINOR.PATH` 의 형태로 구성되고, 이는 [Semantic Versioning](https://semver.org/) 간단하게 줄여서 semver이라고 부른다. 

1. MAJOR version when you make incompatible API changes,
2. MINOR version when you add functionality in a backwards compatible manner, and
3. PATCH version when you make backwards compatible bug fixes.



- MAJOR는 하위호환이 되지 않는 API변화들
- MINOR는 하위호환이 되는 범위내에서 기능 추가들
- PATCH는 하위호환이 되는 범위내에서 bug fix 🐞



특정 버전보다 높거나 낮은 경우 `크다`, `작다`, `크거나 같다`, `작거나 같다`로 표기한다.

```
>1.2.3
>=1.2.3
<1.2.3
<=1.2.3
```





## 틸드, 캐럿

본론으로 돌아와서, 틸드(~), 캐럿(^)에 대해서 살펴보자. 

> - 틸드(~): x.y.z 중 z 범위 내에서 버전 업데이트
> - 캐럿(^): x.y.z 중 x 이하 하위호환성이 보장되는 범위 내에서 버전 업데이트


- ~1.2.3: `>=1.2.3`    `<1.3.0` 
  - 틸드이고, 위의 정의에 따라서 z범위내에서 버젼 업데이트 한다. 
  - 그러면 범위가 1.2.3을 포함해서 같거나 크고, 1.3.0보다 작은 범위내에서 업데이트 한다. 
- ^1.2.3: `>=1.2.3`  `<2.0.0`
  - 캐럿은, 위의 정의에 따라 x이하 하위 호환성이 보장되는 범위내에서 버전 업데이트 한다. 
  - 1.2.3보다 크거나 같고, 2.0.0보다 작은 범위내에서 업데이트 한다. 
  - 결국 Major버전이 바뀌지 않고, **하위호환성을 유지하기 때문에 실무에서 가장 많이 사용한다!**







## ref

- [https://jeonghwan-kim.github.io/series/2019/12/09/frontend-dev-env-npm.html#55-%EB%B2%84%EC%A0%84%EC%9D%98-%EB%B2%94%EC%9C%84](https://jeonghwan-kim.github.io/series/2019/12/09/frontend-dev-env-npm.html#55-%EB%B2%84%EC%A0%84%EC%9D%98-%EB%B2%94%EC%9C%84)
- [https://blog.outsider.ne.kr/1041](https://blog.outsider.ne.kr/1041)
- [https://semver.org/](https://semver.org/)
- [https://kimyejin.tistory.com/entry/npm-packagejson%EC%97%90%EC%84%9C-%EC%82%AC%EC%9A%A9%ED%95%9C-%ED%8B%B8%EB%93%9C-%EC%BA%90%EB%9F%BF%EC%97%90-%EB%8C%80%ED%95%98%EC%97%AC](https://kimyejin.tistory.com/entry/npm-packagejson%EC%97%90%EC%84%9C-%EC%82%AC%EC%9A%A9%ED%95%9C-%ED%8B%B8%EB%93%9C-%EC%BA%90%EB%9F%BF%EC%97%90-%EB%8C%80%ED%95%98%EC%97%AC)
