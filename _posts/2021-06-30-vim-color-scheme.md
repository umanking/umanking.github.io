---
layout: post
title: vim color 스키마 적용하기 
date: 2021-06-30 21:03 +0900
tags: [tip, vim]
image: 'https://download.logo.wine/logo/Vim_(text_editor)/Vim_(text_editor)-Logo.wine.png'
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

