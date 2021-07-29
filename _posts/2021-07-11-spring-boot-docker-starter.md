---
layout: post
title: Spring Boot, Dockerfile로 이미지 생성, 배포하기
date: 2021-07-11 18:18 +0900
image: 'https://pbs.twimg.com/profile_images/1273307847103635465/lfVWBmiW_400x400.png'
tags: [spring, docker, dockerfile, spring-boot, intellij]
toc: true
description: SpringBoot프로젝트, Dockerfile을 만들어서 이미지를 생성하고 배포해보자!
---
간단한 SpringBoot 프로젝트를 만들고, Dockerfile을 통해서 애플리케이션을 docker이미지 파일로 만들고, 실행해보고, docker hub에 remote로 푸시하는 방법에 대해서 알아보자 
## 1. Sample 프로젝트 만들기 

`pom.xml`파일에 `spring-boot-starter-web` web모듈을 추가하고 루트로 요청이 왔을때 hello world 바디를 리턴하는 간단한 프로젝트를 만들어 보자!  

```java
@RestController
public class HelloController {

    @GetMapping("/")
    public String home() {
        return "hello world";
    }
}
```



## 2. Dockerfile 만들기 

> Dockerfile은 인프라스트럭쳐의 프로비저닝(서버 환경 셋팅)이라고 생각하면 된다. `docker build`라는 명령어를 통해서 Docker가 Dockerfile을 읽어서 자동으로 도커 이미지를 빌드한다.



```dockerfile
FROM adoptopenjdk/openjdk11
CMD ["./mvnw", "clean", "package"]
ARG JAR_FILE_PATH=target/*.jar
COPY ${JAR_FILE_PATH} app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

- Dockerfile는 최상위 루트 프로젝트 경로에 위치한다. 파일 이름은 `Dokcerfile`이라고 저장해야 한다.
- Dockerfile에 정의한 순서대로 (recursive하게) 읽어서 Docker 데몬에 해당 명령어를 실행한다.
- 반드시 `FROM` 키워드로 시작해야 한다. 
  - adoptopenjdk/openjdk11 버전을 pull 받는다. 
  - alphain 버전이 11버전에서는 아직까지 지원하지 않는다. alphain 버전은 20MB 정도 가벼운 버전이다. 
- `CMD`  키워드도 무조건 한번만 사용할 수 있다. 
  - 여기에서는 mvnw(maven wrapper) 를 통해서 해당 프로젝트를 빌드를 한다 .
- `ARG` 키워드는 Argument로 JAR_FILE_PATH 라는 변수명에 target/*.jar 경로를 담았다. 
- `COPY`키워드는 위에서 할당한 변수명을 `app.jar`이름으로 복사했다. 
- `ENTRYPOINT` 는 java를 실행하는 parameter를 담았다. 


> 자세한 내용은 Docker 레퍼런스를 확인 하자!  
> 
> [https://docs.docker.com/engine/reference/builder/](https://docs.docker.com/engine/reference/builder/)


> 추가로 Spring Boot 진영에서 Dockerfile에 대해서 포스팅한 글이 있다. 
> 더 다채롭게? 다양하게 JAVA_OPTION 이라든지, shell script로 실행한다든지, 다양한 방법들이 존재한다. 
> 아래 사이트에서 확인하자!
> [https://spring.io/guides/topicals/spring-boot-docker](https://spring.io/guides/topicals/spring-boot-docker)



## 3. Dockerfile로 이미지 빌드하기 

```shell
$ docker build -t docker-example:0.0.1 .
```
- 해당 프로젝트에서 terminal을 실행시켜 `build` 명령어로 `-t` 태그 옵션을 줘서 name:tag 줘서 빌드한다,
- 해당 명령어(`build)`는 프로젝트 루트에 있는 Dockerfile을 읽어서, docker 데몬이 실행을 순차적으로 진행한다. 


```shell
$ docker images #images 명령어로 docker이미지가 제대로 만들어 졌는지 확인한다.

## 다음과 같이 이미지가 만들어 졌다. 
REPOSITORY       TAG            IMAGE ID       CREATED       SIZE
docker-example   0.0.1          378107e4a39d   3 hours ago   454MB
```

```shell
$ docker run docker-example:0.0.1
```
- 다음과 같이 해당 이미지 파일을 실행하면, spring boot 프로젝트가 뜬다. 
- `$ curl localhost:8080/` 루트 경로로 요청하면, `hello world` 바디 값을 리턴한다. 


## 4. IntelliJ의 docker 플러그인으로 활용하기 

IntelliJ에서 Docker플러그인을 설치하고, IntelliJ GUI상에서 Docker 이미지, 컨테이너, 파일경로, 로깅과 같은 것들을 Context switching 없이 IntelliJ에서 사용하는 방법을 보여준다. 사실 Docker라는 명령어만으로도 충분하지만, IntelliJ에서 제공해 주는 편리한 플러그인 + 관리 포인트를 한군데로 하는것을 좋아하기 때문에 찾아보게 되었다. 

> 더 자세한 내용은 IntelliJ의 Docker 플러그인에 대한 학습편을 살펴보자. 
>
> [https://www.jetbrains.com/help/idea/docker.html](https://www.jetbrains.com/help/idea/docker.html)



### 4.1. Docker 플러그인 설치 

- 기본 설치되어 있다. 없다면 설치하자! 

### 4.2. Docker Integration 설정 (with IntelliJ)

![스크린샷 2021-07-11 오후 5 41 12](https://user-images.githubusercontent.com/28615416/125188713-b9b7a680-e26f-11eb-9ab7-cb05378d0f99.png)

- `cmd + ,` 설정 창을 연다. 
- Build, Execution, Deployment 의 Docker를 클릭한다.
- Docker for Mac을 (로컬에 이미 Docker를 설치했다는 전체하에) 선택한후 OK를 누른다. 

### 4.3. Docker Connect

![screnshot](https://user-images.githubusercontent.com/28615416/125189896-5f214900-e275-11eb-8d0c-4b42b57f6876.png)



- Docker를 설정한 후에, 다음과 같이 Service 영역에서 Docker가 연결이 되었다. 
- Docekr를 `우클릭`을 누르고, `Connect`를  누르면, 로컬에 설치한 Docker와 연결을 맺는다. 
- 그리고 나면 다음과 같이 Docker `이미지들`, 실행중인 `컨테이너`들이 목록이 나온다.

### 4.4. Docker Push Image

![스크린샷 2021-07-11 오후 5 51 03](https://user-images.githubusercontent.com/28615416/125188939-c1c41600-e270-11eb-99c5-444276945fec.png)

- 로컬에서 다운 받았던 Docker 이미지들 목록이 나온다. 
- 우리는 위에서 만들었던 `docker-example:0.0.1` 이미지를 `우클릭`  눌러서 `Create Container(컨테이너를 실행)`할 수도 있고, `Push Image..`를 통해서 내 개인 계정의 Docker Hub에 올릴수 있다. 
- 지금 예제에서는 내가 만든 Docker이미지를  Docker Hub에 올려보도록 하자. 
- 2번 `Push Image...` 를 클릭한다. 



![스크린샷 2021-07-11 오후 5 54 59](https://user-images.githubusercontent.com/28615416/125189078-6b0b0c00-e271-11eb-83cc-24e884623681.png)

- 다음과 같이 Push Image에 Repository 명과 Tag명을 입력한다. 
  - 그 전에 Docker Registry가 등록이 안되어있다면, 1번의 `New`버튼을 눌러서 Registry를 등록하자 (username, passwrod)
- OK 버튼을 클릭한다. 
- docker hub로 push가 되고, 다음과 같이 자신의 Docker hub에 해당 이미지가 올라간것을 확인 하자! 

### 4.5. Docker Hub에서 확인

![스크린샷 2021-07-11 오후 3 42 38](https://user-images.githubusercontent.com/28615416/125189149-9d1c6e00-e271-11eb-85ac-a9241dd65b3f.png)



## 5. 정리 

- 간단한 SpringBoot 프로젝트를 만들고, Dockerfile를 설정하고, Dockerfile을 읽어서 자동으로 build해서 docker-exampel 이미지를 만들었다. 
- 만들어진 이미지를 단순한 docker command line이 아닌, IntelliJ의 Docker 플러그인과 연동해서 조금더 쉽게 사용하는 방법도 알아봤다.



