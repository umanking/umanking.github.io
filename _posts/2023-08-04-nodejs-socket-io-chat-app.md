---
layout: post
title: 실시간 채팅 앱 만들기 Node.js와 Socket.IO를 활용한 실습
date: 2023-08-04 21:53 +0900
image: https://miro.medium.com/v2/resize:fit:1400/0*K91yVP0ewgIiJVz_.png
tags: [nodejs, socket]
---
## 실시간 채팅 앱 만들기: Node.js와 Socket.IO를 활용한 실습

### 소개

이 블로그에서는 Node.js와 Socket.IO를 활용하여 실시간 채팅 애플리케이션을 만드는 방법을 상세히 설명하겠습니다. 실시간 채팅 앱은 사용자들이 실시간으로 채팅 메시지를 주고받을 수 있는 기능을 제공하는 웹 애플리케이션입니다. Node.js는 서버 측에서 사용되며, Socket.IO는 웹 소켓을 다루기 위한 라이브러리로 사용됩니다.

### 프로젝트 구성

먼저 프로젝트를 구성합니다. 기본적으로 다음과 같은 디렉토리 구조를 가지도록 합니다.

```
- public
  - index.html
- server.js
- package.json
```

### 서버 구성

#### 1. 서버 설정과 Socket.IO 초기화

```javascript
// server.js

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
```

#### 2. 새로운 사용자 연결 처리

```javascript
// server.js

io.on('connection', (socket) => {
  console.log('새로운 사용자가 연결되었습니다.');
});
```

### 클라이언트 구성

#### 1. index.html 파일 작성

```html
<!-- public/index.html -->

<!DOCTYPE html>
<html>
<head>
  <title>실시간 채팅</title>
</head>
<body>
  <h1>실시간 채팅</h1>
  <ul id="chat-messages"></ul>
  <form id="chat-form">
    <input type="text" id="message-input" autocomplete="off" />
    <button type="submit">전송</button>
  </form>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();

    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');

    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = messageInput.value;
      if (message.trim() !== '') {
        socket.emit('chat message', message);
        messageInput.value = '';
      }
    });

    socket.on('chat message', (message) => {
      const li = document.createElement('li');
      li.textContent = message;
      chatMessages.appendChild(li);
    });
  </script>
</body>
</html>
```

### 채팅 메시지 처리

```javascript
// server.js

io.on('connection', (socket) => {
  console.log('새로운 사용자가 연결되었습니다.');

  // 클라이언트에서 보낸 채팅 메시지 수신
  socket.on('chat message', (message) => {
    console.log('수신한 메시지:', message);
    // 모든 클라이언트에게 채팅 메시지 전송
    io.emit('chat message', message);
  });
});
```

### 서버 실행 및 테스트

위 코드를 모두 작성하고 서버를 실행합니다.

```bash
node server.js
```

웹 브라우저에서 `http://localhost:3000`에 접속하고 채팅 메시지를 입력하여 실시간으로 메시지를 확인해보세요. 여러 사용자가 동시에 접속하여 실시간 채팅을 테스트해보면 됩니다.

### 결론

이제 Node.js와 Socket.IO를 사용하여 실시간 채팅 애플리케이션을 만드는 방법을 배워보았습니다. Socket.IO를 활용하면 웹 소켓을 쉽게 다룰 수 있고, 클라이언트와 서버 간에 실시간 통신을 간편하게 구현할 수 있습니다. 이러한 기술을 활용하여 다양한 실시간 웹 애플리케이션을 만들어보세요. Happy coding!