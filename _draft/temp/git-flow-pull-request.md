---
title: Git PR(Pull Reuqest) 하는 방법 (feat. GitFlow)
date: 2020-11-30 21:35:13
---
오늘은 현업에서 여러명이 동시에 프로젝트 작업을 할때 유용한 PullRequest 하는 방법에 대해서 알아보도록 하겠습니다. 사실 혼자만 프로젝트를 진행하게 되면, 은근 이런것들에 대한 개념이 없을 수도 있어서 생각난 김에 적습니다.


## Pull Request는 뭘까요? 
Pull Request 줄여서 PR이라고 하고, PR은 자신이 작성한 코드를 Remote 원격지에 자기가 작업한 브랜치로 push를 하고, 해당 작업 브랜치를 merge하고 싶은 대상이 되는 branch로 PR을 날립니다. 그러면 Reviewer들이 코드 리뷰를 하고, 최종적으로 Leader가 Confirm하게 되면 내가 작성한 소스가 merge하고 싶은 대상이 되는 branch로 merge가 됩니다.

주로 Open Source를 활동하는 분들이 자신이 관심있어 하는 Project를 Fork를 떠서 작업하고, PR를 날려서, 해당 오픈소스 프로젝트에 Contributor가 되는 방식입니다. 

<!-- more -->

## PR하는 방법
1. 기본 [git flow 전략](https://danielkummer.github.io/git-flow-cheatsheet/)을 따른다.
```shell
$ git flow init
```

2. develope(항상 최신을 유지) 브랜치에서 브랜치를 딴다.

   ```shell
   $ git flow feature start MYFEATURE
   > feature/myfeature 로 따짐
   ```

3. 작업을 완료하면 feature/myfeature 로 remote 에 푸쉬한다. 
> git flow로 커맨드를 통해서, `git flow feature finish MYFEATURE`를 할 수 있지만, git flow finish 명령어는 
> 1)feature 브랜치를 develop으로 바로 merge하고, 
> 2)기존의 feature 브랜치를 삭제하기 때문에, 우리가 애초에 원하던 PR을 할 수 가 없다.

4. remote 영역에서 feature/myfeature 에서 remote 에 있는 develop 브랜치로 PR을 날린다. 
5. 리뷰어들에 의해서 코드 리뷰를 받는다. 
6. 최종 Confirm이 나면 Leader가 Merge를 한다. 
   1. 최종 상태는 develop 브랜치에 내가 작업한 feature/myfeature 결과물들이 merge 되어있다. 
7. 이제 다시 develop가 최신 소스가 반영이 되었고, develop 브랜치에서 다시 feature를 따서 작업을 진행한다.





## 참고

- https://wayhome25.github.io/git/2017/07/08/git-first-pull-request-story/
- https://danielkummer.github.io/git-flow-cheatsheet/