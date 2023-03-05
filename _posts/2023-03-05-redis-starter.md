---
layout: post
title: "Redis 시작하는 방법"
date: 2023-03-05 10:36 +0900
description: 이번 포스트에서는 Redis를 시작하는 방법에 대해 다루겠습니다.
image: https://dwglogo.com/wp-content/uploads/2017/12/1100px_Redis_Logo_01.png
tags: [redis]
---
# Redis 시작하는 방법

## Introduction

Redis는 오픈소스 기반의 인-메모리 데이터베이스로서, 빠른 속도와 높은 확장성을 제공합니다. 이러한 이점들로 인하여 Redis는 대규모 유저와 데이터를 다루는 서비스에서 매우 인기 있는 데이터베이스입니다. 하지만 Redis는 처음 사용하는 사람들에게는 다소 어려울 수 있는데, 이번 포스트에서는 Redis를 시작하는 방법에 대해 다루겠습니다.

## Redis 설치하기

Redis를 사용하기 위해서는 먼저 Redis를 설치해야 합니다. Redis의 공식 홈페이지에서는 Redis를 손쉽게 설치할 수 있는 방법을 제공합니다. 운영체제에 따라 설치 방법이 다르므로, Redis 공식 홈페이지에서 자신의 운영체제에 맞는 설치 방법을 찾아 설치하면 됩니다.

### Redis CLI로 설치하기

Redis를 설치하는 또 다른 방법은 Redis CLI(Command Line Interface)를 사용하는 것입니다. Redis CLI를 사용하면 Redis를 더욱 쉽고 빠르게 설치할 수 있습니다.

먼저, Redis 공식 홈페이지([https://redis.io/download](https://redis.io/download))에서 Redis 소스 코드를 다운로드합니다.
Terminal(또는 Command Prompt)에서 다운로드한 Redis 소스 코드를 압축 해제합니다.

```shell
$ tar xvzf redis-6.2.1.tar.gz
```

압축 해제한 폴더로 이동합니다.

```shell
$ cd redis-6.2.1
```

Redis를 빌드합니다.

```shell
$ make
```

Redis를 실행합니다.

```shell
$ src/redis-server
```

1. Redis CLI를 실행합니다.

```shell
$ src/redis-cli
```

이제 Redis CLI를 사용하여 Redis 데이터베이스에 연결하여 데이터를 저장하고 조회할 수 있습니다.

### Redis를 homebrew를 이용하여 설치하는 방법은 다음과 같습니다.

터미널을 열어 homebrew를 최신 버전으로 업데이트합니다.

```shell
$ brew update
```

Redis를 설치합니다.

```shell
$ brew install redis
```

Redis를 실행합니다.

```shell
$ redis-server
```

Redis CLI를 실행합니다.

```shell
$ redis-cli
```

이제 Redis CLI를 사용하여 Redis 데이터베이스에 연결하여 데이터를 저장하고 조회할 수 있습니다.

## Redis 사용하기

Redis를 설치한 후에는 Redis를 사용할 수 있습니다. Redis는 데이터를 메모리에 저장하기 때문에, 메모리 용량이 중요합니다. Redis를 사용하기 위해서는 Redis 서버를 실행해야 합니다. Redis 서버를 실행하려면 터미널에서 `redis-server` 명령어를 입력하면 됩니다. Redis 서버가 실행되면, Redis 클라이언트를 사용하여 Redis 데이터베이스에 데이터를 저장하고 조회할 수 있습니다.

## Redis 기본 명령어

Redis를 사용하기 위해서는 기본적인 명령어를 알아야 합니다. Redis에서 가장 많이 사용하는 명령어는 다음과 같습니다.

- SET: key-value 형태의 데이터를 저장합니다.
- GET: key에 해당하는 value를 가져옵니다.
- DEL: key에 해당하는 데이터를 삭제합니다.
- INCR/DECR: key에 해당하는 value를 1 증가/감소시킵니다.
- `HSET`: hash 형태의 데이터를 저장합니다. key, field, value 3가지 인자를 받아 데이터를 저장합니다.
    - 예) `HSET user id 1234`: `user`라는 hash에 `id`라는 field와 `1234`라는 value를 저장합니다.
- `HGET`: key, field 2가지 인자를 받아 데이터를 조회합니다.
    - 예) `HGET user id`: `user`라는 hash에서 `id`라는 field에 해당하는 value를 조회합니다.
- `HMSET`: hash 형태의 데이터를 여러 개 저장합니다. key, field1, value1, field2, value2...와 같은 형태로 인자를 받아 여러 개의 데이터를 저장합니다.
    - 예) `HMSET user id 1234 name John age 25`: `user`라는 hash에 `id`, `name`, `age`라는 field와 각각에 해당하는 value를 저장합니다.
- `HGETALL`: key 1개 인자만 받아 해당하는 hash의 모든 field와 value를 조회합니다.
    - 예) `HGETALL user`: `user`라는 hash에 저장된 모든 데이터를 조회합니다.

hash 형태의 데이터를 사용하면, 여러 개의 관련된 정보를 하나의 key로 묶어서 저장하고 조회할 수 있어 매우 효율적입니다.

이러한 Redis의 기본 명령어를 익히면, Redis를 보다 효율적으로 사용할 수 있습니다.

### Redis 권장하지 않는 명령어들

Redis에서 권장하지 않는 명령어는 `FLUSHALL`과 `FLUSHDB`입니다. 이 명령어들은 Redis 데이터베이스의 모든 데이터를 삭제하므로, 실수로 사용할 경우 데이터 손실이 발생할 수 있습니다. 대신에 `DEL` 명령어를 사용하여 key에 해당하는 데이터를 삭제하는 것이 좋습니다.

또한, Redis에서 권장하지 않는 명령어는 `KEYS`입니다. 이 명령어는 Redis 데이터베이스의 모든 key를 조회하므로, Redis 데이터베이스의 크기가 커질수록 처리 시간이 길어지며 Redis 서버의 성능을 저하시킬 수 있습니다. 대신에 더욱 효율적인 명령어를 사용하여 데이터를 조회하는 것이 좋습니다.

## 결론

Redis는 빠른 속도와 높은 확장성을 제공하는 인-메모리 데이터베이스입니다. Redis를 사용하기 위해서는 Redis를 설치하고, Redis 서버를 실행한 후에 Redis 클라이언트를 사용하여 데이터를 저장하고 조회할 수 있습니다. 또한 Redis에서 가장 많이 사용하는 기본 명령어를 익히면 Redis를 더욱 효율적으로 사용할 수 있습니다. Redis를 처음 사용하는 사람이라면 이번 포스트를 참고하여 Redis를 시작해보세요.
