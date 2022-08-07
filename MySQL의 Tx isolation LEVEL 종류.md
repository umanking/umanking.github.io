MySQL Tranaciton isolation level 



# MySQL Transaction isolation level REPEATABLE_READ 예제



## MySQL의 Tx isolation LEVEL

- READ_UNCOMMITED 
- READ_COMMITED
- REPEATABLE_READ 
- SERIABLIZABLE



![enter image description here](https://i.stack.imgur.com/U9oBZ.png)



아래로 갈수록 isolation level은 강력하지만, 동시성이 떨어진다. 

REPEATABLE_READ의 select / update의 상황을 알아보자. 







## MySQL 격리 수준 확인하기

```sh
mysql> SELECT @@GLOBAL.transaction_isolation;
+--------------------------------+
| @@GLOBAL.transaction_isolation |
+--------------------------------+
| REPEATABLE-READ                |
+--------------------------------+


mysql> SELECT @@SESSION.transaction_isolation;
+---------------------------------+
| @@SESSION.transaction_isolation |
+---------------------------------+
| REPEATABLE-READ                 |
+---------------------------------+

```

- MySQL 5.7.2 이하: tx_isoation 사용 가능
- MySQL 8.0 이상: transaction_isolation 사용
- 별다른 설정을 하지 않으면 기본 `REPEATABLE-READ`로 설정된다. 





## SELECT 문

- READ COMMITED 와 다르게 REPEATABLE_READ는 한 트랜잭션 안에서 반복되는 SELECT를 수행하더라도 읽어 들이는 값이 변화하지 않음을 보장한다. 
- REAPEATABLE_READ 는 select시 해당 operation을 수행한 시간을 기록하고, 그 시점의 snapshot를 만들고, 그 이후에 모든 read operation을 snpashot을 기준으로 해서 `consistent read` 를 하여 조회한다. 
  - `consistent read` 란? read operation을 수행할때 현재 DB값이 아닌 특정 시점의 DB의 snpshot을 읽어오는것.

- Tx B가 먼저 레코드를 조회하고, 이후에 TX A가 해당 레코드를 업데이트하고, commit을 하더라도, TxB는 select를 하면 해당 레코드가 업데이트 되기 전의 값을 읽을 수 있다.TxB가 비로소 commit을 하게 되면 그제서야 업데이트된 레코드를 읽을 수 있다. 
  - 처음 조회를 했을때 Snpshot를 떠 놓기 때문에, 그 시점의 레코드를 읽을 수 있는것
  - 그래서 계속 읽을 수 있기 때문에 REPEATABLE_READ 라고 이름을 붙인듯



```sql
CREATE TABLE `item` (
  `item_id` bigint NOT NULL,
  `count` bigint DEFAULT NULL,
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3

CREATE TABLE `order` (
  `order_id` bigint NOT NULL,
  `count` bigint DEFAULT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
```

두개의 간단한 테이블을 만들고 다음과 같이 데이터를 넣어놓습니다.



```sh
mysql> select * from item;
+---------+-------+
| item_id | count |
+---------+-------+
|       1 |     0 |
|       2 |     0 |
+---------+-------+

mysql> select * from `order`;
+----------+-------+
| order_id | count |
+----------+-------+
|        1 |     0 |
+----------+-------+

```





<img width="1867" alt="Screen Shot 2022-08-06 at 3 18 52 PM" src="https://user-images.githubusercontent.com/28615416/183248971-8d4169c8-41f7-4a8b-baf2-aa108ce99f55.png">

왼쪽을 트랜잭션A, 오른쪽을 트랜잭션B 라고 한다.

- 1번(B): B 트랜잭션 시작
- 2번(B): item 테이블을 조회
- 3번(A): A 트랜잭션 시작
- 4번(A): item 테이블의 count +1 증가 update 쿼리 
- 5번(A): item 테이블 조회 -> **count 값이 1 증가 했습니다.** ✅
- 6번(B): item 테이블 조회 -> **count값이 변동이 없습니다.** 
- 7번(A): A 트랜잭션을 commit합니다.
- 8번(B): item 테이블 조회 -> **count 값이 변동이 없습니다.**
- 9번(B): B 트랜잭션을 commit합니다.
- 10번(B): item 테이블 조회 -> **이제 서야 count값이 1 확인 가능합니다.**



결국 트랜잭션B가 한 트랜잭션 내의 반복되는 Select 조회시 -> 값이 변경이 되지 않습니다. (REPEATABLE READ)반복적 읽기가 가능하다는 것을 증명했습니다.

이는, 앞에서도 이야기했지만, 트랜잭션내의 Select 조회시 그 해당시간을 기록하고, Snapshot를 떠서,  그 이후에 Select 조회시 consistency read를 하기 때문입니다.





## Update문

- update문을 실행할때는 row lock이 걸린다. 
- A가 특정 row에 대해서 업데이트를 수행한 상태에서, 같은 row를 B가 시도했을때 B는 A가 commit 하기 전까지 lock을 대기하는 상태가 된다.

<img width="1428" alt="Screen Shot 2022-08-06 at 9 39 40 PM" src="https://user-images.githubusercontent.com/28615416/183249344-144a0622-c3b5-44f5-9a40-bab3bea80a9c.png">

위의 경우에 A가 트랜잭션을 시작하고, B가 트랜잭션을 시작한다. 

- 1번(A): 트랜잭션A 시작 
- 2번(B): 트랜잭션B 시작

- 3번(A): 트랜잭션A 에서 item_id=2번을 count 값을 1 증가 시킨다. 
- 4번(B): 3번과 동일한 쿼리를 통해서 실행하게 되면 -> 쿼리가 실행되지 않고 wait 기다리게 된다. 
  - 4번 상태로 냅두게 되면 `lock wait timeout exceeded` 예외가 발생한다.



<img width="1430" alt="Screen Shot 2022-08-06 at 9 20 14 PM" src="https://user-images.githubusercontent.com/28615416/183249528-b9039cc7-fd60-4033-a548-a55285ec4387.png">

위의 케이스의 연장입니다. 

- 5번(A): 트랜잭션A를 커밋 -> 커밋을 하자마자, 4번(B)이 대기 상태에 있다가 쿼리를 실행 시킵니다. (lock 이 해제가 되면서)
- 6번(A): item 테이블의 item_id =2를 조회합니다 -> count값이 1 증가 했습니다. 
  - 여기서 select 조회를 했을때, 트랜잭션 B에서도 update쿼리를 했음에도, 값이 2가 아니라  값이 1입니다. 
  - 이것은 앞에서 select 할때 이야기 했던, 하나의 트랜잭션 안에서 select 조회를 할때는 snapshot을 기준으로 해당 row를 읽기 때문입니다. 
  - 참고) 트랜잭션B가 commit을 해야 비로소 트랜잭션A에서 조회했을때 count값이 2가 나옵니다!





## DeadLock상황 

REPEATABLE_READ 모드에서 update는 row lock을 걸기 때문에, lock wait timeout이 발생할 수있다. 그 외에도 deadlock이 걸리는 특별한 상황을 살펴보자. 

<img width="1428" alt="Screen Shot 2022-08-06 at 10 12 44 PM" src="https://user-images.githubusercontent.com/28615416/183250479-a9b952f9-f3c1-4b1d-b8c0-7a39fb8f3ebf.png">

- 1번(A): 트랜잭션 A 시작
- 2번(B): 트랜잭션B 시작
- 3번(A): update item 테이블 
- 4번(B): update order 테이블 
- 5번(A): update order 테이블 
- 6번(B): update item 테이블 
  - deadlock 발생, 트랜잭션 B를 aboart 시켰고, 트랜잭션A가 정상적으로 수행된다. 
- deadlock 왜 발생했나? 
  - 트랜잭션 A는 item에 대한 lock을 획득 , order에 대해서 lock이 풀리기를 기다림 
  - 트랜잭션 B는 order에 대한 lock을 획득, item에 대해서 lock이 풀리기를 기다림
  - 결국 순환 대기에 의한 deadlock이 발생 
- 해결 방법?
  - 트랜잭션 A는 item -> order 테이블에 update 
  - 트랜잭션 B는 order -> item 테이블 update
  - 즉, 비즈니스 로직의 update 순서를 동일하게 맞춰주면 순환대기에 빠지지 않게 된다. 





## Phantom read문제





### 요약 

- MySQL default isolation level은 REPEATABLE_READ 이다. 
- select : 하나의 트랜잭션에서는 최초의 select 조회의 snapshot를 읽기 때문에, 계속 같은 값을 읽을 수 있다.(동일 트랜잭션 내에서)
- update: update를 할때는 row lock를 걸기 때문에, update 순서에 의해서 lock wait timeout과 deadlock이 발생가능하다.
- REPEATABLE_READ 는 phantom read 문제가 발생 가능하다. 
