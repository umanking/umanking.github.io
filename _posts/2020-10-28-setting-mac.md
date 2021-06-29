---
layout: post
title: 개발자 컴퓨터 환경 세팅
category: [mac]
#tags: [setting, tip]
date: 2020-10-28 09:41 +0900
image: 'https://images.unsplash.com/photo-1522040806052-b0aa2b039f00?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
---
## 1. 필수 설치 프로그램
### 1.1. 개발도구
  - [JetBrain toolbox](https://www.jetbrains.com/toolbox-app/)
  - [VsCode](https://code.visualstudio.com/download)
  - [PostMan](https://www.getpostman.com/downloads/)
  - [SequelPro](https://sequelpro.com/download)
  - [Mysql Workbench](https://www.mysql.com/products/workbench/)
  - [SourceTree](https://www.sourcetreeapp.com/)
  - [Iterms2(Zsh, Oh-my-zsh, dracular theme)](https://www.iterm2.com/downloads.html)

### 1.2. 업무툴
  - [Alfred4](https://www.alfredapp.com/)
  - [Magnet](https://apps.apple.com/us/app/magnet/id441258766?mt=12)
  - [Spectacle](https://www.spectacleapp.com/)
  - [Karabiner](https://pqrs.org/osx/karabiner/)
  - [Jolt of Caffein](https://apps.apple.com/us/app/jolt-of-caffeine/id1437130425?mt=12)
  - [Notion](https://www.notion.so/desktop)
  - [TextMate](https://macromates.com/download)






## 2. Zsh 설치

homebrew  & nodejs 설치

```
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
$ brew update
$ brew install node
```

Zsh 설치

```
$ brew install zsh
$ curl -L https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh | sh
$ chsh -s /bin/zsh
```

vim 설치

```
$ brew install neovim
$ brew tap caskroom/fonts
$ brew cask install font-hack-nerd-font
$ curl -sLf https://spacevim.org/install.sh | bash
```

## 3. Zsh 플러그인 설치 

autosuggesstion (자동완성)

```
git clone https://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM/plugins/zsh-autosuggestions
```

~/.oh-my-zsh/custom/plugins 폴더하위에 zsh-autosuggestions 플러그인을 이동시킵니다.`vi ~/.zshrc` 를 입력해서 다음과 같이 plugins 목록에 추가합니다.

```
plugins=(
  git
  zsh-autosuggestions
)
```

 주의해야 할 사항은 `,` delimiter 를 [사용하지 말라고 권고합니다.](https://github.com/ohmyzsh/ohmyzsh/issues/7728).`source ~/.zshrc`를 적용하고, 재 실행시키면 자동완성됩니다!


## 4. [키변환] 한/영키 > 오른쪽 command키로 변경하는 방법

1. [karabiner 설치](https://pqrs.org/osx/karabiner/)
2. Simple modifications 탭에서 right_command - f18로 추가
3. System Preference - Keyboard - 단축키 탭 - 입력소스 - 이전소스 입력을 (right command) 키로 변경


## 5. github ssh키 등록

- `ssh-keygen -t rsa` 를 통해서 ssh key를 만든다.
- `cat ~/.ssh/id_psa.pub` 을 통해서 퍼블릭키를 복사한다.
- github 계정의 SSH and GPG keys 에서 `New SSH Key` 를 등록한다.



## 6. 회사 이메일 계정이랑, 개인 계정 함께 사용하기 

> IntelliJ 프로젝트의 폴더별로 구분해서 개인것, 회사것으로 분리해서 사용한다.


- 회사 프로젝트 폴더: ~/IdeaProject 
- 개인 프로젝트 폴더: ~/workspace 

회사 컴퓨터에서 `vi ~/.gitcofing` 로 접속 해서 다음과 같이 추가한다. 

```
[user]
  email = andrew@회사도메인.com
  name = andrew
[includeIf "gitdir:~/workspace/"]
  path = .gitconfig-personal
```

gitconfig default 설정은 회사걸로 하고, 내 개인 프로젝트는 `~/workspace`하위에 들어가는 경우에는 
`.gitconfig-personal` 위치에 있는 정보를 사용한다는 뜻이다.

`vi ~/.gitconfig-personal` 입력후 다음과 같이 개인 계정 관련 부분을 넣는다.

```
[user]
  email = andrew@gmail.com
  name = andrew han
```



## 7. vscode `code .` 설치

- vs code 실행
- shell command: `install code` 설치
- iterms에서 `code .` 하면 vscode로 열림






## 8. 플러그인 추천

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

  

