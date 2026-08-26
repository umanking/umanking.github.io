#!/bin/zsh
set -euo pipefail

REPO="/Users/andrew/dev/umanking.github.io"
LOG_DIR="/Users/andrew/Library/Logs"
LOCK_DIR="/tmp/codenexus-codex-daily.lock"
mkdir -p "$LOG_DIR"

# Avoid overlapping runs when a previous generation takes longer than a day.
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') already running" >> "$LOG_DIR/codenexus-codex-daily.log"
  exit 0
fi
trap 'rmdir "$LOCK_DIR"' EXIT

cd "$REPO"
exec /Users/andrew/.nvm/versions/node/v22.16.0/bin/codex exec \
  --cd "$REPO" \
  --model gpt-5.6 \
  --dangerously-bypass-approvals-and-sandbox \
  --color never \
  "평일 일일 콘텐츠 발행 작업이다. 오늘 날짜 기준으로 기술·AI, 금융·투자, 부동산, 뉴스·인사이트 각 영역에서 독립 포스트를 2~3편씩 작성하라. AI 관련 뉴스는 반드시 section: ai로 분류하고 뉴스·인사이트에는 AI를 넣지 마라. 각 글은 공식 원문을 검색·확인하고, 제목과 YAML frontmatter를 제외한 Markdown 본문을 공백 포함 2,500~4,000자로 작성하라. 여러 소식을 한 글에 묶지 말고 핵심 질문 하나만 다뤄라. 기존 taxonomy와 content schema를 지키고 URL 중복을 피하라. 모든 글의 editorial.sources에 확인한 원문 URL을 넣고, 생성 글은 editorial.authorship: ai-generated, reviewed: false로 표시하라. 생성이 끝나면 npm test와 npm run build를 실행하라. 둘 중 하나라도 실패하면 파일을 커밋하지 말고 원인을 출력하라. 모두 통과하면 생성된 글만 master에 커밋하고 origin master로 push하라. 이미 오늘 해당 영역에 충분한 글이 있으면 중복을 만들지 말고 건너뛰어라." >> "$LOG_DIR/codenexus-codex-daily.log" 2>&1
