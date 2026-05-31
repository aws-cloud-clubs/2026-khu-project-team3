# 사주홈런 프론트엔드 개발 명세서 (SPEC)

> 본 문서는 `project/design`의 3개 HTML 프로토타입(`main_home.html`, `player_lineup.html`,
> `player_fortune.html`)을 Next.js 14 실서비스 구조로 전환하기 위한 **구현 명세서**다.
> 이 문서만 보고 바로 개발에 착수할 수 있도록 폴더 구조 · 타입 · 컴포넌트 props · 디자인 토큰 ·
> mock 데이터 · 설정 파일을 모두 명시한다.

---

## 1. 목표 및 기술 스택

HTML 프로토타입을 유지보수 · 확장 가능한 실서비스 구조로 변환한다.

| 항목 | 결정 |
|---|---|
| 프레임워크 | **Next.js 14 App Router** |
| 언어 | **TypeScript strict mode** (`any`/`React.FC` 금지) |
| 스타일 | **TailwindCSS** (CLOVER 디자인 토큰 이식) |
| 컴포넌트 | **Server Component 우선**, Client는 인터랙션 5곳으로 한정 |
| 데이터 | **Repository Layer**(`lib/api/*`) 경유, 화면에서 mock 직접 참조 금지 |
| 이미지 | **`next/image` + `remotePatterns`** + 이니셜 폴백 |
| SEO | 각 동적 페이지 `generateMetadata` |
| 배포 | **Docker** (Next.js `output: "standalone"`) |

### 디자인 시스템 = "CLOVER" (MD3 아님)
3개 HTML은 공통적으로 **CLOVER 커스텀 토큰**(녹색 스펙트럼 기반)을 사용한다.
원본 프롬프트가 언급한 "Material Design 3 토큰"이 아니라, **아래 §6의 CLOVER 토큰을 Tailwind에 이식**한다.

### 원본 프롬프트 대비 보정 사항 (실제 디자인 기준)
- ❌ **BottomNav 제외** — 3개 HTML 어디에도 하단 네비게이션이 렌더링되지 않음(`.nav-active` CSS는 미사용 잔재).
- ✅ **라우트는 디자인 3개만** — `/`, `/games/[id]/lineup`, `/players/[id]/fortune`.
  (원본 트리의 `players/[id]/page.tsx`, `app/fortune/page.tsx`는 디자인 부재로 제외)
- ✅ 단건 조회 미존재 시 `null` 반환 → 페이지에서 `notFound()` (404 처리 보강).
- ✅ 팀 색상/이모지/약어를 `constants/teams.ts`로 중앙화 (디자인 중복 제거).
- ✅ 선수 아바타 이미지 부재 시 **이니셜 폴백**(디자인에 "CE", "RY" 등 이니셜 표기 존재).
- ⚠️ `player_fortune.html`의 `.injury-card`, `.score-ring-wrap` CSS는 정의만 되고 미렌더링 → 본 명세 범위 제외(향후 확장용 주석으로만).

---

## 2. 페이지 매핑

| 디자인 파일 | 라우트 | 화면 | 주요 구성 |
|---|---|---|---|
| `main_home.html` | `/` | 홈 | 오늘의 경기(가로 스크롤 카드), KBO 순위표 |
| `player_lineup.html` | `/games/[id]/lineup` | 경기 상세 | 매치 헤더, 홈/원정 탭, 선발 라인업 |
| `player_fortune.html` | `/players/[id]/fortune` | 선수 운세 | 선수 히어로, 별자리 운세, 사주팔자 운세 |

**화면 전환 흐름**: 홈 경기카드 탭 → 라인업, 라인업 선수행 탭 → 운세, 상세 화면 `arrow_back` → 이전 화면.

---

## 3. 최종 폴더 구조

```
frontend/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                 # 폰트(next/font) + 모바일 컨테이너 + 메타데이터 기본값
│  │  ├─ globals.css                # Tailwind base + CLOVER 베이스 + Material Symbols
│  │  ├─ page.tsx                   # 홈 (Server)
│  │  ├─ loading.tsx
│  │  ├─ error.tsx                  # 'use client'
│  │  ├─ not-found.tsx              # 공통 404
│  │  ├─ games/
│  │  │  └─ [id]/
│  │  │     └─ lineup/
│  │  │        ├─ page.tsx          # 라인업 (Server)
│  │  │        ├─ loading.tsx
│  │  │        └─ error.tsx         # 'use client'
│  │  └─ players/
│  │     └─ [id]/
│  │        └─ fortune/
│  │           ├─ page.tsx          # 운세 (Server)
│  │           ├─ loading.tsx
│  │           └─ error.tsx         # 'use client'
│  ├─ components/
│  │  ├─ layout/
│  │  │  ├─ AppHeader.tsx           # 상단바(로고). variant로 back/share 토글
│  │  │  ├─ BackButton.tsx          # 'use client' — useRouter().back()
│  │  │  └─ ShareButton.tsx         # 'use client' — navigator.share 폴백
│  │  ├─ home/
│  │  │  ├─ LiveGamesSection.tsx    # 'use client' — 가로 스크롤 + 좌우 화살표
│  │  │  ├─ GameCard.tsx            # Server — Link로 라인업 이동
│  │  │  ├─ RankingTable.tsx        # Server
│  │  │  └─ RankRow.tsx             # Server
│  │  ├─ lineup/
│  │  │  ├─ MatchHero.tsx           # Server
│  │  │  ├─ LineupTabs.tsx          # 'use client' — 홈/원정 탭 + 패널 전환
│  │  │  ├─ PlayerRow.tsx           # Server — Link로 운세 이동
│  │  │  └─ PlayerAvatar.tsx        # Server — 이미지/이니셜 폴백
│  │  ├─ fortune/
│  │  │  ├─ PlayerHero.tsx          # Server
│  │  │  └─ FortuneCard.tsx         # Server — 별자리/사주 공용 + score bar
│  │  └─ ui/
│  │     ├─ Card.tsx                # 공용 카드
│  │     ├─ Badge.tsx               # 공용 배지
│  │     ├─ SectionTitle.tsx        # 좌측 점 + 타이틀
│  │     └─ Icon.tsx                # Material Symbols 래퍼
│  ├─ lib/
│  │  ├─ api/
│  │  │  ├─ games.ts                # getGames(), getGameById(id), getRanking()
│  │  │  ├─ players.ts              # getLineup(gameId), getPlayerById(id)
│  │  │  └─ fortune.ts              # getFortuneByPlayerId(id)
│  │  ├─ data/
│  │  │  └─ mockData.ts             # mock 데이터(디자인 값 그대로)
│  │  └─ constants/
│  │     └─ teams.ts                # 팀별 색상 그라데이션 / 이모지 / 약어
│  ├─ types/
│  │  ├─ game.ts                    # Game, GameStatus, RankingRow, Team
│  │  ├─ player.ts                  # Player, Position, LineupSlot, Lineup
│  │  └─ fortune.ts                 # Fortune, FortuneCardData, OhaengElement
│  └─ hooks/
│     └─ useHorizontalScroll.ts     # 'use client' — 스크롤 컨트롤
├─ public/                          # 빈 폴더라도 존재 보장(.gitkeep)
├─ next.config.ts
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ tsconfig.json
├─ .eslintrc.json
├─ Dockerfile
├─ .dockerignore
└─ package.json
```

---

## 4. 아키텍처 규칙

### 4-1. Server Component 우선
- 모든 `page.tsx`는 **Server Component**. 페이지 파일에 `"use client"` 금지.
- 데이터 fetch는 페이지(Server)에서 `await` 후 props로 하위 컴포넌트에 전달.

### 4-2. Client Component 허용 범위 (정확히 이 5개만)
| 컴포넌트 | 사용 이유 |
|---|---|
| `BackButton` | `useRouter().back()` |
| `ShareButton` | `navigator.share` / 클립보드 폴백 |
| `LiveGamesSection` | 가로 스크롤 + 좌우 화살표 (`useHorizontalScroll`) |
| `LineupTabs` | 홈/원정 탭 상태 전환 (`useState`) |
| `useHorizontalScroll` | 스크롤 DOM 제어 훅 |

> 그 외 카드/행/히어로/뱃지는 모두 Server Component.

### 4-3. 데이터 계층 분리 (Repository Layer)
- 화면에서 `mockData` **직접 import 금지**. 반드시 `lib/api/*` 함수를 통한다.
- 함수는 `async`로 작성해 향후 실 API(fetch) 교체가 무중단이 되도록 한다.
- **단건 조회는 미존재 시 `null` 반환** → 페이지에서 `notFound()` 호출.

```ts
// lib/api/games.ts (시그니처 예시)
export async function getGames(): Promise<Game[]>            // 오늘의 경기
export async function getRanking(): Promise<RankingRow[]>    // KBO 순위
export async function getGameById(id: string): Promise<Game | null>

// 페이지 사용 예시 (games/[id]/lineup/page.tsx)
const game = await getGameById(params.id);
if (!game) notFound();
```

### 4-4. 타입 분리
- 단일 `types.ts` 금지. `game.ts` / `player.ts` / `fortune.ts`로 분리(§7).

### 4-5. SEO
- 각 동적 페이지에 `generateMetadata` 작성.
  - 홈: 고정 title/description.
  - 라인업: `${home.name} vs ${away.name} 선발 라인업` 포함.
  - 운세: `${player.name} 오늘의 운세` 포함.

### 4-6. Loading / Error / 404
- 각 동적 라우트에 `loading.tsx`, `error.tsx`(`"use client"`) 생성.
- 루트 `not-found.tsx` 생성. 단건 조회 실패 시 `notFound()`로 연결.

### 4-7. 접근성 (보강)
- 가로 스크롤 좌/우 버튼: `aria-label="이전 경기"` / `"다음 경기"`.
- 탭: `role="tablist"` / `role="tab"` + `aria-selected`, 패널 `role="tabpanel"`.
- 클릭 가능한 경기카드 · 선수행은 `<button>`/`<div onclick>`이 아니라 **`<Link>`** 로 구현(키보드 포커스 가능).
- 모든 이미지 `alt` 필수. Material Symbols 장식 아이콘은 `aria-hidden`.

### 4-8. 코드 품질
- ESLint 통과, `tsc --noEmit` 무에러, `any`·`React.FC` 금지.
- `prettier-plugin-tailwindcss`로 클래스 정렬.

---

## 5. 컴포넌트별 상세 스펙

> Props는 모두 명시 인터페이스. 디자인 영역과 1:1 매핑.

### 5-1. layout
- **`AppHeader`** — sticky 상단바. `max-w-container mx-auto px-5 py-[11px]`, 흰 배경 + blur + 하단 shadow.
  - props: `{ showBack?: boolean; showShare?: boolean; shareIcon?: "share" | "ios_share" }`
  - 좌측: (showBack 시) `BackButton` + 클로버 SVG 로고 + "사주홈런" 텍스트.
  - 우측: (showShare 시) `ShareButton`.
  - 홈 = `{}`(로고만), 라인업 = `{ showBack, showShare, shareIcon:"share" }`, 운세 = `{ showBack, showShare, shareIcon:"ios_share" }`.
- **`BackButton`** (client) — 원형 버튼, `arrow_back` 아이콘, `onClick={() => router.back()}`.
- **`ShareButton`** (client) — 원형 버튼, `navigator.share` 시도 후 미지원 시 클립보드 복사 폴백.

### 5-2. home (`/`)
- **`LiveGamesSection`** (client) — 카드 `Card`로 감싼 "오늘의 경기" 섹션.
  - `SectionTitle("오늘의 경기")` + 좌우 화살표 버튼 + 가로 스크롤 컨테이너(`.no-scrollbar`, `scroll-snap-type:x mandatory`).
  - props: `{ games: Game[] }`. 스크롤 제어는 `useHorizontalScroll`.
  - 각 카드는 `GameCard` 너비 100%(한 화면 1카드, snap-align:start).
- **`GameCard`** (server) — `<Link href={'/games/'+game.id+'/lineup'}>`.
  - 상단: 상태 배지(`오늘`/`예정`) + `${time} · ${stadium}`.
  - 본문: 홈 team-badge(이모지+그라데이션 원, 48px) — `VS` — 원정 team-badge + 팀명.
  - props: `{ game: Game }`.
- **`RankingTable`** (server) — `Card`로 감싼 "KBO 순위표".
  - 그리드 헤더 `28px 1fr 92px 50px`: 순위 / 팀 / 승-패-무 / 승률.
  - `rows.map` → `RankRow`. props: `{ rows: RankingRow[] }`.
- **`RankRow`** (server) — 그리드 행. 1·2·3위는 gold/silver/bronze 색, 팀 dot(약어) + 팀명, 전적, 승률.
  - props: `{ row: RankingRow }`.

### 5-3. lineup (`/games/[id]/lineup`)
- **`MatchHero`** (server) — `.match-hero` 녹색 카드(`bg-g-600`, radius 24, 장식 원/패턴).
  - 상단: `${date} · ${time} · ${stadium}` 알약 배지.
  - 중앙: 홈팀(64px 원 + 팀명 + `홈` 배지 + `${fortuneScore}점`) — `VS` — 원정팀(+ `원정` 배지 + 점수).
  - 하단: ✨ 운세 힌트 문구(`${home.name} 행운 지수 ${n}점 vs ...`).
  - props: `{ game: Game }`.
- **`LineupTabs`** (client) — 홈/원정 탭 전환. `useState<'home'|'away'>('home')`.
  - 탭 버튼 2개(이모지+팀명), 활성 탭 그라데이션 강조. 비활성 패널 `hidden`.
  - props: `{ lineup: Lineup }`. 각 패널 내부에서 `PlayerRow` 반복 + "선발 투수" 점선 구분.
- **`PlayerRow`** (server) — `<Link href={'/players/'+player.id+'/fortune'}>`.
  - 그리드 `24px 36px 1fr auto`: 타순(또는 `P`) / `PlayerAvatar` / 선수명 / `pos-badge`(home·away 색).
  - props: `{ slot: LineupSlot; side: "home" | "away" }`.
- **`PlayerAvatar`** (server) — 36px 원. `imageUrl` 있으면 `next/image`, 없으면 `initials` 텍스트.
  - props: `{ imageUrl?: string; initials: string; name: string }`.

### 5-4. fortune (`/players/[id]/fortune`)
- **`PlayerHero`** (server) — `.player-hero` 진녹색 카드(`bg-g-700`, radius 28, 장식 원/패턴).
  - 좌: 선수 사진 100px 원(`next/image`). 우: 팀 태그 + 이름(`<h1>`) + 포지션 태그들.
  - 하단: 🍀 오늘의 한 줄 운세 요약(`summary`).
  - props: `{ player: Player; summary: string }`.
- **`FortuneCard`** (server) — 별자리/사주 공용 카드.
  - 헤더: 아이콘(`fortune-icon-wrap`, Material Symbol) + 카테고리 라벨 + 타이틀(`<h2>`).
  - 옵션 A(별자리): score bar(`fortune-bar-track/fill`, `${score}/100`) + 큰 숫자(`${rank}위`) + 설명.
  - 옵션 B(사주): 오행 뱃지 리스트(🔥 火 등) + 설명 본문.
  - props: `{ card: FortuneCardData }` (variant로 A/B 분기).

### 5-5. ui (공용)
- **`Card`**: `bg-card rounded-[20px] shadow-card`, `className` 병합.
- **`Badge`**: 알약 배지. `variant`: `scheduled` / `home` / `away` / `ohaeng` 등.
- **`SectionTitle`**: 좌측 그라데이션 점(7px) + 굵은 타이틀.
- **`Icon`**: `<span className="material-symbols-outlined" aria-hidden>` 래퍼. props `{ name, size?, fill? }`.

---

## 6. 디자인 토큰 → Tailwind 매핑

### 6-1. `tailwind.config.ts` (`theme.extend`)

```ts
colors: {
  g:    { 50:'#f0fdf5',100:'#dcfce8',200:'#bbf7d0',300:'#86efad',400:'#4ade81',
          500:'#22c55e',600:'#16a34a',700:'#15803d',800:'#166534',900:'#14532d' },
  sage: { 50:'#f6f9f7',100:'#eaf0ec',200:'#d1e4d8',300:'#a8c9b5' },
  mint: { 50:'#f0fbf7',100:'#d5f5e8' },
  text: { 900:'#111b14',700:'#1e3326',500:'#3d5a46',300:'#7b9282',100:'#b4c4bc' },
  ivory:'#faf9f6', warm:'#fafaf8',
  card: '#edf8f2',                       // 카드 배경
},
borderColor:  { DEFAULT: 'rgba(134,239,172,0.22)' },
maxWidth:     { container: '448px' },     // 모바일 컨테이너 폭
fontFamily:   { sans: ['var(--font-noto)','sans-serif'],
                display: ['var(--font-inter)','sans-serif'] },
boxShadow: {
  xs:  '0 1px 8px rgba(21,128,61,0.05)',
  sm:  '0 2px 16px rgba(21,128,61,0.08)',
  md:  '0 6px 32px rgba(21,128,61,0.12)',
  lg:  '0 12px 48px rgba(21,128,61,0.18)',
  card:'0 4px 24px rgba(21,128,61,0.12), 0 1px 8px rgba(21,128,61,0.07)',
},
keyframes: { sparkle: { '0%,100%':{opacity:'1',transform:'scale(1) rotate(0)'},
             '33%':{opacity:'.8',transform:'scale(1.15) rotate(5deg)'},
             '66%':{opacity:'.9',transform:'scale(1.07) rotate(-3deg)'} } },
animation: { sparkle: 'sparkle 3s ease-in-out infinite' },
```

### 6-2. `globals.css` (`@layer`)
- 폰트: `layout.tsx`에서 `next/font/google`로 **Noto Sans KR**(300/400/500/700/900) + **Inter** 로드 →
  CSS 변수 `--font-noto` / `--font-inter`를 body에 연결.
- Material Symbols Outlined: `@import` 또는 `<link>`로 로드 + `.material-symbols-outlined` 베이스 클래스.
- 유틸: `.no-scrollbar`(스크롤바 숨김), `.fortune-bar-track/fill`, `.player-hero/match-hero` 장식 패턴
  은 `@layer components`로 이식하거나 컴포넌트 인라인 클래스로 표현.
- 타이포(디자인 기준): section-title 15/800, h1(히어로) 26/900, h2(운세) 16/800,
  선수명 14/700, 본문 13, 라벨 10~11.

---

## 7. 타입 정의

### 7-1. `types/game.ts`
```ts
export type GameStatus = 'today' | 'scheduled' | 'live' | 'finished';

export interface Team {
  id: string;          // 'hanwha'
  name: string;        // '한화'
  fullName: string;    // '한화 이글스'
  emoji: string;       // '🦅'
  abbr: string;        // 'H'
  gradient: [string, string]; // ['#F76E11','#FF9F29']
}

export interface Game {
  id: string;
  status: GameStatus;
  statusLabel: string; // '오늘' | '예정'
  time: string;        // '18:30'
  stadium: string;     // '잠실구장'
  date?: string;       // '2026.05.28' (상세에서 사용)
  home: Team & { fortuneScore?: number };
  away: Team & { fortuneScore?: number };
}

export interface RankingRow {
  rank: number;        // 1~10
  team: Team;
  wins: number; losses: number; draws: number;
  winRate: string;     // '.613'
}
```

### 7-2. `types/player.ts`
```ts
export type Position =
  | '투수' | '포수' | '1루수' | '2루수' | '3루수' | '유격수'
  | '좌익수' | '중견수' | '우익수' | '지명타자';

export interface Player {
  id: string;
  name: string;
  teamId: string;
  teamFullName: string;   // '한화 이글스'
  positions: Position[];
  imageUrl?: string;
  initials: string;       // 'RY' (이미지 폴백)
}

export interface LineupSlot {
  battingOrder: number | 'P'; // 1~9 또는 선발투수 'P'
  player: Player;
  position: Position;
}

export interface Lineup {
  gameId: string;
  home: { team: Team; slots: LineupSlot[] };
  away: { team: Team; slots: LineupSlot[] };
}
```

### 7-3. `types/fortune.ts`
```ts
export type OhaengElement = '木' | '火' | '土' | '金' | '水';
export type FortuneCardVariant = 'horoscope' | 'saju';

export interface FortuneCardData {
  variant: FortuneCardVariant;
  categoryLabel: string;  // '오하아사 · 별자리 운세'
  title: string;          // '행운의 별자리 TOP 1위'
  icon: string;           // Material Symbol 이름: 'auto_awesome'
  // horoscope 전용
  score?: number;         // 85
  rank?: number;          // 1
  // saju 전용
  element?: OhaengElement; // '火'
  tags?: string[];         // ['추진력 ↑','활동량 ↑']
  // 공통
  description: string;
}

export interface Fortune {
  playerId: string;
  summary: string;        // 히어로 한 줄 요약
  cards: FortuneCardData[];
}
```

---

## 8. Mock 데이터 스펙 (`lib/data/mockData.ts`)

> 디자인의 수치를 그대로 넣어 화면이 프로토타입과 100% 일치하도록 한다.

### 8-1. 팀 상수 (`lib/constants/teams.ts`)
| id | name | fullName | emoji | abbr | gradient |
|---|---|---|---|---|---|
| kia | KIA | KIA 타이거즈 | 🐯 | K | #EA0029→#C4001D |
| samsung | 삼성 | 삼성 라이온즈 | ⭐ | S | #074CA1→#0B5FA5 |
| lg | LG | LG 트윈스 | — | L | #C30452→#A00040 |
| doosan | 두산 | 두산 베어스 | 🐻 | D | #002B5B→#1464A6 |
| kt | KT | KT 위즈 | ⚡ | KT | #1428A0→#1E3FA0 |
| ssg | SSG | SSG 랜더스 | 🦁 | S | #CF1329→#A00E1F |
| lotte | 롯데 | 롯데 자이언츠 | 🐠 | L | #041E42→#0D2240 |
| hanwha | 한화 | 한화 이글스 | 🦅 | H | #F76E11→#FF9F29 |
| nc | NC | NC 다이노스 | 🦈 | N | #315288→#1E3A5F |
| kiwoom | 키움 | 키움 히어로즈 | — | K | #820024→#6B001C |

### 8-2. 오늘의 경기 (홈, 4건)
1. `오늘` 18:30 · 잠실구장 — 한화 🦅 vs 두산 🐻
2. `예정` 18:30 · 수원 — SSG 🦁 vs KT ⚡
3. `예정` 18:30 · 광주 — KIA 🐯 vs 삼성 ⭐
4. `예정` 18:30 · 창원 — NC 🦈 vs 롯데 🐠

### 8-3. KBO 순위표 (10팀)
| 순위 | 팀 | 승-패-무 | 승률 |
|---|---|---|---|
| 1 | KIA | 87-55-2 | .613 |
| 2 | 삼성 | 78-64-2 | .549 |
| 3 | LG | 76-66-2 | .535 |
| 4 | 두산 | 74-68-2 | .521 |
| 5 | KT | 72-70-2 | .507 |
| 6 | SSG | 72-71-2 | .503 |
| 7 | 롯데 | 66-74-4 | .471 |
| 8 | 한화 | 66-76-2 | .465 |
| 9 | NC | 61-81-2 | .430 |
| 10 | 키움 | 58-86-0 | .403 |

### 8-4. 라인업 (예: gameId 기준 — 한화 vs 롯데)
- 메타: `2026.05.28 · 18:30 · 대전 한화생명이글스파크`, 행운지수 한화 78점 / 롯데 65점.
- **한화(홈)**: 1 정은원(2루수), 2 최재훈(포수), 3 노시환(3루수), 4 채은성(1루수), 5 페라자(우익수),
  6 안치홍(지명타자), 7 문현빈(중견수), 8 이도윤(유격수), 9 최인호(좌익수), P 류현진(투수).
- **롯데(원정)**: 1 윤동희(우익수), 2 고승민(2루수), 3 레이예스(좌익수), 4 전준우(지명타자),
  5 정훈(1루수), 6 손호영(3루수), 7 유강남(포수), 8 박승욱(유격수), 9 황성빈(중견수), P 윌커슨(투수).
- 일부 선수만 `imageUrl` 보유, 나머지는 `initials`(예: 채은성 "CE", 류현진 "RY").

### 8-5. 운세 (예: 류현진)
- summary: `오늘의 종합 운세 1위! 모든 기운이 정점에 달했습니다. 집중력과 체력 모두 최상의 상태...`
- card 1 (horoscope): label `오하아사 · 별자리 운세`, icon `auto_awesome`, title `행운의 별자리 TOP 1위`,
  score 85, rank 1, description `모든 일이 뜻대로 풀리는 최고의 하루...`.
- card 2 (saju): label `사주팔자 · 오행 분석`, icon `local_fire_department`, title `금일 사주팔자`,
  element `火`, tags `['추진력 ↑','활동량 ↑']`, description `오늘의 기운은 강한 불(火)의 성질...`.

---

## 9. 반응형

- **Mobile First** 기준 폭: 360 / 390 / 430px.
- 모든 페이지: `<main class="max-w-container mx-auto px-5 pt-[18px] pb-[130px] flex flex-col gap-6">`
  (홈 gap 24px, 라인업 gap 20px, 운세 gap 16px — 디자인별 상이).
- **Tablet 768 / Desktop 1024+**: 컨테이너는 448px 고정, 화면 중앙 정렬(좌우 여백 자동).
- 가로 스크롤 카드는 한 화면당 1카드(snap), 좌우 화살표로 페이지 단위 이동.

---

## 10. 배포 / 설정 파일

### 10-1. `next.config.ts`
```ts
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};
export default nextConfig;
```

### 10-2. `Dockerfile` (multi-stage, standalone)
- `deps` → `builder`(`next build`) → `runner`(standalone 산출물 복사).
- `runner`에서 `.next/standalone`, `.next/static`, `public` 복사.
  **public 폴더가 없어도 빌드가 깨지지 않도록** 빈 `public/.gitkeep`을 두고 `COPY`.
- `EXPOSE 3000`, `CMD ["node","server.js"]`.

### 10-3. `.dockerignore`
- `node_modules`, `.next`, `.git`, `npm-debug.log`, `Dockerfile`, `.dockerignore`.

### 10-4. `tsconfig.json`
- `"strict": true`, `paths`: `"@/*": ["./src/*"]`.

### 10-5. `.eslintrc.json`
- `next/core-web-vitals` + `@typescript-eslint`,
  규칙: `@typescript-eslint/no-explicit-any: error`.

---

## 11. 완료 기준 (Definition of Done)

1. `npm run build` 성공(standalone 산출), `npm run lint` 통과, `tsc --noEmit` 무에러.
2. `any`·`React.FC` 미사용, Tailwind 클래스 정렬 적용.
3. 3개 라우트가 각 디자인과 시각적으로 일치(상단바/카드/색상/타이포/인터랙션).
4. 인터랙션 동작: 홈 경기 가로 스크롤 화살표, 라인업 홈/원정 탭 전환, 뒤로/공유 버튼.
5. 화면 전환 라우팅: 홈→라인업→운세, 뒤로가기.
6. 존재하지 않는 `id` 접근 시 404(`not-found.tsx`) 노출.
7. 접근성: 키보드 포커스 이동, aria 속성, 이미지 alt 적용.

---

## 12. 작업 순서 (권장)

1. 프로젝트 부트스트랩(`create-next-app` + Tailwind + tsconfig paths) → `next.config`/Docker 설정.
2. 디자인 토큰 이식(`tailwind.config.ts`, `globals.css`, 폰트).
3. 타입(`types/*`) → mock 데이터(`constants/teams.ts`, `data/mockData.ts`) → Repository(`lib/api/*`).
4. 공용 UI(`Card`/`Badge`/`SectionTitle`/`Icon`) + `AppHeader`/`BackButton`/`ShareButton`.
5. **main_home** (`/`): `LiveGamesSection`/`GameCard`/`RankingTable`/`RankRow` + `useHorizontalScroll`.
6. **player_lineup** (`/games/[id]/lineup`): `MatchHero`/`LineupTabs`/`PlayerRow`/`PlayerAvatar`.
7. **player_fortune** (`/players/[id]/fortune`): `PlayerHero`/`FortuneCard`.
8. `loading`/`error`/`not-found` + `generateMetadata` 마감 → 린트/빌드/접근성 점검.
