---
layout: post
title: github personal access token 이슈 
date: 2021-08-15 13:11 +0900
toc: true
tags: [git]
categories: [git]
image: 'https://temxi.com/minfo/logo/69/github-logo.png'
description: github push 명령어가 제대로 동작하지 않는 이슈, personal access token 기반으로 인증이 변경됨
---
## 1. 들어가며

블로그 포스팅 이후에 git push를 했는데, 다음과 같은 에러 메세지를 받았다. 

> remote: Support for password authentication was removed on August 13, 2021. Please use a personal access token instead.
> remote: Please see [https://github.blog/2020-12-15-token-authentication-requirements-for-git-operations/](https://github.blog/2020-12-15-token-authentication-requirements-for-git-operations/) for more information.
> fatal: unable to access 'https://github.com/umanking/umanking.github.io.git/': The requested URL returned error: 403

github documentation 문서를 살펴보니

2021년 8월 13일 이후부터는 id/password 인증 방식을 더이상 제공하지 않는다고 한다. 

그래서 personal access token으로 토큰 방식의 인증을 하라고 한다. 



## 2. 방법

### 2.1. personal access token 발급 
- [https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token)

personal access token 발급방식은 github 공식 문서로 대체 하겠다. 




### 2.2. '키체인 접근' 실행

![스크린샷 2021-08-15 오후 12 55 43](https://user-images.githubusercontent.com/28615416/129466779-86cf48cc-f55f-4ab3-bc7d-accf22031ea7.png)

###  2.3. 'github'를 검색 > github.com를 찾는다.

![스크린샷 2021-08-15 오후 12 54 49](https://user-images.githubusercontent.com/28615416/129466784-5ab9c0e8-5a0e-41c3-9f0d-0f850310aa2a.png)

### 2.4. 위에서 만들었던 'personal access token'을 입력

![스크린샷 2021-08-15 오후 12 54 56](https://user-images.githubusercontent.com/28615416/129466781-c2a4c35a-0805-4936-a3b4-d9a75c28aebf.png)
