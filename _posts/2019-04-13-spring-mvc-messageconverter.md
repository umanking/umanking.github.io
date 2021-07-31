---
layout: post
title: "[Spring] 메세지 컨버터"
date: 2019-04-13 22:07:05
image: '/images/spring.png'
toc: true
categories: [spring]
tags: [spring]
description: 스프링의 메세지 컨버터에 대해서 알아보자.
---
## 1. 들어가며
스프링 MVC에서 HttpMessageConverter에 대해서 알아보자

## 2. 메세지 컨버터란?
스프링에서는 @RequestBody, @ResponseBody와 같은 어노테이션을 붙여주면, HTTP의 요청 본문, 응답 본문을 메세지 컨버터를 이용한다. 

> 예제에서는 요청/응답 본문은 json 형식으로, 객체는 User를 통해서 살펴보자!

### 2.1. 메세지 컨버터의 종류는? 

- JsonMessageConverter
- StringMessageConverter
- 등등...

## 3. 예제 코드
```java
@Data
public class User {

    private Long id;
    private String username;
    private String password;

}
```

```java
@Controller
public class UserController {

    @PostMapping("/user")
  	@ResponseBody
    public User create(@RequestBody User user) {
        return user;
    }
}
```
- @ResponseBody가 없으면 -> BeanNameViewResolver를 탄다. 
  - 결국 MVC에서 View네임과 매핑한다. 그래서 클래스패스 하위의 JSP 파일이름(view이름)으로 매핑한다. 
- @ResponseBody가 있으면 -> MessageConverter를 탄다.
  - 하지만 이렇게 직접 @ResponseBody를 명시할 일이 별로 없다. API를 작성하는 경우에는 클래스에 `@Controller` + `@ResponseBody` 조합으로 이뤄진 `@RestController`를 사용하면, 굳이 @ResponseBody를 붙이지 않아도 된다. 


MockMVC를 통해서 테스트 케이스를 작성해보자. 
```java
@RunWith(SpringRunner.class)
@WebMvcTest // WebMvc 어노테이션 설정
public class UserControllerTest {

    @Autowired
    MockMvc mockMvc; //MockMvc 주입

    @Test
    public void createUser_JSON() throws Exception {
        String user = "{\"username\":  \"andrew\",\n" +
                "  \"password\": 1234" + "}"; 

      	mockMvc.perform(post("/user/create")
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .accept(MediaType.APPLICATION_JSON_UTF8)
                .content(user))

                .andDo(print())
                .andExpect(jsonPath("$.username", Matchers.is(equalTo("andrew"))))
                .andExpect(status().isOk());
    }
}
```

content-type과 accept타입을 Json 으로 설정하고, user라는 Json데이터를 요청본문에 담아서 해당 url를 호출해서 나온 결과값을 jsonpath 를 통해서 검증해 보자!
