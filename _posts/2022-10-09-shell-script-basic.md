---
layout: post
title: shell script 기초
date: 2022-10-09 12:39 +0900
description: shell script 기초 문법, 배열, 입출력, 함수, if else, 조건식에 대해서 알아본다.
image: 
tags: 
---
# shell script 기초

## Overview

- shell script를 만들고, 권한을 부여해 실행하는 방법에 대해서 알아본다.
- 입력, 출력하는 방법에 대해서 알아본다.
- 변수 선언, 변수 치환에 대해서 알아본다.
- if, switch, loop, 함수 작성하는 방법에 대해서 알아본다.


## shell script 기초

### shell script 선언

파일 생성후(`test.sh`) 맨 상단에 `#!/bin/sh`를 선언해주어야 한다.

```bash
#!/bin/sh
```

### 파일의 실행권한을 부여

```bash
$ sudo chmod +x 'shell 파일명'
$ sudo chmod 755 'shell 파일명'
$ sudo chmod +x test.sh
```

###  shell script 실행 하는 방법

다음 방법중에 하나로 실행하면 된다.

```bash
$ ./test.sh
$ sh test.sh
$ bash test.sh
```



## **입/출력**

입력은 read로 출력은 echo를 통해서 한다.

```bash
#!/bin/sh

read name
echo "hello, $name"
$ ./test.sh #shell 실행
andrew #값 아무거나 입력
hello, andrew # 결과 출력
```

## **변수**

- 변수의 이름으로는 영문자 대소문자, 숫자, 언더바를 사용하고, 필자는 대문자 언더바(MY_NAME)과 같이 사용한다.
- 변수의 값은 보통은 ""(쌍따옴표)를 이용하는데, ''(홑따옴표)나 그냥 문자열을 입력해도, 출력은 됩니다. 하지만 권장 사항은 ""쌍따옴표를 사용하는 것을 추천합니다.

```bash
#!/bin/sh

myname='andrew'
MY_NAME1="betty"
MY_NAME2=didi

echo $myname
echo $MY_NAME1
echo $MY_NAME2
```

### **특별한 변수**

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

## **변수 치환**

| 문법               | 설명                                                         |
| ------------------ | ------------------------------------------------------------ |
| $name 또는 ${name} | 해당 변수값을 치환                                           |
| ${name:=andrew}    | 변수가 아직 셋팅되지 않거나 공백 문자열의 경우, andrew를 반환하고, name변수에 저장함 ✅ |
| ${name:-andrew}    | 변수가 아직 셋팅되지 않거나 공백문자열의 경우, andrew를 반환하고, name변수에 저장되지 않음 |
| ${name:+andrew}    | 변수가 셋팅되지 않은 경우에, andrew를 반환하고, name변수에 저장되지 않음 |
| ${name:?andrew}    | name값이 없으면 변환에 실패하고, 에러를 표시한다.            |

이렇게 써놨지만 사실 그냥 변수 치환 정도만 쓰임!!

## **배열**

```bash
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

```bash
$./test.sh
FRUIT_ARRAY[0]: kiwi
FRUIT_ARRAY[1]: banana
FRUIT_ARRAY[*]: kiwi banana orange
FRUIT_ARRAY[@]: kiwi banana orange
```

## **오퍼레이터**

산수연산은 `expr 1 + 1`와 같이 한다.

| 연산자 | 의미   | 예                                                        |
| ------ | ------ | --------------------------------------------------------- |
| +      | 덧셈   | echo `expr 1 + 1` → 2                                     |
| -      | 뺄셈   | echo `expr 2 - 1` → 1                                     |
| /*     | 제곱   | echo `expr 2 \\* 2` → 4                                   |
| /      | 나눗셈 | echo `expr 10 / 2` → 5                                    |
| %      | 나머지 | echo `expr 10 / 4` → 2                                    |
| =      | 값대입 | a=$b  (b의 값은 a에 저장된다.)                            |
| ==     | 동일   | [ “$a” == “$b” ] $a와 $b가 동일한 경우 TRUE를 반환        |
| !=     | 다름   | [ “$a” != “$b” ] $a와 $b가 동일하지 않는 경우 TRUE를 반환 |

## if 조건문

if문에 들어갈 조건식

| 비교 | 의미                  | 예                                                           |
| ---- | --------------------- | ------------------------------------------------------------ |
| -eq  | 동일                  | [ "$a" -eq "$b" ]  $a와 $b가 동일한 경우 TRUE 반환           |
| -ne  | 다름                  | [ "$a" -ne "$b" ]  $a와 $b가 다른 경우 TRUE 반환             |
| -gt  | 보다 큼               | [ "$a" -gt "$b" ]  $a가 $b 보다 큰 경우에 TRUE 반환          |
| -lt  | 보다 작음             | [ "$a" -lt "$b" ] $a가 $b 보다 작은 경우에 TRUE 반환         |
| -ge  | 보다 크거나 같음      | [ "$a" -ge "$b" ] $a가 $b 보다 크거나 같은 경우에 TRUE 반환  |
| -le  | 보다 작거나 같음      | [ "$a" -le "$b" ] $a가 $b 보다 작거나 같은 경우에 TRUE 반환  |
| !    | 가 아니다             | [ ! "$a" -gt "$b" ]$a가 $b보다 크지 않은 경우 TRUE가 반환    |
| -o   | 어느쪽이든 (          |                                                              |
| -a   | 양쪽 (&&)             | [ "$a" -gt 90 -a "$a" -lt 100 ] $a가 90보다 크고 100보다는 작은 경우 TRUE 반환 |
| -z   | 문자열이 비었는가     | [ -z "$a" ]$a에 어떤 것도 지정되지 않은 경우 TRUE 반환       |
| -n   | 문자열이 지정되었는가 | [ -n "$a" ] $a에 어떠한 것이 지정되어 있다면 TRUE 반환       |

if문 기본 문법(`if-else`)은 다음과 같다.

```bash
if [ 조건식 ]
then 
	echo '조건식이 참인경우'
else 
	echo '조건식이 거짓인경우'
fi
```

`if-elseif-else` 문법은 다음과 같다.

```bash
#!/bin/sh
if [ 조건식 ]
then 
	echo '조건식이 참인경우'
elif [ 다른 조건식 ]
then
	echo '다른조건이 참인경우'
else 
	echo '모든 조건식이 거짓인경우'
fi
```

## switch case

```bash
#!/bin/sh
FRUIT=apple

case $FRUIT in 
	"apple") echo "사과";;
	"orange") echo "오렌지";;
	"banana") echo "바나나";;
esac
```

## 루프 (반복문)

### while loop

- 해당 조건과 일치할때 반복

```bash
#!/bin/sh 

a=0
while [ $a -lt 5 ]
do 
	echo $a # a를 출력
	a=`expr $a + 1` # 1을 더해줌
done
```

- a의 초기값이 0
- 5보다 작은 경우에는 do 문을 실행해서 a의 값을 +1더해줌. 그렇게 반복

### until loop

while과는 반대로, 해당 조건과 일치할 때까지 반복한다.

```bash
#!/bin/sh 
a=0 
until [ ! $a -lt 5 ] 
do 
	echo $a
	a=`expr $a + 1`
done
```

- 조건식이 $a가 `5보다 크거나 같은 경우`를 만족할때까지, do를 실행
- a값이 0,1,2…4 까지 출력하고, +1을 해서 5가 되었을때, 비로소 조건식을 만족하므로 종료

### for loop

```bash
#!/bin/sh 
for val in {0..4}
do 
	echo $val 
done
```

## 함수

```bash
#!/bin/sh 

#함수 작성
myFunction() {
	echo "my function"
}
myParamFunction() {
	echo "인수1: $1 인수2:$2"
}

# 함수 호출 
myFunction
myParamFunction hello world

```

- 함수를 호출할때는 함수이름으로 호출한다.

실행결과

```bash
$./test.sh 
my function
인수1: hello 인수2:world
```

