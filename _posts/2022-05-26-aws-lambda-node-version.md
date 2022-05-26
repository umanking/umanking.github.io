---
layout: post
title: "AWS Lambda nodejs 16 version upgrade"
date: 2022-05-26 22:00 +0900
toc: true
tags: [aws]
categories: [aws]
image: 'https://images.velog.io/images/jeffyoun/post/58ab53ee-c62a-44c1-863b-9431608de91d/1_H5SUqUJhRRG2gbgCXV2ghQ.png'
description: AWS Lambda Nodejs 16 버전 업그레이드 작업
---
## AWS Lambda Nodejs 16 버전 업그레이드 작업

사내 시스템으로 AWS Lambda를 사용하는데  얼마전에 2022년 5월 16일자로 [AWS lambda Nodejs 16에 대한 지원 추가](https://aws.amazon.com/ko/about-aws/whats-new/2022/05/aws-lambda-adds-support-node-js-16/)한다고 AWS에 게시되었다. 

Lambda에 적용된 node 버전을 올리려고 했는데 잘 되지 않았다. 

디버깅을 해보니 사내에서 [chrome-aws-lambda](https://github.com/alixaxel/chrome-aws-lambda)  라이브러리를 사용하고 있고, 해당 라이브러리를 Lambda 레이어로 패키징해서 사용하고 있었다. 

> 해당 라이브러리는 Chromium binary이고, 브라우저단에서 일어나는 다양한 동작들을 다룰 수 있는 라이브러리이다. 



하지만 `chrome-aws-lambda`에서 아직 node 16버전을 지원하지 않는다.

[https://github.com/alixaxel/chrome-aws-lambda/pull/274](https://github.com/alixaxel/chrome-aws-lambda/pull/274)

이미 PR을 올라가 있지만 소스에 반영이 되지 않았기 때문에....

해당 repo를 watch를 통해서 해당 PR이 반영되면 적용해야겠다. 



## 참고) AWS Lambda Layer란? 

>  Lambda Layer는 Lambda 함수와 함께 사용할 수 있는 라이브러리 및 기타 종속성을 패키징하는 편리한 방법을 제공한다. - AWS document - 

쉽게 말해서, 여러 람다에서 공유해서 사용가능한 라이브러리 패키징이라고 생각하면 된다. 람다에 올릴 수 있는 사이즈의 제한이 있기 때문에 이런 아키텍쳐가 생겨난게 아닐까 생각해본다. 어쨌든, 10MB를 넘는다면 S3를 이용하고, 그 이하면 Zip 파일로 업로드를 가능하다. 계층을 만들고, AWS Lambda에 해당 레이어를 추가해주면 적용되는 구조이다. 

