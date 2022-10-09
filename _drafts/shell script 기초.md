# shell script 기초 



## 들어가기에 앞서

1. 파일 생성후(`test.sh`) 맨 상단에 `#!/bin/sh`를 선언해주어야 한다. 

```shell
#!/bin/sh
```



2. 파일의 실행권한을 부여해야 한다. 

```shell
$ sudo chmod +x 'shell 파일명'
$ sudo chmod 755 'shell 파일명'
$ sudo chmod +x test.sh
```



3. shell script 실행 하는 방법

다음 방법중에 하나로 실행하면 된다. 

```sh
$ ./test.sh
$ sh test.sh 
$ bash test.sh
```





## 입/출력 

입력은 read로 출력은 echo를 통해서 한다. 

```sh
#!/bin/sh 

read name
echo "hello, $name"
```



```sh
$ ./test.sh #shell 실행            
andrew #값 아무거나 입력
hello, andrew # 결과 출력
```





## 변수

- 변수의 이름으로는 영문자 대소문자, 숫자, 언더바를 사용하고, 필자는 대문자 언더바(MY_NAME)과 같이 사용한다. 
- 변수의 값은 보통은 ""(쌍따옴표)를 이용하는데, ''(홑따옴표)나 그냥 문자열을 입력해도, 출력은 됩니다. 하지만 권장 사항은 ""쌍따옴표를 사용하는 것을 추천합니다. 

```sh
#!/bin/sh 

myname='andrew'
MY_NAME1="betty"
MY_NAME2=didi

echo $myname
echo $MY_NAME1
echo $MY_NAME2
```





### 특별한 변수 

- shell script에는 특별한 변수가 있다. `$`로 시작한다. 

| 변수  | 기능                                                         |
| ----- | ------------------------------------------------------------ |
| $0    | 스크립트명                                                   |
| $1~$9 | shell script 실행시 넘기는 인수값. $1은 첫번째 인수, $2는 두번째 인수...$9는 아홉번째 인수 |
| $#    | 스크립트의 전달된 인수의 수                                  |
| $*    | 모든 인수를 모아 하나로 처리                                 |
| $@    | 모든 인수를 각각 처리                                        |
| $$    | 이 쉘스크립트의 프로세스 ID                                  |
| $?    | 직전에 실행한 커맨드의 종료값 (0: 성공, 1: 실패)             |
| $!    | 마지막으로 실행한 백그라운드 프로세스 ID                     |





## 변수 치환

- $name: 해당 변수값을 치환한다.
- ${name}: 해당 변수값을 치환한다.
- ${name:-andrew}: name값이 없으면 andrew로 반환하고, name변수에 저장되지 않음 
- ${name:=andrew}: name값이 없으면 andrew로 반환하고, name변수에 저장함
- ${name:?andrew}: name값이 없으면 변환에 실패하고, 에러를 표시한다. 
- ${name:+andrew}: name값이 없으면 andrew를 반환하고, name변수에 저장되지 않음

이렇게 써놨지만 사실 그냥 변수 치환 정도만 쓰임!!



## 배열

```sh
#!/bin/bash

#배열을 만드는 방법
FRUIT_ARRAY=("apple" "banana" "orange")

# 배열에 인덱스에 값을 셋팅하는 방법
FRUIT_ARRAY[0]="kiwi"

# 개별 아이템 접근 방법
echo "FRUIT_ARRAY[0]: ${FRUIT_ARRAY[0]}"
echo "FRUIT_ARRAY[1]: ${FRUIT_ARRAY[1]}"

#모든 아이템 출력하기
echo "FRUIT_ARRAY[*]: ${FRUIT_ARRAY[*]}"
echo "FRUIT_ARRAY[@]: ${FRUIT_ARRAY[@]}"

```



실행결과

```sh
$./test.sh
FRUIT_ARRAY[0]: kiwi
FRUIT_ARRAY[1]: banana
FRUIT_ARRAY[*]: kiwi banana orange
FRUIT_ARRAY[@]: kiwi banana orange
```





## 오퍼레이터 

산수연산은 `expr 1 + 1`와 같이 한다.













