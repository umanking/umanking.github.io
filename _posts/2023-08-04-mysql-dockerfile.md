---
layout: post
title: MySQL Docker 컨테이너 만들기(Dockerfile)
date: 2023-08-04 22:05 +0900
image: https://logos-world.net/wp-content/uploads/2021/02/Docker-Logo.png
tags: [mysql, dockerfile, docker]
---
# 제목: MySQL Docker 컨테이너 만들기: 상세 가이드

## 소개

이 블로그에서는 Docker를 사용하여 MySQL 데이터베이스를 실행하는 방법을 상세히 알아보겠습니다. Docker는 컨테이너 기반의 가상화 기술로서, 애플리케이션과 모든 종속성을 컨테이너로 패키징하여 빠르고 효율적인 배포를 가능하게 합니다. MySQL 데이터베이스를 Docker 컨테이너로 실행하는 과정을 단계별로 안내하며, 데이터베이스 설정과 데이터 보존에 대한 고려 사항도 다루겠습니다.

## MySQL Docker 이미지 가져오기

MySQL 공식 Docker 이미지를 Docker Hub에서 가져옵니다. 터미널 또는 명령 프롬프트에서 다음 명령어를 실행합니다.

```bash
docker pull mysql:latest
```

## Dockerfile 작성

MySQL 데이터베이스를 실행하는데 사용할 Dockerfile을 작성합니다.

```Dockerfile
# Dockerfile

# MySQL 이미지를 기반으로 이미지 생성
FROM mysql:latest

# MySQL 설정
ENV MYSQL_ROOT_PASSWORD=my-secret-pw
ENV MYSQL_DATABASE=mydb
ENV MYSQL_USER=myuser
ENV MYSQL_PASSWORD=mypassword

# 포트 설정 (기본 MySQL 포트는 3306)
EXPOSE 3306
```

## Docker 이미지 빌드

작성한 Dockerfile을 사용하여 Docker 이미지를 빌드합니다.

```bash
docker build -t my-mysql-image .
```

## Docker 컨테이너 실행

이제 빌드한 Docker 이미지를 기반으로 MySQL 컨테이너를 실행합니다.

```bash
docker run -d --name my-mysql-container -p 3306:3306 my-mysql-image
```

## 데이터베이스 설정

MySQL 컨테이너를 실행한 후에는 데이터베이스 설정을 진행해야 합니다. 컨테이너에 로그인하여 MySQL 서버에 접속합니다.

```bash
docker exec -it my-mysql-container mysql -u root -p
```

위 명령어를 실행하면 비밀번호를 입력하라는 메시지가 표시됩니다. 비밀번호를 입력한 후 MySQL 서버에 접속합니다.

### 데이터베이스 및 사용자 생성

```sql
CREATE DATABASE mydb;
CREATE USER 'myuser'@'%' IDENTIFIED BY 'mypassword';
GRANT ALL PRIVILEGES ON mydb.* TO 'myuser'@'%';
FLUSH PRIVILEGES;
```

위 쿼리를 실행하여 데이터베이스와 사용자를 생성하고 권한을 부여합니다.

## 데이터베이스 보존

MySQL 컨테이너를 중지하거나 삭제하더라도 데이터베이스를 보존하려면 데이터를 볼륨으로 유지해야 합니다.

```bash
docker run -d --name my-mysql-container -p 3306:3306 -v /my/mysql/data:/var/lib/mysql my-mysql-image
```

위 명령어에서 `-v` 옵션을 사용하여 호스트 머신의 `/my/mysql/data` 디렉토리를 컨테이너의 `/var/lib/mysql` 디렉토리와 연결합니다. 이렇게 하면 MySQL 데이터베이스 파일이 호스트 머신의 디렉토리에 보존되므로 컨테이너를 삭제해도 데이터가 유지됩니다.

## 결론

이 블로그에서는 Docker를 사용하여 MySQL 데이터베이스를 실행하는 방법을 상세히 다루었습니다. Dockerfile을 작성하고, Docker 이미지를 빌드하며, MySQL 컨테이너를 실행하는 과정을 단계별로 설명하였습니다. 데이터베이스 설정과 데이터 보존에 대한 중요한 사항들을 다루었으니, MySQL 컨테이너를 활용하여 데이터베이스를 효율적으로 관리할 수 있기를 바랍니다. Happy coding with Docker!