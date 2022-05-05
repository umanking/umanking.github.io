---
layout: post
title: vscode debugging 셋팅 방법 
date: 2022-05-05 15:18 +0900
toc: true
tags: [vscode]
categories: [vscode]
image: 'https://images.velog.io/images/namtaehyun/post/fe5d86d3-f734-4943-b087-3f3e02b9d5ab/vscode.png'
description: vscode debugging 셋팅 하는 방법
---


intellij만 사용하다가, vscode사용하니까 테스트를 실행하고 디버깅하는데 시간이 너무 많이 소요됨. vscode는 디버깅을 하기위해서 약간의 셋팅이 필요하다.



### sample 프로젝트를 만든다. 

nestjs node기반으로 하나 만든다.

```shell
npm i -g @nestjs/cli
nest new nesjs-sample
```



### 1.`launch.json`파일로 Launch Program 만들기

vscode 좌측 패널에서 Run And Debug 메뉴를 클릭한다. 

<img width="359" alt="1" src="https://user-images.githubusercontent.com/28615416/166870619-32c5ed1e-79b5-47e4-b9ef-e786f61125c6.png">

`create a lauch.json file` 를 클릭한다. 



<img width="579" alt="2" src="https://user-images.githubusercontent.com/28615416/166870615-ae97338a-d05f-41c1-b608-441adb7afc75.png">

- 환경을 chrome, node.. 등등 자신의 환경에 맞게 셋팅한다.  (필자는 `Node.js` 를 선택함)
- `.vscode`하위폴더에 `launch.json` 파일이 만들어졌다.

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "pwa-node",
            "request": "launch",
            "name": "Launch Program",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "program": "${workspaceFolder}/src/app.controller.spec.ts",
            "preLaunchTask": "tsc: build - tsconfig.json",
            "outFiles": [
                "${workspaceFolder}/dist/**/*.js"
            ]
        }
    ]
}
```

- `"program": "${workspaceFolder}/src/app.controller.spec.ts",  이 부분이 자신이 실행할 프로그램을 지정한다. 

> 참고로 `launch.json` 파일은 `.vscode` 하위 폴더에 위치한다. `.gitignore` 포함되어 있기 때문에 실제 운영중인 소스에 영향을 끼치지 않기 때문에 편하게 사용할 수 있다. 





### 2. Run script로 추가하기 

<img width="199" alt="3" src="https://user-images.githubusercontent.com/28615416/166871328-3826643e-f596-4068-aad1-03be3ee77008.png">

- Run and Debug 왼쪽 메뉴에서, 제일 상단에 있는 Select를 클릭
- Node.js... 를 클릭



<img width="603" alt="4" src="https://user-images.githubusercontent.com/28615416/166870599-a7c9c1db-c991-4535-a7d4-febc1b4b5180.png">

`package.json`에 설정되어 있는 스크립트들이 나온다. 이중에서 자신이 실행할 스크립트를 지정한다. 



## 디버깅하는 방법 

1. 원하는 부분에 `브레이킹 포인트`를 찍는다. 마우스 클릭해도 되고 `F9`를 눌러도 된다. 
2. `F5`를 눌러서 디버깅프로그램을 시작한다. 
3. 해당 위치에서 코드가 멈춘다. 
4. 다음 코드라인 진행을 원하면 `F8`(Step Over)
5. 해당 메서드의 깊이 들어가고 싶으면 `F7`(Step into)
6. 그냥 진행하려면 `⌘ + ⌥ + R`을 클릭한다. 
7. 실행을 종료하려면 `shift + F5`(Disconnect)로 종료한다.


## Ref
- [https://extbrain.tistory.com/128](https://extbrain.tistory.com/128)
