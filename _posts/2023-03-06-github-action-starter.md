---
layout: post
title: "Github Action을 활용한 CI/CD 파이프라인 구축"
date: 2023-03-06 20:00 +0900
description: Github Action은 강력한 자동화 도구로서, 소스 코드의 변경 사항에 대한 빠른 피드백을 제공하며, 애플리케이션의 배포 과정을 단순화할 수 있습니다.
image: https://miro.medium.com/max/1075/1*VtWbCHhIw6MMMXCil7lZ0g.png
tags: [github]
---

# Github Action을 활용한 CI/CD 파이프라인 구축

## 소개

Git은 현재 개발자들 사이에서 가장 널리 사용되는 형상 관리 도구입니다. Github, GitLab, Bitbucket과 같은 Git 호스팅 서비스는 개발자들이 협업 및 소스코드 공유를 위해 가장 많이 사용되는 플랫폼 중 하나입니다. 이러한 플랫폼에서는 CI/CD (지속적인 통합 및 배포) 파이프라인을 구축하는 데 매우 유용한 Github Action이 제공됩니다. Github Action은 강력한 자동화 도구로서, 소스 코드의 변경 사항에 대한 빠른 피드백을 제공하며, 애플리케이션의 배포 과정을 단순화할 수 있습니다.

## Github Action 소개

Github Action은 Github에서 호스팅하는 소스 코드 관리 플랫폼으로, 개발자들이 소프트웨어 개발 프로세스를 자동화할 수 있는 기능을 제공합니다. Github Action은 CI/CD 파이프라인을 구축하고, 소스 코드 변경 사항에 대한 빠른 피드백을 제공하며, 릴리스 및 배포 프로세스를 자동화하는 데 사용됩니다.

Github Action은 다양한 기능을 제공하며, 다음과 같은 작업을 자동화할 수 있습니다.

- 빌드 및 테스트
- Docker 이미지 빌드 및 배포
- AWS, Azure, Google Cloud Platform 등과 같은 클라우드 서비스와의 연동
- 소스 코드 정적 분석
- Slack, Email, SMS 등과 같은 알림 서비스로 알림 전송

## Github Action 사용법

Github Action을 사용하기 위해서는 먼저 Github 리포지토리 내에서 .github/workflows 디렉토리를 생성해야 합니다. 이 디렉토리에는 Github Action 워크플로우를 정의하는 YAML 파일이 저장됩니다. 이 파일은 Github Action이 실행되는 조건, 작업 내용, 및 실행 환경을 지정합니다.

다음은 Github Action을 사용하여 CI/CD 파이프라인을 구축하는 예제입니다.

{% raw %} 
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v2
    - name: Build and Test
      run: |
        npm install
        npm test
    - name: Deploy
      uses: GoogleCloudPlatform/github-actions/setup-gcloud@master
      with:
        project_id: my-project
        credentials: ${{ secrets.GCP_CREDENTIALS }}
      run: |
        gcloud app deploy

```
{% endraw %} 

위 예제는 main 브랜치에 push 또는 pull request가 발생하면 자동으로 실행되는 CI/CD 파이프라인을 정의합니다. 이 파이프라인은 Ubuntu 환경에서 빌드 및 테스트를 수행하고, Google Cloud Platform에 애플리케이션을 배포합니다.

Github Action을 사용하여 Slack으로 알림을 보내는 방법은 다음과 같습니다.

### Slack App 생성 및 설정

먼저, Github에서 Slack으로 알림을 보내기 위해서는 Slack App을 생성하고 설정해야 합니다. Slack App은 Slack API를 사용하여 Github Action과 통신하며, Github Action이 Slack으로 알림을 보낼 수 있도록 합니다.

### Github Secret 설정

Github Action에서 Slack으로 알림을 보내기 위해서는 Slack API 토큰을 필요로 합니다. 이를 위해 Github Secret을 설정해야 합니다. Github Secret은 Github Action에서 사용되는 환경 변수를 안전하게 저장하기 위한 기능입니다.

### Github Action 워크플로우 설정

Slack으로 알림을 보내기 위해 Github Action 워크플로우를 설정해야 합니다. 이 워크플로우는 Github 리포지토리 내의 .github/workflows 디렉토리에 YAML 파일로 저장됩니다. 이 파일에서는 Github Action이 Slack으로 알림을 보내는 방법을 정의합니다.

다음은 Slack으로 알림을 보내는 Github Action 워크플로우 YAML 파일의 예시입니다.

{% raw %} 
```yaml
name: Slack Notification

on:
  push:
    branches:
      - main

jobs:
  send-notification:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Send Slack Notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          fields: repo,message,author,commit,action,workflow,job,took
          slack-bot-token: ${{ secrets.SLACK_BOT_TOKEN }}
          channel: '#general'


```
{% endraw %}



위 예시는 main 브랜치에 push가 발생하면 자동으로 실행되는 Github Action 워크플로우입니다. 이 워크플로우는 Ubuntu 환경에서 실행되며, Github Action이 종료되면 Github Action의 상태와 함께 Slack으로 알림을 보냅니다. 이를 위해 action-slack 라이브러리를 사용하며, 이 라이브러리에서는 `slack-bot-token`과 `channel`을 설정해야 합니다.

Github Action을 사용하여 Slack으로 알림을 보내는 방법은 다양합니다. 위 예시는 그 중 하나일 뿐이며, 사용자의 필요에 따라 유연하게 워크플로우를 설정할 수 있습니다.

위에서 설명한 대로, Github Action을 사용하여 Slack으로 알림을 보내는 방법은 간단합니다. 하지만, 사용자가 필요로 하는 내용에 따라서 워크플로우를 유연하게 설정할 수 있도록 다양한 옵션을 제공합니다.

예를 들어, Github Action에서는 다양한 이벤트에 대해 워크플로우를 설정할 수 있습니다. `push`, `pull_request`, `schedule`, `workflow_dispatch`와 같은 이벤트를 대상으로 워크플로우를 설정할 수 있으며, 이를 통해 사용자는 자신이 필요로 하는 이벤트에 대해 Slack으로 알림을 받을 수 있습니다.

또한, Github Action에서는 다양한 라이브러리를 제공합니다. 예를 들어, Slack 뿐만 아니라 Email, SMS와 같은 다양한 알림 방법을 제공하는 라이브러리도 있습니다. 이러한 라이브러리는 사용자의 필요에 따라 추가되거나, 수정될 수 있습니다.

마지막으로, Github Action은 다양한 환경 변수를 제공합니다. 이를 통해 사용자는 Github Action 실행 환경과 관련된 정보를 확인할 수 있으며, 이를 활용하여 보다 유연한 워크플로우를 설정할 수 있습니다.

Github Action은 이러한 다양한 기능을 제공하며, 이를 통해 사용자는 소프트웨어 개발 프로세스를 보다 효율적으로 자동화할 수 있습니다. 이를 통해 개발자들은 보다 빠르고 안정적인 소프트웨어를 개발할 수 있으며, 이는 최종적으로 사용자 경험 향상으로 이어질 수 있습니다.

## 결론

Github Action을 사용하면 쉽게 CI/CD 파이프라인을 구축할 수 있습니다. Github Action은 다양한 기능을 제공하며, 사용자가 직접 워크플로우를 정의할 수 있습니다. Github Action을 사용하면 빠른 피드백을 받을 수 있으며, 애플리케이션의 배포 및 릴리스 프로세스를 단순화할 수 있습니다. 이러한 이점을 통해 개발자들은 보다 빠르고 안정적인 소프트웨어를 개발할 수 있습니다.
