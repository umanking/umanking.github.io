---
layout: post
title: Node.js에서 Socket.IO를 활용한 실시간 웹 소켓 통신 이해하기
date: 2023-08-04 21:52 +0900
image: https://miro.medium.com/v2/resize:fit:1400/0*K91yVP0ewgIiJVz_.png
tags: [nodejs, socket]
---
# 제목: Node.js에서 Socket.IO를 활용한 실시간 웹 소켓 통신 이해하기

## 소개

Socket.IO는 Node.js 기반의 웹 소켓 라이브러리로서, 실시간 양방향 통신을 가능하게 해주는 도구입니다. 웹 소켓은 클라이언트와 서버 사이에 지속적으로 연결을 유지하며, 실시간으로 데이터를 주고받는데 사용됩니다. 이 글에서는 Socket.IO의 기본 개념과 사용법을 자세하게 알아보겠습니다.

## 기본 개념

Socket.IO는 기본적으로 웹 소켓(WebSocket)을 기반으로 하지만, 일부 브라우저에서 웹 소켓을 지원하지 않을 때에도 폴백(fallback) 옵션으로 다른 통신 방식을 사용할 수 있습니다. 이로 인해 다양한 환경에서 실시간 통신을 구현할 수 있습니다.

## 설치와 서버 설정

Socket.IO를 사용하기 위해서는 먼저 Node.js 환경에서 설치가 필요합니다. npm을 이용하여 손쉽게 설치할 수 있습니다.

```bash
npm install socket.io
```

그리고 서버 측에서 Socket.IO를 설정하기 위해 다음과 같이 사용합니다.

```javascript
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Socket.IO 이벤트 핸들링
io.on('connection', (socket) => {
  console.log('새로운 사용자가 연결되었습니다.');

  // 클라이언트에서 보낸 이벤트 수신 및 처리
  socket.on('chat message', (msg) => {
    console.log('수신한 메시지:', msg);
    // 클라이언트들에게 메시지 전송
    io.emit('chat message', msg);
  });
});

// 서버 시작
const port = 3000;
server.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
```

## 클라이언트 측 설정

클라이언트 측에서 Socket.IO를 사용하기 위해서는 HTML 페이지에 Socket.IO 클라이언트 라이브러리를 추가하고, 다음과 같이 설정합니다.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Socket.IO Example</title>
</head>
<body>
  <h1>Real-time Chat</h1>
  <ul id="messages"></ul>
  <form id="chat-form">
    <input type="text" id="message-input" autocomplete="off" />
    <button>Send</button>
  </form>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.2.0/socket.io.js"></script>
  <script>
    const socket = io();

    // 서버에서 전달된 메시지 수신
    socket.on('chat message', (msg) => {
      const messages = document.getElementById('messages');
      const li = document.createElement('li');
      li.textContent = msg;
      messages.appendChild(li);
    });

    // 메시지 전송
    const form = document.getElementById('chat-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('message-input');
      const msg = input.value;
      socket.emit('chat message', msg);
      input.value = '';
    });
  </script>
</body>
</html>
```

## 결론

Socket.IO를 사용하여 Node.js 기반의 웹 소켓 통신을 구현하는 방법을 배워보았습니다. 이를 활용하여 실시간 채팅, 게임, 실시간 업데이트 등 다양한 기능을 구현할 수 있습니다. Socket.IO의 다양한 기능과 설정을 자세히 파악하여 웹 애플리케이션의 효율성과 사용자 경험을 높이도록 노력해보세요. Happy coding!