---
layout: post
title: MySQL 날짜 포맷팅 DATE_FORMAT
date: 2021-06-30 22:20 +0900
tags: [mysql]
image: 'https://download.logo.wine/logo/MySQL/MySQL-Logo.wine.png'
---

## MySQL 날짜 포맷팅 DATE_FORMAT

보통 mysql에 날짜형식을 `datetime` 형(년월일 시분초)으로 저장한다. 

애플리케이션단에서 특정일을 기준으로 조회하는 경우가 많다. 

이럴경우 DB에 저장된 date값을 포맷팅을 해서 날짜를 비교한다.

```sql
SELECT DATE_FORMAT(date, '%Y-%m-%d'); #2021-06-30

#실제 다음과 같이 사용한다. 
#21년 1월 1일 이후로 가입한 유저수를 구하는 쿼리
SELECT count(*) FROM account WHERE DATE_FORMAT(joined_date, '%Y-%m-%d') >= '2021-01-01'
```

