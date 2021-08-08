---
layout: post
title: MySQL 중복데이터 관리방법 (INSERT IGNORE, ON DUPLICATE KEY UPDATE...)
date: 2021-07-05 20:04 +0900
image: 'https://download.logo.wine/logo/MySQL/MySQL-Logo.wine.png'
tags: [mysql]
categories: [mysql]
toc: true
description: MySQL에서 중복 데이터를 삽입하는 3가지 방법에 대해서 알아보자.
---

## 1. MySQL 중복데이터 관리방법 

보통은 데이터베이스의 중복데이터를 방지하기 위해서, 특정 컬럼을 unique인덱스로 지정한다. 그런 경우에 기존의 INSERT 문으로 동일한 데이터를 삽입하려고 하면, 에러가 난다. 이를 회피하는 3가지 방법이 있다. 하나씩 살펴보자. 

## 2. INSERT IGNORE 

중복된 데이터값이 있다면 삽입을 무시한다. 

```sql
CREATE TABLE person
(
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(20),
  address VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE INDEX (name) -- 중복 검사용 필드
);
```

일반적인 INSERT 문에서 name이 unique인덱스로 걸려있는 경우, 아래 2개의 쿼리는 동작하지 않고 에러가 난다. 중복된 데이터라고 알려준다. 

```sql
INSERT INTO person VALUES ('Andrew', 'Seoul');

-- 아래 2개의 쿼리는 에러가 난다
INSERT INTO person VALUES ('Andrew', 'Incheon');
INSERT INTO person VALUES ('Andrew', 'Busan');
```



아래처럼 `IGNORE`키워드를 사용했을때 중복된 데이터 컬럼인 경우, 0 row affected 를 반환한다. IGNORE는 id값이 증감하지 않는다. 

```sql
INSERT IGNORE INTO person VALUES ('Andrew', 'Seoul');

-- 아래 2개의 쿼리는 0 row affected로 반환한다. (에러는 아님)
INSERT IGNORE INTO person VALUES ('Andrew', 'Incheon');
INSERT IGNORE INTO person VALUES ('Andrew', 'Busan');
```

person테이블을 조회해보면 다음과 같이 최초에 입력된 값과 Id값을 반환한다.

```sql
+----+---------+---------+
| id | name    | address |
+----+---------+---------+
|  1 | Andrew  | Seoul   |
+----+---------+---------+
```





## 3. INSERT INTO .... ON DUPLICATE KEY UPDATE 

해당 키워드는 중복데이터가 발생했을때, 업데이트할 항목을 지정할 수 있다. 

```sql
CREATE TABLE person
(
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(20),
  address VARCHAR(255),
  inserted_cnt INT, -- 레코드가 몇 번 입수되었는지 확인용 필드
  PRIMARY KEY (id),
  UNIQUE INDEX (name)
);
```

기존의 person테이블에 inserted_cnt 컬럼을 추가해서, 동일한 name의 insert문이 실행될때마다, 해당 컬럼값을 +1 하도록 작성하였다. 아래 예제에서는 inserted_cnt 값 하나만 update를 햇지만, `key-value` 형식으로 여러개의 필드들을 업데이트 할 수 있다. 

`ON DUPLICATE KEY UPDATE`키워드는 각각 처음 삽입된 쿼리를 제외하고, 2 row affected를 리턴한다.

```sql
INSERT INTO person VALUES ('Andrew', 'Seoul', 1) 
	ON DUPLICATE KEY UPDATE inserted_cnt = inserted_cnt + 1;

INSERT INTO person VALUES ('Andrew', 'Incheon', 1) 
	ON DUPLICATE KEY UPDATE inserted_cnt = inserted_cnt + 1;

INSERT INTO person VALUES ('Andrew', 'Busan', 1) 
	ON DUPLICATE KEY UPDATE inserted_cnt = inserted_cnt + 1;


```

실제 person테이블을 조회해보면 다음과 같이 총3번의 카운트값이 나왔다. 그리고 address도 제일 마지막에 입력된 `Busan`이 나온다.

```sql
+----+---------+---------+--------------+
| id | name    | address | inserted_cnt |
+----+---------+---------+--------------+
|  1 | Andrew  | Busan   |            3 |
+----+---------+---------+--------------+
```



## 4. REPLACE INTO

해당 키워드는 기존의 중복데이터가 있으면 삭제하고, 새로 INSERT한다. 당연히 새로 삽입하기 때문에 AUTO_INCREMENT값이 증가한다.(단점)

첫번재 삽입되는 항목을 제외하고, 나머지 2개의 쿼리는 2 row affected를 반환한다. 

```sql
REPLACE INTO person VALUES ('Andrew', 'Seoul');

REPLACE INTO person VALUES ('Andrew', 'Incheon');
REPLACE INTO person VALUES ('Andrew', 'Busan');
```

person테이블을 조회하면 다음과 같이 id값이 3인, 주소도 제일 마지막에 삽입한 `Busan` 이 나온다.

 ```sql
+----+---------+---------+
| id | name    | address |
+----+---------+---------+
|  3 | Andrew  | Busan   |
+----+---------+---------+
 ```



## 5. 정리 

MySQL 실무에서 종종, 중복된 데이터를 관리?하기 위해서 unique인덱스를 걸어주는데, 기존의 INSERT문에서 중복된 데이터를 그냥 INSERT할때 에러가 발생한다. 이를 회피하는 3가지 전략에 대해서 알아봤다. 실제 실무에서 REPLACE INTO는 사용해보지 않았다.



## 6. 참고 

http://jason-heo.github.io/mysql/2014/03/05/manage-dup-key2.html