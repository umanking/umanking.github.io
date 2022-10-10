---
layout: post
title: github(gh) cli를 통해 pull request 빠르게 체크아웃 하기
date: 2022-10-10 15:20 +0900
description: 
image: https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png
tags: tip
---

# github(gh) cli를 통해 pull request 빠르게 체크아웃 하기

여러개의 프로젝트 PR를 동시에 진행하면, 해당 브랜치로 checkout를 해야 하는데 브랜치 명이 아무래도 Jira 티켓명으로 브랜치를 따기 때문에 (`feature/XXXX-123`) 내가 작업하는 PR이 어떤 브랜치인지 확인 하기 위해서는 github 사이트에 들어가서 직접 브랜치를 copy해서 checkout하는 번거로움이 있었습니다.

**찾아보니 github cli (gh)를 이용해서 해당 PR 정보를 확인후에 바로 checkout하는 것을 발견했습니다.**

## 1. 사전 작업

- 들거가기 전에 `gh`와 [fzf(fuzzy finder)](https://github.com/junegunn/fzf)를 설치해야 합니다.
- fuzzy finder는 cli를 통해서 파일을 쉽게 찾을 수 있는 유틸리티라고 생각하면 됩니다.

```bash
# github cli 설치
$ brew install gh

# fuzzy finder를 설치
$ brew install fzf
```

- gh auth login을 다음과 같이 진행합니다.

```bash
# github cli auth login
$ gh auth login
```

<img width="1234" alt="Screen Shot 2022-10-10 at 3 24 26 PM" src="https://user-images.githubusercontent.com/28615416/194808489-cc495264-9a96-4e50-a3b7-c9633e683929.png">

## 2. alias를 지정한다.

```bash
# gh co 로 입력하면, pull request 의 리스트를 확인.
# 방향키로 선택하면 해당 pull request의 해당 브랜치로 checkout 할 수 있다. 
$ gh alias set co --shell 'id="$(gh pr list -L100 | fzf | cut -f1)"; [ -n "$id" ] && gh pr checkout "$id"'
```

- `$id=(gh pr list -L100 | fzf | cut -f1)`
    - pr list limit 100개를 보여줍니다. 그리고 fzf 유틸리티를 이용해서 선택된 pr의 첫번째 컬럼(pr number)값을 output으로 print해서 id변수에 할당합니다.
- `[ -n "$id" ]`
    - id 값이 존재하면 `gh pr checkout $id` 를 실행시킵니다.
        - 해당 pr number로 checkout 합니다.



## 3. 실행 결과

<script id="asciicast-spfBD4Yk1FAsWX8bxU4Gvmxst" src="https://asciinema.org/a/spfBD4Yk1FAsWX8bxU4Gvmxst.js" data-autoplay="true" data-loop="true" async></script>
