---
title: Hexo Blog 만들기
date: 2021-05-23 16:24:55
category: [hexo]
tags: [hexo, blog]
---



## 1. Hexo blog 만들기

```shell
$ npm install -g hexo-cli
$ hexo init blog 
$ npm install hexo-theme-icarus
$ hexo config theme icarus
```


### rss2.xml 설치하기

```shell
$ npm install hexo-generator-feed --save
```

```yaml
# _config.yml 
feed:
  type: rss2
  path: rss2.xml
  limit: 20
```



### deploy 설정하기

```shell
$ npm install hexo-deployer-git --save
```



```yaml
# _config.yml 
deploy:
  type: git
  repo: <repository url> # https://bitbucket.org/JohnSmith/johnsmith.bitbucket.io
  branch: [branch]
  message: [message]
```



## 2. Hexo 명령어

```shell
$ hexo server # 로컬 서버 구동할때
$ hexo deploy --generate # deploy 할때
$ hexo post "post title...." # 새로운 포스팅 할 때
```

