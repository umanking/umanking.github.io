---
layout: post
title: "NestJS: Node.js 프레임워크"
date: 2023-03-08 19:25 +0900
description: NestJS는 Node.js 기반의 프레임워크로, Express와 비슷한 구조를 가지고 있지만 더욱 강력한 기능과 구조적인 편리함을 제공합니다. NestJS는 TypeScript로 작성되어 있으며, Angular와 비슷한 구조를 가지고 있어 Angular 개발자들에게도 친숙합니다. NestJS는 서버 사이드 애플리케이션을 빠르고 확장 가능하게 만들어주며, RESTful API, 실시간 웹소켓 서비스, 마이크로서비스 등 다양한 애플리케이션을 구축할 수 있습니다.
image: https://cdn.dribbble.com/users/808903/screenshots/3831862/dribbble_szablon__1_1.png
tags: [nestjs]
---
## 소개

NestJS는 Node.js 기반의 프레임워크로, Express와 비슷한 구조를 가지고 있지만 더욱 강력한 기능과 구조적인 편리함을 제공합니다. NestJS는 TypeScript로 작성되어 있으며, Angular와 비슷한 구조를 가지고 있어 Angular 개발자들에게도 친숙합니다. NestJS는 서버 사이드 애플리케이션을 빠르고 확장 가능하게 만들어주며, RESTful API, 실시간 웹소켓 서비스, 마이크로서비스 등 다양한 애플리케이션을 구축할 수 있습니다.

## 메인 기능

NestJS는 다양한 기능을 제공하는데, 그 중에서도 가장 유용하고 강력한 기능은 아래와 같습니다.

## 의존성 주입(Dependency Injection)

NestJS에서는 의존성 주입을 통해 모듈 간의 결합도를 낮추고 유지보수성을 높입니다. 이를 통해 개발자는 각 모듈이 어떤 의존성을 가지고 있는지 명확하게 파악할 수 있으며, 효율적인 코드 작성이 가능합니다.

아래는 의존성 주입 예시입니다.

```tsx
import { Injectable } from '@nestjs/common';
import { CatsRepository } from './cats.repository';

@Injectable()
export class CatsService {
  constructor(private readonly catsRepository: CatsRepository) {}

  findAll(): Promise<Cat[]> {
    return this.catsRepository.findAll();
  }
}

```

`CatsService` 클래스에서 `CatsRepository` 클래스를 주입받아 사용합니다. 이를 통해 `CatsService` 클래스는 `CatsRepository` 클래스에 의존합니다. `@Injectable()` 데코레이터를 사용하여 `CatsService` 클래스가 의존하는 클래스를 주입받을 수 있습니다.

의존성 주입을 통해 코드의 가독성과 유지보수성을 높일 수 있습니다.

### 제공자(Providers)

NestJS에서는 제공자를 사용하여 서비스를 제공합니다. 제공자는 클래스, 팩토리, 값 등 다양한 형태로 제공될 수 있습니다. 제공자는 `@Injectable()` 데코레이터를 사용하여 정의됩니다.

아래는 제공자 예시입니다.

```tsx
import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}

```

`CatsService` 클래스는 `@Injectable()` 데코레이터를 사용하여 제공자로 등록됩니다. 이제 `CatsService` 클래스를 다른 클래스에서 주입받아 사용할 수 있습니다.

제공자를 사용하면, 클래스 간의 결합도를 낮출 수 있으며, 코드의 재사용성을 높일 수 있습니다.

### 의존성 주입과 제공자 사용 예시

NestJS에서는 의존성 주입과 제공자를 사용하여 데이터베이스와 상호작용할 수 있습니다. 아래는 TypeORM을 사용하여 `User` 엔티티를 데이터베이스와 연동하는 예시입니다.

`User` 엔티티 정의 예시

```tsx
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column()
  email: string;
}

```

`UserService` 클래스 예시

```tsx
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async create(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
}

```

`UserController` 클래스 예시

```tsx
import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Post()
  async create(@Body() user: User): Promise<User> {
    return await this.userService.create(user);
  }
}

```

`AppModule` 클래스 예시

```tsx
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}

```

위 예시에서 `UserService` 클래스는 `User` 엔티티의 `Repository`를 주입받아 데이터베이스와 상호작용합니다. `UserController` 클래스에서는 `UserService` 클래스를 주입받아 `UserService` 클래스에서 제공하는 메소드를 사용합니다.

이와 같이 NestJS에서는 의존성 주입과 제공자를 사용하여 애플리케이션을 구성할 수 있습니다.

## 모듈화(Modularity)

NestJS에서는 모듈화를 통해 애플리케이션을 여러 작은 모듈로 분리할 수 있습니다. 이렇게 분리된 모듈은 각각의 책임을 가지고 작동하며, 필요한 경우 각 모듈은 다른 모듈과 상호작용할 수 있습니다. 이를 통해 애플리케이션의 확장성과 유지보수성을 높일 수 있습니다.

아래는 모듈화 예시입니다.

```tsx
import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}

```

위 코드에서 `CatsModule`은 `CatsController`와 `CatsService`를 제공합니다. `CatsController`는 HTTP 요청을 처리하며, `CatsService`는 데이터베이스와 상호작용합니다. 이제 `CatsModule`을 다른 모듈에서 `import`하여 사용할 수 있습니다.

```tsx
import { Module } from '@nestjs/common';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule {}

```

위 코드에서 `AppModule`은 `CatsModule`을 `import`하여 사용합니다. `CatsModule`이 제공하는 기능을 `AppModule`에서 사용할 수 있습니다.

## 미들웨어(Middleware)

NestJS는 Express와 같은 미들웨어를 지원하며, 커스터마이징된 미들웨어를 만들 수 있습니다. 또한, NestJS는 내장된 미들웨어를 제공하며, CORS, 로깅, 보안 등 다양한 기능을 사용할 수 있습니다.

### CORS 미들웨어

CORS(Cross Origin Resource Sharing) 미들웨어는 다른 도메인에서의 리소스 요청을 허용하는 미들웨어입니다. NestJS에서는 `@nestjs/common` 모듈에서 `CorsMiddleware` 클래스를 제공합니다.

```tsx
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CorsMiddleware } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorsMiddleware)
      .forRoutes('*');
  }
}

```

위 코드는 `CorsMiddleware`를 사용하여 CORS 미들웨어를 등록하는 예시입니다. 모든 라우트에 대해 미들웨어를 등록하려면 `'*'`를 사용합니다.

### 로깅 미들웨어

로깅 미들웨어는 HTTP 요청과 응답에 대한 로그를 출력하는 미들웨어입니다. NestJS에서는 `morgan` 패키지를 사용하여 로깅 미들웨어를 구현할 수 있습니다.

```tsx
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as morgan from 'morgan';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(morgan('tiny'))
      .forRoutes('*');
  }
}

```

위 코드는 `morgan` 패키지를 사용하여 로깅 미들웨어를 등록하는 예시입니다. `morgan()` 함수에 로깅 포맷을 입력합니다. `tiny`는 간단한 로깅 포맷으로, HTTP 메소드, 경로, 상태 코드, 응답 시간을 로깅합니다.

### 보안 미들웨어

보안 미들웨어는 HTTP 요청에 대한 보안을 강화하는 미들웨어입니다. NestJS에서는 `helmet` 패키지를 사용하여 보안 미들웨어를 구현할 수 있습니다.

```tsx
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as helmet from 'helmet';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(helmet())
      .forRoutes('*');
  }
}

```

위 코드는 `helmet` 패키지를 사용하여 보안 미들웨어를 등록하는 예시입니다. `helmet()` 함수는 기본적인 보안 설정을 적용합니다. HTTP 헤더를 설정하여 XSS(Cross Site Scripting) 및 클릭재킹(clickjacking) 등의 공격을 방지합니다.

이와 같이 NestJS에서는 다양한 내장된 미들웨어를 제공하여 HTTP 요청과 응답에 대한 다양한 기능을 구현할 수 있습니다. 또한, 커스터마이징된 미들웨어를 작성하여 NestJS 애플리케이션을 더욱 효율적으로 구현할 수 있습니다.

## 데이터베이스 ORM

NestJS는 TypeORM이나 Sequelize와 같은 데이터베이스 ORM(Object-Relational Mapping)을 지원합니다. ORM은 데이터베이스와의 상호작용을 추상화하여 개발자가 코드 작성에 집중할 수 있게 해줍니다. NestJS에서 ORM을 사용하면, 데이터베이스 스키마 변경 시 자동으로 마이그레이션을 처리해주고, 간단한 코드 작성으로 데이터베이스와의 CRUD(Create, Read, Update, Delete) 작업을 처리할 수 있습니다.

TypeORM을 사용하여 데이터베이스와 상호작용하는 예시입니다.

먼저, `User` 엔티티를 정의합니다.

```tsx
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column()
  email: string;
}

```

위 코드는 `User` 엔티티를 정의하는 예시입니다. 엔티티는 데이터베이스 테이블과 매핑됩니다. `@PrimaryGeneratedColumn()` 데코레이터는 id 필드를 자동으로 생성하도록 합니다. `@Column()` 데코레이터를 사용하여 엔티티의 각 필드를 정의합니다.

다음으로, `UserController`를 작성합니다.

```tsx
import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Controller('users')
export class UserController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Get()
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }
}

```

위 코드는 `UserController`를 정의하는 예시입니다. `@InjectRepository(User)` 데코레이터를 사용하여 `User` 엔티티의 `Repository`를 주입합니다. 이렇게 주입된 `Repository`를 사용하여 데이터베이스와 상호작용합니다. `findAll()` 메소드는 모든 `User` 엔티티를 반환합니다.

마지막으로, `AppModule`을 작성합니다.

```tsx
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}

```

위 코드는 `AppModule`을 정의하는 예시입니다. `TypeOrmModule.forFeature([User])`를 사용하여 `User` 엔티티를 등록합니다. 이렇게 등록된 엔티티는 `UserController`와 `UserService`에서 사용됩니다.

이제 `UserController`에서 `/users` 엔드포인트로 `findAll()` 메소드를 호출하면, 데이터베이스에 저장된 모든 `User` 엔티티를 반환합니다. 예시를 통해 TypeORM이 어떻게 사용되는지 확인해보세요!

앞서 보여드린 예시를 참고하여, TypeORM을 사용하여 데이터베이스와 상호작용하는 코드를 작성할 수 있습니다. `@nestjs/typeorm` 모듈을 사용하여 NestJS 애플리케이션에서 TypeORM을 쉽게 사용할 수 있습니다.

TypeORM을 사용하면 데이터베이스 스키마 변경 시 자동으로 마이그레이션을 처리해주는 등, 개발자가 데이터베이스와의 상호작용에 더 집중할 수 있게 해줍니다. 또한, TypeORM을 사용하면 데이터베이스와의 CRUD 작업을 간단하게 처리할 수 있습니다.

NestJS에서 TypeORM을 사용하는 방법을 더 자세히 알고 싶다면, 공식 문서를 참고해보세요.

## 테스트(Test)

NestJS는 효율적인 테스트를 위해 각종 테스팅 도구를 지원합니다. 유닛 테스트, 통합 테스트, e2e 테스트 등 모든 종류의 테스트를 NestJS에서 함께 지원합니다.

NestJS에서 테스트를 위한 각종 도구를 지원합니다. 예를 들어, 유닛 테스트를 위해 Jest를 사용할 수 있습니다. Jest는 JavaScript를 위한 강력한 유닛 테스트 도구 중 하나입니다. 또한, e2e 테스트를 위해 supertest와 같은 라이브러리를 사용할 수 있습니다. supertest는 HTTP 요청을 테스트하는 데 사용되며, 통합 테스트에 적합합니다. 테스트 코드 작성 시, NestJS에서는 테스트 환경을 위한 모듈을 제공합니다. 이 모듈을 사용하여 테스트 환경을 설정하고, 테스트 코드를 작성할 수 있습니다.

다음은 Jest를 사용한 유닛 테스트의 예시입니다.

```tsx
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(appService.getHello()).toBe('Hello World!');
    });
  });
});

```

위 코드는 AppService 클래스의 getHello 메소드를 테스트하는 예시입니다. TestingModule을 사용하여 테스트용 모듈을 생성하고, AppService를 주입합니다. 그 후, getHello 메소드가 "Hello World!"를 반환하는지 확인하는 테스트 코드를 작성합니다.

NestJS에서는 이와 같이 간단하게 유닛 테스트 코드를 작성할 수 있습니다.

또한, NestJS에서는 e2e 테스트도 간편하게 작성할 수 있습니다. 예를 들어, supertest를 사용하여 HTTP 요청을 테스트할 수 있습니다.

다음은 supertest를 사용하여 HTTP GET 요청을 테스트하는 예시입니다.

```tsx
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

describe('AppController (e2e)', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/GET hello', () => {
    return request(app.getHttpServer())
      .get('/hello')
      .expect(200)
      .expect('Hello World!');
  });
});

```

위 코드는 NestJS 애플리케이션의 /hello 엔드포인트가 "Hello World!"를 반환하는지 테스트하는 예시입니다. supertest를 사용하여 HTTP 요청을 보내고, 반환값을 검증합니다.

이와 같이 NestJS에서는 유닛 테스트와 e2e 테스트를 위한 도구를 제공하며, 간단하게 테스트 코드를 작성할 수 있습니다.

## 마치며

NestJS는 Node.js 개발자들에게 매우 유용한 프레임워크입니다. 강력한 기능과 구조적인 편리함을 제공하여 Node.js 애플리케이션의 개발과 유지보수를 쉽게 만들어줍니다. 또한 Angular와 비슷한 구조를 가지고 있어, Angular 개발자들에게도 친숙합니다. NestJS를 사용하여 더욱 효율적이고 안정적인 애플리케이션을 개발해보세요!