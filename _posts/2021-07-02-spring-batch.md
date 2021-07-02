---
layout: post
title: Spring-Batch 프로젝트 간단예제
date: 2021-07-02 17:58 +0900
tags: [spring-batch]
image: 'https://docs.spring.io/spring-batch/docs/current/reference/html/images/spring-batch-reference-model.png'
toc: true
---
## 1. Spring Batch 프로젝트 

## 2. 구성요소
자세한 내용은 [문서](https://docs.spring.io/spring-batch/docs/current/reference/html/domain.html#domainLanguageOfBatch)를 참고하자!

![https://docs.spring.io/spring-batch/docs/current/reference/html/images/spring-batch-reference-model.png](https://docs.spring.io/spring-batch/docs/current/reference/html/images/spring-batch-reference-model.png)


- `Job`: Spring Batch모듈에서 실행하는 하나의 실행단위? 
- `Step`: Job의 하위에 여러개의 Step으로 구성된다.  (1:N의 관계) 
- 각 Step은 `Reader`,`Processor`,` Writer`로 구성된다. (각각 1:1로 관계)
  - Reader 는 ItemReader 인터페이스로 추상화 되어서 제공한다.
  - Processor는 ItemProcessor 인터페이스로 추상화 되어서 제공한다.
  - Writer는 ItemWriter 인터페이스로 추상화 되어서 제공한다.
- ExecutionContext
- JopRepository:...
- JobLauncher:…. 

> Processor는 필수는 아니지만, Reader와 Writer는 필수 ! 


## 3. 예제 
**예제 코드는 [여기](https://github.com/umanking/my-workspace/tree/master/spring-batch)에서 확인!!!!**
- resource/sample.csv 파일을 읽어서  (Reader)
- 이름을 대문자로 변경한다.  (Processor)
- Person 테이블에 저장한다. (Writer)



### 3.1. 환경 구성 

Spring batch,  hsqldb  라이브러리 추가 

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-batch</artifactId>
</dependency>

<dependency>
  <groupId>org.hsqldb</groupId>
  <artifactId>hsqldb</artifactId>
  <scope>runtime</scope>
</dependency>
```



`resource/sample.csv`  해당 위치에 해당 파일을 생성한다.

```
andrew,han
betty,han
andy,kim
```



`resource/schema-all.sql` 를 만들어서 people이라는 테이블을 만든다. 

```sql
DROP TABLE people IF EXISTS;

CREATE TABLE people  (
    person_id BIGINT IDENTITY NOT NULL PRIMARY KEY,
    first_name VARCHAR(20),
    last_name VARCHAR(20)
);
```



변환할 간단한 Person POJO를 만든다.

```java
@Data
public class Person {
    private String firstName;
    private String lastName;
}
```





### 3.2. Batch 구성

```java
@Configuration
@EnableBatchProcessing
@RequiredArgsConstructor
public class BatchConfiguration {

    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
```

- @EnableBatchProcessing 어노테이션을 입력한다.
- BatchConfiguration을 구성한다. `JobBuilderFactory` 와 `StepBuilderFactory` 를 빈으로 주입한다.



```java
@Bean
public Job importUserJob(JobCompletionNotificationListener listener) {
  return jobBuilderFactory.get("importUserJob")
    .incrementer(new RunIdIncrementer())
    .flow(step1())
    .end()
    .build();
}

@Bean
public Step step1() {
  return stepBuilderFactory.get("step1")
    .<Person, Person>chunk(2)
    .reader(reader())
    .processor(processor())
    .writer(writer())
    .build();
}
```

- Job과 Step을 구성한다.
- JobBuilderFactory를 통해서 flow()에 들어갈 Step을 넣어준다. 
- StepBuilderFactory에서 chunck 사이즈를 지정한다. 
  - reader, proccessor, writer를 추가한다.  (아직은 해당 메서드를 만들지 않았기 때문에 컴파일이 되지 않는다. 다음에서 각 reader, processor, writer를 만들어보자)

### 3.3. Reader, Processor, Writer구성

```java
@Bean
public FlatFileItemReader<Person> reader() {
    return new FlatFileItemReaderBuilder<Person>()
        .name("personItemReader")
        .resource(new ClassPathResource("sample.csv"))
        .delimited()
        .names(new String[]{"firstName", "lastName"})
        .fieldSetMapper(new BeanWrapperFieldSetMapper<>() {{
            setTargetType(Person.class);
        }})
        .build();
}

@Bean
public ItemProcessor<Person, Person> processor() {
    return new PersonItemProcessor();
}

@Bean
public ItemWriter<Person> writer() {
    return new JdbcBatchItemWriterBuilder<Person>()
        .itemSqlParameterSourceProvider(new BeanPropertyItemSqlParameterSourceProvider<>())
        .sql("INSERT INTO people (first_name, last_name) VALUES (:firstName, :lastName)")
        .dataSource(dataSource)
        .build();
}
```

- Reader는 ItemReader를 구현한 FlatFileItemReader 구현체를 사용한다. 

  - 리소스 경로로 `sample.csv` 파일을 불러온다. 
  - 각각 필드들을 firstName과 lastName으로 `Person` 이라는 객체와 매핑한다. 

- Processors는 PersonItemProcessor 클래스를 하나 만들어서, 읽어들인 Person 객체를 -> 대문자로 변환하는 작업을 수행한다.

  ```java
  // ItemProcessor<I,O>를 구현한다.
  public class PersonItemProcessor implements ItemProcessor<Person, Person> {
      @Override
      public Person process(Person person) {
        	// 대문자로 변경
          final String firstName = person.getFirstName().toUpperCase();
          final String lastName = person.getLastName().toUpperCase();
        
          final Person transformedPerson = new Person(firstName, lastName);
          return transformedPerson;
  
      }
  }
  ```

- Writer는 JdbcBatchItemWriter 구현체로 사용했다.



### 3.4. 다양하게 구성가능 

- 지금 예제는 file을 읽고, DB에 쓰지만, DB를 읽고 DB에 쓰는 등 다양한 구현체들이 존재한다. 

  > 자세한 내용은 [문서](https://docs.spring.io/spring-batch/docs/current/reference/html/readersAndWriters.html#readersAndWriters)를 참고

  - FlatFile
  - JSON
  - XML
  - MultiFile
  - Database



## 4. JobExecutionListner, StepExecutionListner

가끔 비즈니스 로직에서, Job의 시작 전,후처리  / Step의 전,후처리가 필요한 경우가 있다. 이럴때는 `JobExecutionListenerSupport` 와 `StepExecutionListenerSupport` 해당 클래스를 상속받아서, `beforeXXX`, `afterXXX`메서드를 구현해 주면 된다. 

그리고 위에서 작성한 `BatchConfiguration `  클래스에서 Job과 Step 에 `.listener()` 의 파라미터에 값을 주입해주면 된다. 



여기에서는 (파일을 읽고, 변환하고, DB에 쓴 후) 에 Job이 다 끝났을때, 다시 DB에서 조회해서 logging 하는 코드를 추가 작성해보자.

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class JobCompletionNotificationListener extends JobExecutionListenerSupport {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void afterJob(JobExecution jobExecution) {
        if (jobExecution.getStatus() == BatchStatus.COMPLETED) {
            log.info("JOB FINISHED!!!!");
            jdbcTemplate.query("SELECT first_name, last_name FROM people",
                (rs, row) -> new Person(
                    rs.getString(1),
                    rs.getString(2))
            ).forEach(person -> log.info("Found <" + person + "> in the database."));
        }
    }
}
```

이렇게 JobCompletionNotificationListner를 하나 만들어 주고, JdbcTemplate을 통해서 `SELECT` 쿼리로 결과를 죄회해서 로깅을 한다. 
넘어온 `jobExecution`의 getStatus를 통해서 BatchStatue는 다음과 같이 여러가지 상태값이 존재한다.  
Job이 완전히 끝난 이후에 동작하도록 코드를 짰다.


![스크린샷 2021-07-02 오후 6 31 58](https://user-images.githubusercontent.com/28615416/124254211-cba89380-db63-11eb-891e-98dc559e66bd.png)


이제 위에서 만든 JdbcCompletionNotifioncationListner를 등록해보자!

```java
@Bean
public Job importUserJob(JobCompletionNotificationListener listener) {
  return jobBuilderFactory.get("importUserJob")
    .incrementer(new RunIdIncrementer())
    .listener(listener) // 리스너 등록함!
    .flow(step1())
    .end()
    .build();
}
```

처음에 구성한 Job의 파라미터를 넘겨서 해당 listner를 등록했다.
실제 프로젝트를 구동하면, schema를 initializing 하면서 batch가 동작한다.
사실 여러가지 실험해볼 수 있는 재밌는 프로젝트인데, 시간적으로 여유가 없어서 많이 공부는 못했다. 차차 조금씩 build up해서 하나씩 포스팅해봐야지!!! 



