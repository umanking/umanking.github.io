---
layout: post
title: mackup 오픈소스 (mac환경설정 sync맞추기)
date: 2021-08-13 18:57 +0900
toc: true
tags: [mac]
categories: [mac]
image: 'https://images.unsplash.com/photo-1522040806052-b0aa2b039f00?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
description: mackup오픈소를 활용해서 mac 환경 설정 sync 맞추기
---
## 1. 들어가며

오늘 문득, .zshrc 프로파일에 alias를 추가하면서 문득 든 생각이, 이 파일을 다른 컴퓨터에서도 동일하게 사용하고 싶다는 생각이 문득 들었다. 관련해서 조금 찾아보다 보니 [mackup](https://github.com/lra/mackup) 이라는 오픈소스를 발견했다.



### 1.1. mackup이란? 

설치한 애플리케이션의 환경설정? profile? 이런 정보들을 Dropbox, icloud, google drive에 동기화 해서 sync를 맞추는 프로젝트이다. 사실 README.md 파일에도 잘 설명이 되어 있지만 혹여나 한글 버전이 필요한 경우를 위해서 문서를 작성한다. 



## 2. 설치

```shell
$ brew install mackup 
```



## 3. 사용 방법 

`vi ~/.mackup.cfg` 파일을 만들고 다음과 같이 `storage엔진` 과 sync를 맞출 aplication을 적어주면 된다.  필자는 icloud를 storage 엔진으로 사용한다 .

sync를 맞출 application 목록은 아래에 `mackup list` 명령어를 통해서 확인해볼수 있다. 

config 관련된 자세한 내용은 [여기](https://github.com/lra/mackup/blob/master/doc/README.md)에 있다.

```shell
[storage]
  engine = icloud
[applications_to_sync]
  git
  zsh
  bash
  vim
```



```shell
# 환경설정 파일들을 내가 지정한 storage engine으로 백업한다. 
$ mackup backup 
```



```shell
$ mackup restore # 다른 컴퓨터에서 적용할때 사용
$ mackup uninstall # mackup의 backup를 사용하지 않을때 사용
$ mackup list  # applications_to_sync에 포함시킬수 있는 후보군을 찾을때 사용
```



## 4. 어떤일이 벌어지나?

`$mackup backup`  명령어를 치면 어떤 일이 벌어지나? 

- `cp ~/.zshrc ~/icloudFolder/Mackup/.zshrc` : 복사를 한다. 
- `rm ~/.zshrc` : 기존의 루트에 있는 환경설정 정보를 삭제한다. 
- `ln -s ~/icloudFolder/Mackup/.zshrc ~/.zshrc`: 심볼릭 링크를 만든다. 

정리하면, 우리가 지정한 storage engine에 기본 파일을 저장하고, 심볼릭 링크를 루트경로에 만들어 놓는다. 

> 심볼릭 링크는,  예전 윈도우에 `바탕화면 바로가기 `와 같다고 생각하면 된다. 





## 5. 정리

- zshrc와 같은 profile외에도 IntelliJ, Docker, VsCode 등의 모든 application 환경설정도 추가되는 것을 확인할 수 있다.

