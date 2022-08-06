---
layout: post
title: Docker M1 MySQL 설치
date: 2022-08-06 14:07 +0900
description: local에서 docker를 이용해서 mysql 를 셋팅하는 방법에 대해서 알아보자.
image: 'https://download.logo.wine/logo/MySQL/MySQL-Logo.wine.png'
tags:
- [docker, mysql]
---

# Docker M1 MySQL 설치

local에서 docker를 이용해서 mysql 를 셋팅하는 방법에 대해서 알아보자.



## Docker MySQL 실행

```shell
docker pull --platform linux/amd64 mysql:8.0.28
```

- `docker pull` 명령어는 mysql:8.0.28 버전대의 image를 docker hub에서 pull 받겠다는 의미
- m1 macbook 인 경우에는 `--platform linux/amd64` 를 지정해야 한다.



```shell
docker run --platform linux/amd64 --name mysql -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=1234 mysql:8.0.28
```

- `docker run` 명령어는 컨테이너를 만들고(create), 컨터이너를 실행한다(start)
- m1 macbook 인 경우에는 `--platform linux/amd64` 를 지정해야 한다.
- --name 옵션: 컨테이너의 이름을 지정한다.
  - 이름이 중복되면 conflict 난다. 
  - 실행중인 컨테이너의 정보를 보려면 `docker ps -a`  커맨드를 통해서 확인가능하다.
- -d 옵션: background에서 동작 
- -p 옵션: port 매핑 
- -e 옵션: environment 환경 설정 key, value 형태로 보낸다. 
  - MYSQL 접속 : root / 1234 



```shell
docker exec -it mysql bash
```

- `docker exec` 명령어는 실행중인 컨테이너(여기에서는 mysql 컨테이너)에, 그 뒤에 오는 명령어를 실행한다. 
- -i 옵션: STDIN 표준 입출력을 열고
- -t 옵션: 가상 tty(pseudo-TTY)를 통해서 접속하겠다는 의미



## 한글 인코딩 설정 

```sh
root@32f08c0def9e:/# vi /etc/mysql/my.cnf
```

- etc/mysql하위의 my.cnf 파일을 수정한다.

- 다음과 같은 내용을 추가한다.

  - ```sh
    [client]
    default-character-set = utf8
    
    [mysqld]
    init_connect = "SET collation_connection = utf8_general_ci"
    init_connect = "SET NAMES utf8"
    character-set-server = utf8
    collation-server = utf8_general_ci
    
    [mysql]
    default-character-set = utf8
    ```

    

> docker container에서 vim설치가 안되어있다면 다음 명령어를 통해서 vim을 설치한다.
>
> $ apt-get update 
>
> $ apt-get install vim



```sh
mysql -uroot -p1234
mysql> show variables like 'c%'; 

+----------------------------------------------+--------------------------------+
| Variable_name                                | Value                          |
+----------------------------------------------+--------------------------------+
| caching_sha2_password_auto_generate_rsa_keys | ON                             |
| caching_sha2_password_digest_rounds          | 5000                           |
| caching_sha2_password_private_key_path       | private_key.pem                |
| caching_sha2_password_public_key_path        | public_key.pem                 |
| character_set_client                         | utf8mb3                        |
| character_set_connection                     | utf8mb3                        |
| character_set_database                       | utf8mb4                        |
| character_set_filesystem                     | binary                         |
| character_set_results                        | utf8mb3                        |
| character_set_server                         | utf8mb4                        |
| character_set_system                         | utf8mb3                        |
| character_sets_dir                           | /usr/share/mysql-8.0/charsets/ |
| check_proxy_users                            | OFF                            |
| collation_connection                         | utf8_general_ci                |
| collation_database                           | utf8mb4_0900_ai_ci             |
| collation_server                             | utf8mb4_0900_ai_ci             |
| completion_type                              | NO_CHAIN                       |
| concurrent_insert                            | AUTO                           |
| connect_timeout                              | 10                             |
| connection_memory_chunk_size                 | 8912                           |
| connection_memory_limit                      | 18446744073709551615           |
| core_file                                    | OFF                            |
| create_admin_listener_thread                 | OFF                            |
| cte_max_recursion_depth                      | 1000                           |
+----------------------------------------------+--------------------------------+
24 rows in set (0.03 sec)
```

- mysql에 직접 접속해서 character_set을 확인하면  utf8로 변경된것을 확인할 수 있다.
- `docker restart mysql`를 통해서 재시작한다



