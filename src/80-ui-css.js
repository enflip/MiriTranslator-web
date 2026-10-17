// ==========================================================================
  // 80 — Styles (injected into the page, host element uses a shadow root)
// ==========================================================================

  /** Styles that must live in the page itself (bilingual text, hidden originals). */
  const PAGE_CSS = `
.mt-bi {
  display: block;
  margin: 2px 0 8px;
  color: #5f6368;
  font-style: normal;
  font-size: .95em;
  line-height: 1.5;
  opacity: .95;
  unicode-bidi: isolate;
}
html[data-theme="dark"] .mt-bi, body[data-mt-theme="dark"] .mt-bi { color: #bdc1c6; }
.mt-bi[dir="rtl"] { text-align: right; }
.mt-orig-hidden { display: none !important; }
[data-mt] { all: revert; }
`;

  /** UI styles — scoped by [data-mt-ui] so nothing leaks into the host page. */
  const UI_CSS = `
:host, * { box-sizing: border-box; }

.mt-root {
  --mt-bg: #ffffff;
  --mt-fg: #202124;
  --mt-muted: #5f6368;
  --mt-faint: #80868b;
  --mt-border: #dadce0;
  --mt-hover: #f1f3f4;
  --mt-accent: #1a73e8;
  --mt-accent-hover: #1b66c9;
  --mt-on-accent: #ffffff;
  --mt-surface: #ffffff;
  --mt-danger: #d93025;
  --mt-shadow: 0 1px 2px 0 rgba(60,64,67,.30), 0 2px 8px 2px rgba(60,64,67,.15);
  --mt-radius: 12px;
  --mt-font: Roboto, "Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI",
             "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", system-ui, sans-serif;

  position: fixed;
  z-index: 2147483600;
  inset: 0;
  pointer-events: none;
  font-family: var(--mt-font);
  font-size: 14px;
  line-height: 1.45;
  color: var(--mt-fg);
  -webkit-tap-highlight-color: transparent;
  text-size-adjust: 100%;
}

.mt-root[data-theme="dark"] {
  --mt-bg: #202124;
  --mt-fg: #e8eaed;
  --mt-muted: #9aa0a6;
  --mt-faint: #80868b;
  --mt-border: #3c4043;
  --mt-hover: #303134;
  --mt-accent: #8ab4f8;
  --mt-accent-hover: #aecbfa;
  --mt-on-accent: #202124;
  --mt-surface: #292a2d;
  --mt-danger: #f28b82;
  --mt-shadow: 0 1px 2px 0 rgba(0,0,0,.6), 0 2px 10px 2px rgba(0,0,0,.4);
}

/* ------------------------------------------------------------------ FAB */
.mt-fab {
  position: absolute;
  right: max(18px, env(safe-area-inset-right));
  bottom: calc(18px + env(safe-area-inset-bottom));
  width: 54px;
  height: 54px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--mt-surface);
  box-shadow: var(--mt-shadow);
  cursor: pointer;
  pointer-events: auto;
  display: grid;
  place-items: center;
  transition: transform .18s cubic-bezier(.2,0,0,1), box-shadow .18s ease, opacity .18s ease;
  animation: mt-fab-in .32s cubic-bezier(.2,0,0,1);
}
.mt-fab[hidden] { display: none; }
.mt-fab:hover { box-shadow: 0 2px 6px rgba(60,64,67,.3), 0 8px 26px rgba(60,64,67,.25); }
.mt-fab:active { transform: scale(.94); }
.mt-fab:focus-visible { outline: 2px solid var(--mt-accent); outline-offset: 3px; }
.mt-root[data-open="1"] .mt-fab { transform: scale(0); opacity: 0; pointer-events: none; }

.mt-fab__icon { width: 26px; height: 26px; display: block; border-radius: 6px; }
.mt-fab__ring {
  position: absolute;
  inset: -3px;
  width: calc(100% + 6px);
  height: calc(100% + 6px);
  transform: rotate(-90deg);
  pointer-events: none;
  opacity: 0;
  transition: opacity .2s ease;
}
.mt-fab__ring circle { fill: none; stroke: var(--mt-accent); stroke-width: 3; stroke-linecap: round; }
.mt-fab__track { stroke: var(--mt-border); opacity: .35; }
.mt-root[data-busy="1"] .mt-fab__ring { opacity: 1; }
.mt-root[data-busy="1"] .mt-fab__icon { opacity: .35; }

@keyframes mt-fab-in { from { transform: scale(.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }

/* --------------------------------------------------------------- popup */
.mt-pop {
  position: absolute;
  right: max(18px, env(safe-area-inset-right));
  bottom: calc(84px + env(safe-area-inset-bottom));
  width: 352px;
  max-width: calc(100vw - 24px);
  background: var(--mt-bg);
  border-radius: var(--mt-radius);
  box-shadow: var(--mt-shadow);
  pointer-events: auto;
  overflow: visible;
  transform-origin: bottom right;
  animation: mt-pop-in .2s cubic-bezier(.2,0,0,1);
  color-scheme: light;
}
.mt-root[data-theme="dark"] .mt-pop { color-scheme: dark; }
.mt-pop[hidden] { display: none; }
.mt-pop::after {
  content: "";
  position: absolute;
  right: 24px;
  bottom: -7px;
  width: 14px;
  height: 14px;
  background: var(--mt-bg);
  transform: rotate(45deg);
  border-radius: 0 0 3px 0;
}

@keyframes mt-pop-in { from { transform: translateY(12px) scale(.94); opacity: 0; } to { transform: none; opacity: 1; } }

.mt-pop__handle { display: none; }

.mt-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 14px 12px 6px 16px;
}
.mt-row__spacer { flex: 1 1 auto; }

/* --------------------------------------------------- language controls */
.mt-lang {
  position: relative;
  flex: 0 1 auto;
  min-width: 0;
}
.mt-lang__btn {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-width: 0;
  max-width: 148px;
  height: 36px;
  padding: 0 10px;
  border: 0;
  border-radius: 18px;
  background: transparent;
  color: var(--mt-fg);
  font: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s ease;
}
.mt-lang__btn:hover, .mt-lang__btn[aria-expanded="true"] { background: var(--mt-hover); }
.mt-lang__btn:focus-visible { outline: 2px solid var(--mt-accent); outline-offset: -2px; }
.mt-lang__label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mt-lang__chev { width: 16px; height: 16px; flex: 0 0 16px; opacity: .7; }
.mt-lang[data-role="src"] .mt-lang__btn { color: var(--mt-muted); }

.mt-swap {
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--mt-muted);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background .15s ease, transform .2s ease;
}
.mt-swap:hover { background: var(--mt-hover); color: var(--mt-fg); }
.mt-swap:active { transform: rotate(180deg); }
.mt-swap:focus-visible { outline: 2px solid var(--mt-accent); }

.mt-icon {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--mt-muted);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background .15s ease, color .15s ease;
}
.mt-icon:hover { background: var(--mt-hover); color: var(--mt-fg); }
.mt-icon:focus-visible { outline: 2px solid var(--mt-accent); }
.mt-icon svg { width: 20px; height: 20px; }

/* --------------------------------------------------------- lang menu */
.mt-menu {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  min-width: 260px;
  max-width: 320px;
  padding: 8px;
  background: var(--mt-bg);
  border-radius: var(--mt-radius);
  box-shadow: var(--mt-shadow);
  z-index: 20;
}
.mt-menu[hidden] { display: none; }
.mt-menu[data-dir="up"] { top: auto; bottom: calc(100% + 2px); }
.mt-overflow[data-dir="up"] { top: auto; bottom: calc(100% + 4px); }
.mt-lang[data-role="src"] .mt-menu { left: 0; right: auto; }
.mt-lang[data-role="tgt"] .mt-menu { left: auto; right: 0; }
.mt-menu__search {
  width: 100%;
  height: 36px;
  margin-bottom: 6px;
  padding: 0 12px;
  border: 1px solid var(--mt-border);
  border-radius: 18px;
  background: var(--mt-bg);
  color: var(--mt-fg);
  font: inherit;
}
.mt-menu__search:focus { outline: none; border-color: var(--mt-accent); }
.mt-menu__list { max-height: 260px; overflow-y: auto; overscroll-behavior: contain; margin: 0; padding: 0; list-style: none; }
.mt-menu__opt {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--mt-fg);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.mt-menu__opt:hover, .mt-menu__opt:focus-visible { background: var(--mt-hover); outline: none; }
.mt-menu__opt[aria-selected="true"] { color: var(--mt-accent); font-weight: 500; }
.mt-menu__opt[aria-selected="true"]::after { content: "✓"; margin-left: auto; font-weight: 700; }
.mt-menu__opt[hidden] { display: none; }
.mt-menu__native { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mt-menu__en { flex: 0 0 auto; color: var(--mt-faint); font-size: 12px; }

/* --------------------------------------------------------------- body */
.mt-body { padding: 4px 16px 0; min-height: 22px; }
.mt-hint { margin: 0 0 10px; color: var(--mt-muted); font-size: 13px; }
.mt-hint[hidden] { display: none; }
.mt-status { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; color: var(--mt-muted); font-size: 13px; }
.mt-spinner {
  width: 15px; height: 15px; flex: 0 0 15px;
  border: 2px solid var(--mt-border); border-top-color: var(--mt-accent);
  border-radius: 50%; animation: mt-spin .8s linear infinite;
}
@keyframes mt-spin { to { transform: rotate(360deg); } }

.mt-bar { height: 4px; border-radius: 2px; background: var(--mt-border); overflow: hidden; margin: 0 0 12px; }
.mt-bar[hidden] { display: none; }
.mt-bar__fill { height: 100%; width: 0; background: var(--mt-accent); transition: width .2s ease; }

.mt-err { margin: 0 0 10px; color: var(--mt-danger); font-size: 13px; }
.mt-err[hidden] { display: none; }

.mt-engine-line { margin: -2px 0 10px; font-size: 11.5px; color: var(--mt-faint); }
.mt-engine-line[hidden] { display: none; }

.mt-orig {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 0 0 10px;
  padding: 8px 10px;
  border-left: 3px solid var(--mt-border);
  background: var(--mt-hover);
  border-radius: 0 8px 8px 0;
  color: var(--mt-muted);
  font-size: 13px;
}
.mt-orig[hidden] { display: none; }
.mt-orig__text { flex: 1 1 auto; max-height: 4.6em; overflow: hidden; }

/* ------------------------------------------------------------ actions */
.mt-actions { display: flex; align-items: center; gap: 8px; padding: 4px 12px 12px 16px; }
.mt-btn {
  height: 40px;
  padding: 0 24px;
  border: 0;
  border-radius: 8px;
  background: var(--mt-accent);
  color: var(--mt-on-accent);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s ease, box-shadow .15s ease, transform .1s ease;
}
.mt-btn:hover { background: var(--mt-accent-hover); }
.mt-btn:active { transform: scale(.98); }
.mt-btn:focus-visible { outline: 2px solid var(--mt-accent); outline-offset: 2px; }
.mt-btn[disabled] { opacity: .55; cursor: default; }
.mt-btn--block { flex: 1 1 auto; }
.mt-btn--ghost { background: transparent; color: var(--mt-accent); padding: 0 12px; font-weight: 500; }
.mt-btn--ghost:hover { background: var(--mt-hover); }
.mt-btn--quiet { background: transparent; color: var(--mt-muted); }
.mt-btn--quiet:hover { background: var(--mt-hover); color: var(--mt-fg); }
.mt-actions[hidden] { display: none; }

/* -------------------------------------------------------- overflow UI */
.mt-overflow {
  position: absolute;
  right: 6px;
  top: calc(100% + 4px);
  min-width: 232px;
  padding: 8px;
  background: var(--mt-bg);
  border-radius: var(--mt-radius);
  box-shadow: var(--mt-shadow);
  z-index: 20;
}
.mt-overflow[hidden] { display: none; }
.mt-overflow__item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 10px 12px; border: 0; border-radius: 8px;
  background: transparent; color: var(--mt-fg); font: inherit; text-align: left; cursor: pointer;
}
.mt-overflow__item:hover { background: var(--mt-hover); }
.mt-overflow__item .mt-check { margin-left: auto; color: var(--mt-accent); font-weight: 700; }
.mt-overflow__item small { display: block; color: var(--mt-faint); font-size: 11px; }

/* ------------------------------------------------------------ settings */
.mt-sheet {
  position: absolute;
  right: max(18px, env(safe-area-inset-right));
  bottom: calc(84px + env(safe-area-inset-bottom));
  width: 420px;
  max-width: calc(100vw - 24px);
  max-height: min(78vh, 680px);
  display: flex;
  flex-direction: column;
  background: var(--mt-bg);
  border-radius: var(--mt-radius);
  box-shadow: var(--mt-shadow);
  pointer-events: auto;
  overflow: hidden;
  animation: mt-pop-in .2s cubic-bezier(.2,0,0,1);
}
.mt-sheet[hidden] { display: none; }
.mt-sheet__head {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 10px 14px 20px;
  border-bottom: 1px solid var(--mt-border);
}
.mt-sheet__title { flex: 1 1 auto; font-size: 16px; font-weight: 500; }
.mt-sheet__body { flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain; padding: 8px 20px 20px; }
.mt-sheet__foot { display: flex; gap: 8px; padding: 12px 20px calc(12px + env(safe-area-inset-bottom)); border-top: 1px solid var(--mt-border); }

.mt-field { margin-top: 18px; }
.mt-field__label { display: block; margin-bottom: 8px; font-size: 12px; font-weight: 500; letter-spacing: .02em; color: var(--mt-muted); text-transform: uppercase; }
.mt-field__hint { margin: 6px 0 0; font-size: 12px; color: var(--mt-faint); line-height: 1.5; }
.mt-input, .mt-textarea {
  width: 100%; min-height: 40px; padding: 9px 12px;
  border: 1px solid var(--mt-border); border-radius: 8px;
  background: var(--mt-bg); color: var(--mt-fg); font: inherit;
}
.mt-textarea { min-height: 76px; resize: vertical; line-height: 1.5; }
.mt-input:focus, .mt-textarea:focus { outline: none; border-color: var(--mt-accent); box-shadow: 0 0 0 1px var(--mt-accent); }
.mt-input::placeholder, .mt-textarea::placeholder { color: var(--mt-faint); }

.mt-select {
  width: 100%; height: 40px; padding: 0 36px 0 12px;
  border: 1px solid var(--mt-border); border-radius: 8px;
  background: var(--mt-bg); color: var(--mt-fg); font: inherit;
  appearance: none; cursor: pointer;
  background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position: calc(100% - 18px) 17px, calc(100% - 13px) 17px;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
}
.mt-select:focus { outline: none; border-color: var(--mt-accent); }

.mt-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.mt-chip {
  padding: 8px 14px; border: 1px solid var(--mt-border); border-radius: 18px;
  background: transparent; color: var(--mt-fg); font: inherit; cursor: pointer;
}
.mt-chip[aria-pressed="true"] { background: var(--mt-accent); border-color: var(--mt-accent); color: var(--mt-on-accent); }

.mt-switch { display: flex; align-items: flex-start; gap: 12px; padding: 11px 0; cursor: pointer; }
.mt-switch__text { flex: 1 1 auto; }
.mt-switch__text b { display: block; font-weight: 500; }
.mt-switch__text small { color: var(--mt-faint); font-size: 12px; line-height: 1.45; }
.mt-switch input { position: absolute; opacity: 0; width: 0; height: 0; }
.mt-switch__track {
  flex: 0 0 auto; width: 40px; height: 22px; margin-top: 1px;
  border-radius: 11px; background: var(--mt-border); position: relative; transition: background .2s ease;
}
.mt-switch__track::after {
  content: ""; position: absolute; top: 3px; left: 3px;
  width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.3);
  transition: transform .2s cubic-bezier(.2,0,0,1);
}
.mt-switch input:checked + .mt-switch__track { background: var(--mt-accent); }
.mt-switch input:checked + .mt-switch__track::after { transform: translateX(18px); }
.mt-switch input:focus-visible + .mt-switch__track { outline: 2px solid var(--mt-accent); outline-offset: 2px; }

.mt-engine {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border: 1px solid var(--mt-border); border-radius: 10px; margin-bottom: 8px;
}
.mt-engine__dot { width: 10px; height: 10px; border-radius: 50%; flex: 0 0 10px; }
.mt-engine__meta { flex: 1 1 auto; min-width: 0; }
.mt-engine__meta b { display: block; font-weight: 500; }
.mt-engine__meta small { color: var(--mt-faint); font-size: 11.5px; }
.mt-tag {
  flex: 0 0 auto; padding: 2px 8px; border-radius: 10px;
  background: var(--mt-hover); color: var(--mt-muted); font-size: 11px;
}
.mt-tag--free { background: #e6f4ea; color: #137333; }
.mt-root[data-theme="dark"] .mt-tag--free { background: #14421f; color: #81c995; }
.mt-tag--warn { background: #fef7e0; color: #8a5a00; }
.mt-root[data-theme="dark"] .mt-tag--warn { background: #3d2f00; color: #fdd663; }

.mt-keys { margin-top: 8px; padding: 12px; border-radius: 10px; background: var(--mt-hover); }
.mt-keys[hidden] { display: none; }
.mt-keys .mt-field:first-child { margin-top: 0; }

.mt-note { margin: 14px 0 0; padding: 10px 12px; border-radius: 8px; background: var(--mt-hover); color: var(--mt-muted); font-size: 12px; line-height: 1.55; }
.mt-note a { color: var(--mt-accent); }
.mt-list-reset { margin: 0; padding: 0; list-style: none; }
.mt-shortcut { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px solid var(--mt-border); }
.mt-shortcut:last-child { border-bottom: 0; }
.mt-shortcut kbd {
  padding: 2px 7px; border: 1px solid var(--mt-border); border-bottom-width: 2px;
  border-radius: 5px; background: var(--mt-hover); font: 12px/1.6 var(--mt-font);
}

/* ------------------------------------------------------ selection pill */
.mt-pill {
  position: absolute;
  display: inline-flex; align-items: center; gap: 6px;
  height: 34px; padding: 0 12px;
  border-radius: 17px; background: var(--mt-surface); color: var(--mt-fg);
  box-shadow: var(--mt-shadow);
  pointer-events: auto; font: inherit; font-size: 13px; font-weight: 500;
  cursor: pointer; white-space: nowrap;
  animation: mt-fab-in .16s cubic-bezier(.2,0,0,1);
}
.mt-pill[hidden] { display: none; }
.mt-pill:hover { background: var(--mt-hover); }
.mt-pill__icon { width: 17px; height: 17px; flex: 0 0 17px; }
.mt-pill__icon svg { width: 100%; height: 100%; display: block; border-radius: 4px; }

/* -------------------------------------------------------------- toast */
.mt-toast {
  position: absolute;
  left: 50%; bottom: calc(24px + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  max-width: min(420px, calc(100vw - 32px));
  padding: 11px 18px; border-radius: 8px;
  background: #323232; color: #fff; box-shadow: var(--mt-shadow);
  pointer-events: none; font-size: 13px; text-align: center;
  animation: mt-toast-in .2s ease;
}
.mt-toast[hidden] { display: none; }
@keyframes mt-toast-in { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }

/* ------------------------------------------------------------- mobile */
@media (max-width: 700px) {
  .mt-fab { width: 48px; height: 48px; right: max(14px, env(safe-area-inset-right)); bottom: calc(14px + env(safe-area-inset-bottom)); }
  .mt-fab__icon { width: 23px; height: 23px; }
  .mt-fab[hidden] { display: none; }

  .mt-pop, .mt-sheet {
    right: 0; left: 0;
    bottom: 0;
    width: auto;
    max-width: none;
    max-height: 88vh;
    border-radius: 16px 16px 0 0;
    padding-bottom: env(safe-area-inset-bottom);
    transform-origin: bottom center;
    animation: mt-sheet-in .26s cubic-bezier(.2,0,0,1);
    overflow: hidden;
  }
  .mt-pop::after { display: none; }
  @keyframes mt-sheet-in { from { transform: translateY(18px); opacity: 0; } to { transform: none; opacity: 1; } }

  .mt-pop__handle {
    display: block; width: 34px; height: 4px; margin: 8px auto 0;
    border-radius: 2px; background: var(--mt-border);
  }
  .mt-row { padding: 10px 8px 4px 12px; gap: 2px; }
  .mt-lang__btn { max-width: 38vw; height: 44px; }
  .mt-swap, .mt-icon { width: 44px; height: 44px; }
  .mt-body { padding: 4px 14px 0; }
  .mt-actions { padding: 4px 12px 14px; }
  .mt-btn { height: 46px; flex: 1 1 auto; }
  .mt-btn--ghost, .mt-btn--quiet { flex: 0 0 auto; }

  /* On phones the picker fills the whole sheet, like Chrome on Android.
     The language group must go static so the menu anchors to the sheet
     instead of the button. Selectors here are deliberately more specific
     than the desktop rules above. */
  .mt-lang { position: static; }
  .mt-root .mt-lang[data-role] .mt-menu,
  .mt-root .mt-pop .mt-overflow {
    top: 0; left: 0; right: 0; bottom: 0;
    min-width: 0; max-width: none;
    max-height: 100%;
    overflow-y: auto;
    overscroll-behavior: contain;
    border-radius: 0;
    transform: none;
    padding: 10px 8px 14px;
  }
  .mt-menu__search { height: 44px; margin-bottom: 8px; }
  .mt-menu__list { max-height: none; }
  .mt-menu__opt { padding: 13px 14px; }
  .mt-sheet__body { padding: 8px 16px 20px; }
  .mt-sheet__head { padding: 14px 6px 14px 16px; }
  .mt-sheet__foot { padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); }
  .mt-pill { height: 40px; border-radius: 20px; }
}

@media (min-width: 701px) {
  .mt-pop__handle { display: none; }
}

@media (pointer: coarse) {
  .mt-lang__btn, .mt-btn, .mt-chip, .mt-menu__opt { min-height: 44px; }
}

@media (prefers-reduced-motion: reduce) {
  .mt-fab, .mt-pop, .mt-sheet, .mt-pill, .mt-toast { animation: none; transition: none; }
}
`;