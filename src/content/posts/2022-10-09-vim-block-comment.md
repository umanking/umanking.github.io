---
title: vim 여러줄 주석 다는 방법
description: vim multiline 주석(comment) 다는 방법
date: '2022-10-09T14:19:00+09:00'
permalink: /2022/10/09/vim-block-comment/
section: infra
hub: tools
type: deepdive
level: 중급
tags:
  - i
  - m
  - v
  - vim
image: >-
  https://download.logo.wine/logo/Vim_(text_editor)/Vim_(text_editor)-Logo.wine.png
---

## vim 블럭 지정후, 주석 달기

- shift + v : 블럭지정
- `:`를 누르면 `:'<,'>` 나오는데
- `norm i<입력문자>`
- 예: `norm i#`를 입력하고 `엔터`를 치면 multi line 주석이 달린다.

![Screen Shot 2022-10-09 at 2 24 27 PM](https://user-images.githubusercontent.com/28615416/194739621-8e5a458c-03ce-4d7e-95eb-1a74df55e92f.png)


## vim 블럭 지정후, 주석 삭제

- shift + v : 블럭지성
- `norm x` : 한건의 문자를 지움
- `norm xxxx` : 4건의 문자를 지움
- `norm nx(n은 지울 문자의 개수)` : n건의 문자를 지움

