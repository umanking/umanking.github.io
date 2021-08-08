---
layout: post
title: Flyway (db migration) 예제
date: 2021-08-04 15:42 +0900
image: 'https://digital.ai/sites/default/files/pictures/styles/maxwidth_300/public/pt_logos/flyway.png?itok=B976zlaq'
tags: [flyway, db-migration]
categories: [flyway]
toc: true
description: DB migration 툴인 flyway에 대한 사용방법을 알아보자.
---

## 1. 들어가며 

### 1.1. 왜 필요한가? 
Flyway는 DB마이그레이션 툴로써, 흔히 개발을 진행할 때 보통은 개발환경, 스테이지환경, 운영환경으로 나뉘게 된다. 하지만 보통 개발환경에서 작업한 것들(DB 테이블 스키마가 변경되는 것들)에 대해서 스테이지환경과 운영환경에 반영하는것들을 깜빡할 수 가 있다. 그래서 Flyway 툴을 사용해서 DB 스키마에대한 버전관리를 해서 변경된 내용이 반영이 되지 않으면 애플리케이션이 실행하면서 예외를 뱉어낸다. 


실제 간단한 예제 코드를 작성해보면서, 어떻게 적용하는지 살펴보자! 

>  관련된 예제 코드는 [여기](https://github.com/umanking/flyway-migration-example)에서 확인 가능합니다.


## 2. 예제 코드
### 2.1. 디펜던시 추가

```xml
<dependency>
  <groupId>org.flywaydb</groupId>
  <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
  <groupId>mysql</groupId>
  <artifactId>mysql-connector-java</artifactId>
  <version>8.0.25</version>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

프로젝트 구성은 다음과 같다.
- 스프링 부트 `2.5.3` 버전
- `flyway`, `jpa`,` mysql` 디펜던시 추가



### 2.2. application.properties 설정

```properties
# datasource 연결 설정 
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/springboot
spring.datasource.username=root
spring.datasource.password=root

# sql문 console에 보이도록 설정
spring.jpa.show-sql=true

# validation check
spring.jpa.hibernate.ddl-auto=validate
```

- mysql은 docker로 띄워놓고, database는 `springboot` 로 만들었다. 
- `ddl-auto`옵션을 `validate`로 설정해서, DB Schema가 변동이 있다면, 예외가 발생하도록 함



### 2.3. Account 엔티티

```java
@Entity
@Table(name = "account")
public class Account {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

}
```

`id`값과 `name`만 있는 아주 간단한 Account 엔티티를 만들었다. 



### 2.4. db.migration 하위에 V1__init.sql 파일을 생성

![스크린샷 2021-08-04 오후 4 00 39](https://user-images.githubusercontent.com/28615416/128136306-073fdb0d-3e1f-43dd-812e-2e7264d6f3a0.png)
*`V1_init.sql`은 다음 위치에 생성한다.*

`src/main/resources/db.migration/V1__init.sql` 

```sql
DROP TABLE IF EXISTS account;
CREATE TABLE account
(
    id   bigint NOT NULL,
    name VARCHAR(50),
    PRIMARY KEY (id)
);

```

- resource 하위의 db.migration폴더 하위에 `V1__init.sql` (언더 스코어 2개임!!) 파일을 만든다. 
- [파일명 규칙](https://flywaydb.org/documentation/concepts/migrations.html#naming) 
  - ![스크린샷 2021-08-04 오후 3 39 21](https://user-images.githubusercontent.com/28615416/128133776-83efdcaf-fa47-4cb0-899e-08cfb849926f.png)
    *flyway naming pattern*
  - Prefix를 `V`, `U`, `R`  으로 명시한다. 
  - Separator: 언더스코어 2개!!!
  - subfix:  `.sql` 으로 구성한다. 



### 2.5. 프로젝트 실행 

```
2021-08-04 14:36:15.482  INFO 11967 --- [           main] o.f.c.internal.license.VersionPrinter    : Flyway Community Edition 7.7.3 by Redgate
2021-08-04 14:36:15.485  INFO 11967 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2021-08-04 14:36:15.718  INFO 11967 --- [           main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2021-08-04 14:36:15.759  INFO 11967 --- [           main] o.f.c.i.database.base.DatabaseType       : Database: jdbc:mysql://localhost:3306/springboot (MySQL 8.0)
2021-08-04 14:36:15.808  INFO 11967 --- [           main] o.f.core.internal.command.DbValidate     : Successfully validated 1 migration (execution time 00:00.021s)
2021-08-04 14:36:15.826  INFO 11967 --- [           main] o.f.core.internal.command.DbMigrate      : Current version of schema `springboot`: 1
2021-08-04 14:36:15.828  INFO 11967 --- [           main] o.f.core.internal.command.DbMigrate      : Schema `springboot` is up to date. No migration necessary.
```

로그를 보면, `Successfully validated 1 migration`이 나왔다. 



### 2.6. DB를 확인해보자.
실제 DB를 확인해보면 다음과 같다. 

![스크린샷 2021-08-04 오후 2 40 58](https://user-images.githubusercontent.com/28615416/128127972-025a231a-5871-4ef7-a59b-3821b39ccdef.png)
*flyway_schema_history 테이블 자동 생성*

flyway_schema_history라는 테이블이 생겼고, `누가 실행`했고, `언제` 했고, `성공 여부`, `적용된 스크립트 파일명` 등등이 history테이블에 기록이 된다. 



![스크린샷 2021-08-04 오후 3 00 30](https://user-images.githubusercontent.com/28615416/128129791-b2388913-9392-42ed-85b0-9d4c3cf05560.png)
*account table*

물론 account 테이블도 정상적으로 만들어졌다.



### 2.7. 새로운 컬럼을 추가해보자

```java
@Entity
@Table(name = "account")
public class Account {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Integer age; // age 컬럼을 새롭게 추가한다.
}
```

`age` 컬럼을 새로 추가하고, 프로젝트를 실행하면 다음과 같이 예외가 난다. 

```
org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'entityManagerFactory' defined in class path resource [org/springframework/boot/autoconfigure/orm/jpa/HibernateJpaConfiguration.class]: Invocation of init method failed; nested exception is javax.persistence.PersistenceException: [PersistenceUnit: default] Unable to build Hibernate SessionFactory; nested exception is org.hibernate.tool.schema.spi.SchemaManagementException: Schema-validation: missing column [age] in table [account]
...
```

`Schema-validation: missing column [age] in table [account]`  와 같이, account 컬럼에 age값이 추가 되지 않았다고 한다. 



### 2.8. V2__add_age_column.sql 파일을 추가한다.

`src/main/resources/db.migration/V2__add_age_column.sql`  파일을 추가해준다. 

```sql
ALTER TABLE account ADD COLUMN age INT(10) ;
```
해달 파일을 추가하고 프로젝트를 다시시작하면 다음과 같이 컬럼이 정상적으로 추가된다.

### 2.9. 결과 확인

![스크린샷 2021-08-04 오후 3 02 53](https://user-images.githubusercontent.com/28615416/128130206-09e994ce-15f7-4a7f-b528-830f5a3e16ab.png)
*account table에 age컬럼이 추가됨*


![스크린샷 2021-08-04 오후 3 04 02](https://user-images.githubusercontent.com/28615416/128130210-06e0beb0-f839-4ee0-a257-1ffdc37becff.png)
*fly_schma_history 2번째 ROW 생성*

또한, flyway_schema_history 테이블에도 2번째 스크립트가 실행된것을 확인할 수 있다.

## 3. 정리 
- DB migration툴인 Flyway의 간단한 사용방법에 대해서 알아보았다. 
- 공부하면 좋을것들 
  -  DB 스키마 버져닝 외에 Undo, Repeatable과 같은 다른 Option에 대해서도 알아봐야겠다.
  -  Flyway 아키텍쳐, checksum 검증 방식 등등.. 
- 실 운영의 경험이 없기 때문에, 아직은 내용이 풍부하지 않다, 추후에 관련해서 따로 업데이트 해야겠다.