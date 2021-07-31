---
layout: post
title: 개발자 컴퓨터 환경 세팅
category: [mac]
tags: [setting, tip, mac]
date: 2020-10-28 09:41 +0900
image: 'https://images.unsplash.com/photo-1522040806052-b0aa2b039f00?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
description: 개발자 컴퓨터 환경 셋팅에 대해서 알아보자.
---
## 1. 들어가며
회사를 이직하거나, 새로운 환경에 놓여있을때 기본적으로 내가 추구하는? 방식을 사용하기 위해서 포스팅을 함
기본 설치 프로그램, 유용한 플러그인, 설정방법들에 대해서 알아보자!! (계속 업데이트 예정)

## 2. 필수 설치 프로그램
### 2.1. 개발도구
  - [JetBrain toolbox](https://www.jetbrains.com/toolbox-app/)
  - [VsCode](https://code.visualstudio.com/download)
  - [PostMan](https://www.getpostman.com/downloads/)
  - [SequelPro](https://sequelpro.com/download)
  - [Mysql Workbench](https://www.mysql.com/products/workbench/)
  - [SourceTree](https://www.sourcetreeapp.com/)
  - [Iterms2(Zsh, Oh-my-zsh, dracular theme)](https://www.iterm2.com/downloads.html)

### 2.2. 생산성
  - [Alfred4](https://www.alfredapp.com/)
  - [Magnet](https://apps.apple.com/us/app/magnet/id441258766?mt=12)
  - [Spectacle](https://www.spectacleapp.com/)
  - [Karabiner](https://pqrs.org/osx/karabiner/)
  - [Jolt of Caffein](https://apps.apple.com/us/app/jolt-of-caffeine/id1437130425?mt=12)
  - [Notion](https://www.notion.so/desktop)
  - [TextMate](https://macromates.com/download)






## 3. Zsh 설치

### 3.1. Homebrew  & nodejs 설치

```shell
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
$ brew update
$ brew install node
```

### 3.2. Zsh 설치 

```shell
$ brew install zsh
$ curl -L https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh | sh
$ chsh -s /bin/zsh
```

### 3.3. vim 설치

```shell
$ brew install neovim
$ brew tap caskroom/fonts
$ brew cask install font-hack-nerd-font
$ curl -sLf https://spacevim.org/install.sh | bash
```

### 3.4. vim color schema 적용
- [여기에서 확인]({% post_url 2021-06-30-vim-color-scheme %})

## 4. Zsh 플러그인 설치 

### 4.1. autosuggesstion (자동완성)

```shell
git clone https://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM/plugins/zsh-autosuggestions
```
`~/.oh-my-zsh/custom/plugins`폴더하위에 zsh-autosuggestions 플러그인을 이동 시킨다.

`vi ~/.zshrc` 를 입력해서 다음과 같이 plugins 목록에 추가합니다.
```shell
plugins=(
  git
  zsh-autosuggestions
)
```
 > 주의해야 할 사항은 `,` 콤마를 [사용하면 안된다.](https://github.com/ohmyzsh/ohmyzsh/issues/7728)
 `source ~/.zshrc`를 적용하면 자동완성 플러그인 적용!


## 5. [키변환] 한/영키 > 오른쪽 command키로 변경하는 방법

1. [karabiner 설치](https://pqrs.org/osx/karabiner/)
2. Simple modifications 탭에서 right_command - f18로 추가
3. System Preference - Keyboard - 단축키 탭 - 입력소스 - 이전소스 입력을 (right command) 키로 변경


## 6. github ssh키 등록

- `ssh-keygen -t rsa` 를 통해서 ssh key를 만든다.
- `cat ~/.ssh/id_psa.pub` 을 통해서 퍼블릭키를 복사한다.
- github 계정의 SSH and GPG keys 에서 `New SSH Key` 를 등록한다.



## 7. Github 회사 계정, 개인 계정 함께 사용하기

IntelliJ 프로젝트의 폴더별로 구분해서 개인것, 회사것으로 분리해서 사용한다.
- 회사 프로젝트 폴더: ~/IdeaProject 
- 개인 프로젝트 폴더: ~/workspace 

### 7.1. 방법 

회사 컴퓨터이기 때문에 기본 설정은 회사 껄로 `vi ~/.gitcofing` 에서 다음을 추가한다. 
```shell
# .gitconfig 파일
[user]
  email = andrew@회사도메인.com
  name = andrew
[includeIf "gitdir:~/workspace/"]
  path = .gitconfig-personal
```

`vi ~/.gitconfig-personal` 입력후 다음에 자신의 개인 계정을 추가한다. 

```shell
#.gitconfig-personal
[user]
  email = andrew@gmail.com
  name = andrew han
```

### 7.2. 확인
`~/workspace`프로젝트로 이동해서 `mkdir test` 폴더를 만들고 `git init`후에
`git config user.name` 혹은 `git config user.email`을 입력해서 확인한다. 



## 8. vscode `code .` 설치

- vs code 실행
- shell command: `install code` 설치
- iterms에서 `code .` 하면 vscode로 열림






## 9. 플러그인 추천

- Intellij Plugin 추천
  - [Lombok](https://plugins.jetbrains.com/plugin/6317-lombok)
  - [Save Action](https://plugins.jetbrains.com/plugin/7642-save-actions)

- VsCode Plugin 추천
  - [Atom one dark theme](https://marketplace.visualstudio.com/items?itemName=akamud.vscode-theme-onedark)
  - [Intellij keybinding](https://marketplace.visualstudio.com/items?itemName=k--kato.intellij-idea-keybindings)
  - [Auto close tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag)
  - [Auto Import](https://marketplace.visualstudio.com/items?itemName=steoates.autoimport)
  - [Beautify](https://marketplace.visualstudio.com/items?itemName=HookyQR.beautify)
  - [Bracket Pair Colorizer](https://marketplace.visualstudio.com/items?itemName=CoenraadS.bracket-pair-colorizer)
  - [Indenticator](https://marketplace.visualstudio.com/items?itemName=SirTori.indenticator)
  - [Output colorizer](https://marketplace.visualstudio.com/items?itemName=IBM.output-colorizer)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - [Material icon theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme)
  - [Vscode-styld-components](https://marketplace.visualstudio.com/items?itemName=jpoissonnier.vscode-styled-components)
  - [todo highlight](https://marketplace.visualstudio.com/items?itemName=wayou.vscode-todo-highlight)
  - [Node.js extension pack](https://marketplace.visualstudio.com/items?itemName=waderyan.nodejs-extension-pack)
  - [React extension pack](https://marketplace.visualstudio.com/items?itemName=jawandarajbir.react-vscode-extension-pack)

- 크롬 플러그인
  - [JsonFormatter](https://chrome.google.com/webstore/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa)
  - [Octotree](https://chrome.google.com/webstore/detail/octotree/bkhaagjahfmjljalopjnoealnfndnagc)
  - [Momentum](https://chrome.google.com/webstore/detail/momentum/laookkfknpbbblfpciffpaejjkokdgca)
  - [EditThisCookie](https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg)
  - [Google translate](https://chrome.google.com/webstore/detail/google-translate/aapbdbdomjkkjkaonfhkkikfgjllcleb)

  

