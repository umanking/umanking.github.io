#!/bin/zsh
set -euo pipefail

REPO="/Users/andrew/dev/umanking.github.io"
LOG_DIR="/Users/andrew/Library/Logs"
LOCK_DIR="/tmp/codenexus-codex-daily.lock"
# launchd does not load the interactive shell's nvm PATH. Codex uses
# /usr/bin/env node, so expose the configured Node.js runtime explicitly.
export PATH="/Users/andrew/.nvm/versions/node/v22.16.0/bin:/usr/bin:/bin:/usr/sbin:/sbin"
mkdir -p "$LOG_DIR"

# Avoid overlapping runs when a previous generation takes longer than a day.
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') already running" >> "$LOG_DIR/codenexus-codex-daily.log"
  exit 0
fi
trap 'rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT

cd "$REPO"
if /Users/andrew/.nvm/versions/node/v22.16.0/bin/codex exec \
  --cd "$REPO" \
  --model gpt-5.6-luna \
  --config 'model_reasoning_effort="medium"' \
  --dangerously-bypass-approvals-and-sandbox \
  --color never \
  "평일 일일 콘텐츠 발행 작업이다. 먼저 automation/editorial-guidelines.md와 src/data/taxonomy.ts, src/content.config.ts를 읽고, 가이드의 금융 리서치 애널리스트·부동산 시장 및 정책 전문가 프로필과 품질 게이트를 엄격히 적용하라. 오늘 날짜 기준으로 기술·AI 2편, 금융·투자 2편, 부동산 2편을 작성하라. 뉴스·인사이트는 신규 발행하지 마라. 금융·투자는 macro, forex, indices, etf, stocks, semiconductors, personal-finance 중 주제에 맞는 hub를 선택하고, 부동산은 market-trends, supply, policy, subscription, rent, reits 중 선택하라. 같은 허브에 쏠리지 않도록 오늘 공식 자료와 독립 해설 가치가 높은 허브를 우선하라. 각 글은 공식 원문을 검색·확인하고, 제목과 YAML frontmatter를 제외한 Markdown 본문을 공백 포함 2,500~4,000자로 작성하라. 핵심 수치·조건은 문장 단위로 <mark>...</mark> 형광 강조하되 문단마다 1~2곳만 강조하라. 비교·추세·절차의 이해를 실제로 돕는 Markdown 표·차트·Mermaid 도식 중 적합한 형식을 사용하고, 청약·분양이면 공식 공고와 확인된 LH·청약홈 등 신청 링크를 본문에 넣어라. 핵심 주장 바로 뒤에 원문 링크를 넣고 모든 URL을 editorial.sources에 기록하라. 개인별 매수·매도·대출·당첨을 권하거나 보장하지 마라. 생성 글은 editorial.authorship: ai-generated, reviewed: false로 표시하라. 기존 taxonomy와 content schema를 지키고 URL 중복을 피하라. 생성이 끝나면 사실·해석 분리, 반대 시나리오, 다음 체크포인트, 출처 완전성을 자체 검토한 뒤 npm test와 npm run build를 실행하라. 둘 중 하나라도 실패하면 파일을 커밋하지 말고 원인을 출력하라. 모두 통과하면 생성된 글만 master에 커밋하고 origin master로 push하라. 이미 오늘 해당 영역에 충분한 글이 있으면 중복을 만들지 말고 건너뛰어라." >> "$LOG_DIR/codenexus-codex-daily.log" 2>&1
then
  # Notify through the existing toss-invest-bot Telegram bot only after
  # Codex reports a successful publish (including validation and push).
  published_titles="$(
    git diff-tree --no-commit-id --name-only -r HEAD -- src/content/posts |
      while IFS= read -r file; do
        [ -f "$file" ] || continue
        awk -F': ' '/^title: / {print substr($0, 8); exit}' "$file"
      done
  )"
  [ -n "$published_titles" ] || published_titles="제목 목록을 확인할 수 없습니다."
  telegram_message="✅ CodeNexus 오늘 포스팅 자동 발행 완료\\n\\n발행된 글:\\n${published_titles}\\n\\n발행 시각: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  (
    cd /Users/andrew/dev/toss-invest-bot
    set -a
    source .env
    set +a
    TELEGRAM_MESSAGE="$telegram_message" .venv/bin/python -c 'import os; from src.notify import Notifier; Notifier(os.environ["TELEGRAM_BOT_TOKEN"], os.environ["TELEGRAM_CHAT_ID"]).send(os.environ["TELEGRAM_MESSAGE"])'
  ) >> "$LOG_DIR/codenexus-codex-daily.log" 2>&1 || \
    echo "$(date '+%Y-%m-%d %H:%M:%S') Telegram notification failed" >> "$LOG_DIR/codenexus-codex-daily.log"
fi
