---
layout: post
title: MySQL Trigger 사용방법
date: 2022-06-10 15:15 +0900
toc: true
tags: [mysql]
categories: [mysql]
image: 'https://download.logo.wine/logo/MySQL/MySQL-Logo.wine.png'
description: MySQL Trigger 사용방법
---
## MySQL Trigger 사용방법

mysql에서 trigger를 만드는 방법에 대해서 알아보자. 



## trigger란? 

DML(INSERT, UPDATE, DELETE)를 할때, BEFORE, AFTER에 어떤 동작을 추가할 수 있는 것을 의미한다.



## 언제 사용할까? 

주로 DELETE로 특정 ROW를 지울때, 후처리를 무엇을 할것인가를 정의해줄 수 있다. 예를 들면, 실제 `user` 테이블의 데이터를 지우는 경우, `user_delete_history` 테이블에 history성 데이터를 적재 한다고 했을때,  AFTER DELETE 트리거를 걸어서, `user_delete_history`에 데이터를 쌓을 수 있다.


## 기본 문법? 

```sql
DELIMITER //
CREATE TRIGGER trigger_name -- trigger이름을 지어준다.
	AFTER DELETE -- 어느 시점에 적용할지		
	ON user -- 트리거를 걸 테이블을 지정한다.
    FOR EACH ROW
BEGIN
-- 실제 처리할 내용 쿼리문을 적는다.
END
// DELIMITER ;
```



## 예제

```sql
CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  PRIMARY KEY (`id`));

```

```sql
CREATE TABLE `user_delete_history` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL,
  `deletedAt` DATETIME NULL,
  PRIMARY KEY (`id`));

```

간단한 user 테이블과 user_delete_history 테이블을 하나 만든다. 

user테이블에 AFTER DELETE 시점에 트리거를 하나 걸어준다.

```sql
DELIMITER //
CREATE TRIGGER user_after_delete -- trigger이름을 지어준다.
	AFTER DELETE -- 어느 시점에 적용할지		
	ON user -- 트리거를 걸 테이블을 지정한다.
    FOR EACH ROW
BEGIN
	INSERT INTO user_delte_history VALUES (NEW.id, current_date())
END
// DELIMITER ;
```

실제 USER에 데이터를 넣고, 몇몇 ROW를 삭제하게 되면, user_delete_history에 테이블에 이력이 쌓인다! 
NEW.id는 user테이블의 id값을 의미한다. 





> 🙋‍♂️trigger가 걸려있는 테이블 이름을 변경한다면?
>
> 트리거가 걸려있는 대상 테이블의 이름을 rename으로 변경하면, **<u>트리거에 대상 테이블 이름이 같이 변경 되지 않는다.</u>** 그래서 테이블 이름을 바꾸는 경우에는 trigger를 drop하고, 새로 trigger를 등록해줘야 한다. 
