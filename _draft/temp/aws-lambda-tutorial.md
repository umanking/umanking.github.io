---
title: AWS Lambda 튜토리얼
date: 2020-11-03 13:31:40
---

AWS 람다 서비스는 serverless로 서버에 대한 운영을 AWS Lambda 서비스로 제공한다. 기존의 프로그래밍과 다른 방식은 상태값을 유지하지 못하는 stateless이고, 매번 lambda function이 호출되는 것이 비동기이기 때문에 그런것들을 생각하면서 프로그래밍 해야 한다.~

<!-- more -->

## 함수 만들기 

<img width="1756" alt="스크린샷 2020-11-03 오후 12 50 52" src="https://user-images.githubusercontent.com/28615416/97948448-f6bfc500-1dd3-11eb-994f-fad0ae7bc405.png">

1) AWS lambda에서 `함수생성` 버튼을 클릭



<img width="1297" alt="스크린샷 2020-11-03 오후 12 52 08" src="https://user-images.githubusercontent.com/28615416/97948452-f7f0f200-1dd3-11eb-92ef-4172134372fd.png">

2) `함수 이름`과 런타임시에 작성할 `언어`, `권한 설정` , `고급설정(네트워크VPC)` 를 합니다. 

여기에서는 간단하게 

- 함수 이름: lambda-test
- 런타임 언어: node js 
- 권한 기본 설정: 추가로 IAM 설정으로 권한을 설정해야 한다!



3) 함수 생성 버튼 클릭 

다음과 같이 결과가 만들어 진다. 

![Uploading 스크린샷 2020-11-03 오후
<img width="1559" alt="스크린샷 2020-11-03 오후 1 01 13" src="https://user-images.githubusercontent.com/28615416/97949109-ed375c80-1dd5-11eb-9f8b-ccfb7263f2bb.png">
 1.01.57.png…](https://user-images.githubusercontent.com/28615416/97949109-ed375c80-1dd5-11eb-9f8b-ccfb7263f2bb.png)



## 트리거 추가(API Gateway)

4) 트리거 추가

lambda-test 함수가 만들어 졌고, 이를 연결할 엔드 포인트가 필요해서, `+ 트리거 추가` 버튼을 누른다.

<img width="775" alt="스크린샷 2020-11-03 오후 1 16 54" src="https://user-images.githubusercontent.com/28615416/97949413-e3622900-1dd6-11eb-870f-15ca1007a010.png">



5) 다음과 같이 트리거 구성을 `API 게이트 웨이` 로 선택한다. API생성 (REST API) 

보안은 API 엔드포인트에 대해서 열어 줄것이냐? 마냐? 일단 테스트 이기 때문에 `열기` 를 선택하고 

`추가` 버튼을 클릭한다. 



<img width="1237" alt="스크린샷 2020-11-03 오후 1 18 47" src="https://user-images.githubusercontent.com/28615416/97949494-1d332f80-1dd7-11eb-885b-9f231502cb77.png">

6)  API 게이트웨이가 연동이 되었고, API 게이트웨이 상세 정보를 보면 API 엔드포인트주소가 매핑되었다. 

해당 URL를 클릭하면 serverless로 잘 동작하는 것을 확인할 수 있다. 





## API Gateway 테스트 

API gateway에서 실제 매핑된 lambda 함수를 테스트 할 수 있다. 

다음과 같이 `테스트 ⚡️` 버튼을 클릭한다.

<img width="1313" alt="스크린샷 2020-11-03 오후 1 21 51" src="https://user-images.githubusercontent.com/28615416/97949686-ca0dac80-1dd7-11eb-99b3-baddbc378697.png">





호출할 메서드, 쿼리 문자열, 헤더 정보를 입력하고 테스트 버튼을 클릭한다.

<img width="617" alt="스크린샷 2020-11-03 오후 1 22 20" src="https://user-images.githubusercontent.com/28615416/97949690-cda13380-1dd7-11eb-9574-781db58060fc.png">





결과는 오른쪽 탭에 나온다. 

- 상태값
- 지연시간 
- 본문 
- 헤더 
- 요청 / 응답에 대한 로그

<img width="1125" alt="스크린샷 2020-11-03 오후 1 22 56" src="https://user-images.githubusercontent.com/28615416/97949691-ce39ca00-1dd7-11eb-8c7d-5545ca70cb0c.png">







## 정리

기본 lambda 함수를 만들고, API gateway 로 연결했다. 

그 외에도, CORS, IAM 설정, 대상(target)에 대한 설정등 더 알아보고 추가로 포스팅 예정!
