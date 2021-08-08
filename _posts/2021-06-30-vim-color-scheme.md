---
layout: post
title: vim color 스키마 적용하기 
date: 2021-06-30 21:03 +0900
tags: [vim, iterms]
categories: [vim, iterms]
image: 'https://download.logo.wine/logo/Vim_(text_editor)/Vim_(text_editor)-Logo.wine.png'
description: iterms의 vim color shcema를 적용하는 방법을 알아보자.
---

## 1. vim color 스키마 적용하기 

 1. [https://github.com/rafi/awesome-vim-colorschemes](https://github.com/rafi/awesome-vim-colorschemes) 해당 주소를 clone한다. 
 2. 위의 소스 중에 colors 폴더를 ~/.vim/colors 폴더로 복사한다. 
 3. `vi ~/.vimrc` 에서 다음과 같이 추가한다.

```shell
" Syntax Highlighting
if has("syntax")  
    syntax on
endif

set autoindent  
set cindent  
set nu

colo onehalfdark

set laststatus=2  
set statusline=\ %<%l:%v\ [%P]%=%a\ %h%m%r\ %F\ 
```
필자는 `onehalfdark`를 사용하는데, 저 부분을 자기가 원하는 color scheme을 적으면 된다.  
재 실행하면 다음과 같이 예쁘게 바뀌어있다! 
<img width="937" alt="스크린샷 2021-06-30 오후 10 49 42" src="https://user-images.githubusercontent.com/28615416/123972011-777fa100-d9f5-11eb-99e9-fe1d49388020.png">
