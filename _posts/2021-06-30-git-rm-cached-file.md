---
layout: post
title: Github에 잘못올라간 파일 삭제후 .gitignore에 추가하기
date: 2021-06-30 21:58 +0900
tags: [git]
categories: [git]
image: 'https://temxi.com/minfo/logo/69/github-logo.png'
---
## Github에 잘못올라간 파일 삭제후 .gitignore에 추가하기

.gitignore에 포함시켜서, github에 올라가지 말아야 할 파일들이 올라간 경우에 어떻게 할까? 

## 방법

```shell
# 현재 레포지토리의 캐쉬된 것들 모두 삭제한다.
$ git rm -r --cached .
```

### --cached 옵션이 없는 경우 vs --cached 옵션이 있는 경우 차이점
```
 $ git rm -r [file] 은 로컬 & 리모트 둘다 삭제 함  
 $ git rm -r --cahed [file] 리모트만 삭제함(로컬 파일은 그대로 둠)
 ```

- `.gitignore`파일에 제외시킬 해당 파일/폴더 경로를 추가한다. 
- `git add .`
- `git commit -m “some message”` 
- `git push origin master`