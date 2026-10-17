// ==========================================================================
  // 85 — User interface (shadow DOM, Chrome-like)
// ==========================================================================

  const ICON = {
    translate:
      '<svg viewBox="0 0 48 48" width="26" height="26" aria-hidden="true">' +
      '<rect width="48" height="48" rx="11" fill="#4285f4"/>' +
      '<text x="16.5" y="33" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="29" font-weight="700" fill="#fff">G</text>' +
      '<text x="32" y="31" text-anchor="middle" font-family="var(--mt-cjk, &quot;Malgun Gothic&quot;,&quot;Apple SD Gothic Neo&quot;,&quot;Noto Sans CJK KR&quot;,sans-serif)" font-size="24" font-weight="700" fill="#fff">文</text>' +
      '</svg>',
    chevron: '<svg class="mt-lang__chev" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 10l5 5 5-5z"/></svg>',
    swap:
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6 0 .9-.25 1.74-.68 2.45l1.46 1.46A7.94 7.94 0 0 0 20 13c0-4.42-3.58-8-8-8zm0 14a5.94 5.94 0 0 1-5.32-3.46l-1.46 1.46A7.94 7.94 0 0 0 4 13H2l4 4 4-4H6c0-3.31 2.69-6 6-6 .9 0 1.74.25 2.45.68l1.46-1.46A7.94 7.94 0 0 0 13 5c4.42 0 8 3.58 8 8s-3.58 8-8 8z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>',
    settings:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.14 12.94a7.07 7.07 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.07 7.07 0 0 0 0 1.88L2.83 14.5a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.3.6.22l2.39-.96c.5.37 1.03.7 1.62.94l.36 2.54c.04.24.25.42.5.42h3.84c.25 0 .46-.18.5-.42l.36-2.54c.59-.24 1.12-.57 1.62-.94l2.39.96c.22.08.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>',
    original:
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.5 17.5 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.5 9.75 9 11.35 8.03 10.27 7.23 9.1 6.59 7.9H4.6c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>',
  };

  const T = {
    ko: {
      translate: '번역',
      translateAria: '이 페이지 번역하기',
      detect: '언어 감지',
      search: '언어 검색',
      idleHint: '이 페이지를 번역하려면 아래 버튼을 누르세요.',
      translating: '번역 중…',
      reverting: '원문으로 되돌리는 중…',
      done: '번역이 완료되었습니다',
      showOriginal: '원문 보기',
      backToOriginal: '원문으로 돌아가기',
      retranslate: '다시 번역',
      overflow: '더보기',
      settings: '설정',
      settingsTitle: 'MiriTranslator 설정',
      engineAuto: '자동 선택',
      cancel: '취소',
      save: '저장',
      copy: '복사',
      copied: '복사됨',
      of: '/',
      blocks: '개 구문',
      sameLanguage: '이미 번역할 언어로 되어 있습니다.',
      close: '닫기',
      unsupported: '이 언어를 지원하는 엔진이 없습니다. 다른 언어나 엔진을 선택하세요.',
      selectToTranslate: '드래그하여 번역할 문장을 선택하세요',
    },
    en: {
      translate: 'Translate',
      translateAria: 'Translate this page',
      detect: 'Detect language',
      search: 'Search languages',
      idleHint: 'Tap the button below to translate this page.',
      translating: 'Translating…',
      reverting: 'Restoring original…',
      done: 'Translation complete',
      showOriginal: 'Show original',
      backToOriginal: 'Back to original',
      retranslate: 'Translate again',
      overflow: 'More options',
      settings: 'Settings',
      settingsTitle: 'MiriTranslator settings',
      engineAuto: 'Automatic',
      cancel: 'Cancel',
      save: 'Save',
      copy: 'Copy',
      copied: 'Copied',
      of: 'of',
      blocks: 'blocks',
      sameLanguage: 'The page is already in this language.',
      close: 'Close',
      unsupported: 'No engine supports this language pair. Pick another language or engine.',
      selectToTranslate: 'Select text to translate',
    },
  };

  const isKO = /^ko/i.test(navigator.language || '');

  /** UI strings for the active interface language. */
  const t = () => (isKO ? T.ko : T.en);

  class MiriUI {
    constructor() {
      this.host = null;
      this.shadow = null;
      this.root = null;
      this.el = {};
      this.langMenu = { src: null, tgt: null };
      this.selectionRange = null;
      this.selectionText = '';
      this.toastTimer = null;
      this.menuOpen = null;
      this._dragY = null;
      this.barDismissed = false;
    }

    // ------------------------------------------------------------ mount
    mount() {
      this.host = document.createElement('div');
      this.host.setAttribute('data-mt-ui', '');
      Object.assign(this.host.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '0',
        height: '0',
        zIndex: '2147483600',
      });
      this.shadow = this.host.attachShadow({ mode: 'open' });

      const style = document.createElement('style');
      style.textContent = UI_CSS;
      this.shadow.appendChild(style);

      const wrap = document.createElement('div');
      wrap.className = 'mt-root';
      wrap.innerHTML = this.markup();
      this.shadow.appendChild(wrap);

      this.root = wrap;
      this.el = {
        fab: wrap.querySelector('.mt-fab'),
        pop: wrap.querySelector('.mt-pop'),
        sheet: wrap.querySelector('.mt-sheet'),
        hint: wrap.querySelector('.mt-hint'),
        status: wrap.querySelector('.mt-status'),
        statusText: wrap.querySelector('.mt-status__text'),
        bar: wrap.querySelector('.mt-progress'),
        barFill: wrap.querySelector('.mt-progress__fill'),
        engineLine: wrap.querySelector('.mt-engine-line'),
        mobileBar: wrap.querySelector('.mt-bar'),
        barOriginal: wrap.querySelector('[data-mbar="original"]'),
        barTranslate: wrap.querySelector('[data-mbar="translate"]'),
        dropup: wrap.querySelector('.mt-dropup'),
        err: wrap.querySelector('.mt-err'),
        orig: wrap.querySelector('.mt-orig'),
        origText: wrap.querySelector('.mt-orig__text'),
        actions: wrap.querySelector('.mt-actions'),
        btnTranslate: wrap.querySelector('[data-act="translate"]'),
        btnRevert: wrap.querySelector('[data-act="revert"]'),
        btnCopy: wrap.querySelector('[data-act="copy"]'),
        overflow: wrap.querySelector('.mt-overflow'),
        pill: wrap.querySelector('.mt-pill'),
        toast: wrap.querySelector('.mt-toast'),
        sheetBody: wrap.querySelector('.mt-sheet__body'),
        sheetTitle: wrap.querySelector('.mt-sheet__title'),
        src: wrap.querySelector('.mt-lang[data-role="src"]'),
        tgt: wrap.querySelector('.mt-lang[data-role="tgt"]'),
      };

      (document.body || document.documentElement).appendChild(this.host);

      // Page-level styles for bilingual text.
      let pageStyle = document.getElementById('mt-page-style');
      if (!pageStyle) {
        pageStyle = document.createElement('style');
        pageStyle.id = 'mt-page-style';
        pageStyle.textContent = PAGE_CSS;
        (document.head || document.documentElement).appendChild(pageStyle);
      }

      this.buildLangLists();
      this.bind();
      this.applyTheme();
      this.sync();
      return this;
    }

    markup() {
      const s = t();
      const langGroup = (role) => `
        <div class="mt-lang" data-role="${role}">
          <button class="mt-lang__btn" type="button" data-act="lang" aria-haspopup="listbox" aria-expanded="false">
            <span class="mt-lang__label"></span>
            <svg class="mt-lang__chev" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 10l5 5 5-5z"/></svg>
          </button>
          <div class="mt-menu" hidden role="listbox">
            <input class="mt-menu__search" type="text" placeholder="${esc(s.search)}" autocomplete="off" spellcheck="false">
            <ul class="mt-menu__list"></ul>
          </div>
        </div>`;

      return `
        <button class="mt-fab" type="button" aria-label="${esc(s.translateAria)}" title="${esc(s.translateAria)}">
          ${ICON.translate}
        </button>

        <div class="mt-pop" hidden role="dialog" aria-modal="false" aria-label="${esc(s.translate)}">
          <div class="mt-pop__handle" aria-hidden="true"></div>
          <div class="mt-row">
            ${langGroup('src')}
            <button class="mt-swap" type="button" data-act="swap" aria-label="swap">
              ${ICON.swap}
            </button>
            ${langGroup('tgt')}
            <span class="mt-row__spacer"></span>
            <button class="mt-icon" type="button" data-act="overflow" aria-label="${esc(s.overflow)}" aria-haspopup="true" aria-expanded="false">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>
            </button>
            <button class="mt-icon" type="button" data-act="close" aria-label="${esc(s.close)}">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>

          <div class="mt-body">
            <p class="mt-hint"></p>
            <div class="mt-status" hidden><span class="mt-spinner"></span><span class="mt-status__text"></span></div>
            <div class="mt-progress" hidden><div class="mt-progress__fill"></div></div>
            <p class="mt-err" hidden></p>
            <div class="mt-orig" hidden><span class="mt-orig__text"></span></div>
            <div class="mt-engine-line" hidden></div>
          </div>

          <div class="mt-actions">
            <button class="mt-btn mt-btn--block" type="button" data-act="translate">${esc(s.translate)}</button>
            <button class="mt-btn mt-btn--ghost" type="button" data-act="revert" hidden>${esc(s.showOriginal)}</button>
            <button class="mt-icon" type="button" data-act="copy" hidden aria-label="${esc(s.copy)}">${ICON.copy}</button>
          </div>

          <div class="mt-overflow" hidden></div>
        </div>

        <div class="mt-sheet" hidden role="dialog" aria-label="${esc(s.settingsTitle)}">
          <div class="mt-sheet__handle" style="display:none"></div>
          <div class="mt-pop__handle" aria-hidden="true"></div>
          <div class="mt-sheet__head">
            <span class="mt-sheet__title">${esc(s.settingsTitle)}</span>
            <button class="mt-icon" type="button" data-act="sheet-close" aria-label="${esc(s.close)}">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          <div class="mt-sheet__body"></div>
          <div class="mt-sheet__foot">
            <button class="mt-btn mt-btn--quiet" type="button" data-act="reset">${isKO ? '기본값 복원' : 'Reset'}</button>
            <button class="mt-btn mt-btn--block" type="button" data-act="save">${esc(s.save)}</button>
          </div>
        </div>

        <button class="mt-pill" type="button" hidden>
          <span class="mt-pill__icon" style="width:17px;height:17px;display:block">${ICON.translate}</span>
          <span>${esc(s.translate)}</span>
        </button>

        <div class="mt-bar" hidden>
          <button class="mt-bar__icon" type="button" data-mbar="popup" aria-label="${esc(s.translate)}">${ICON.translate}</button>
          <button class="mt-bar__btn" type="button" data-mbar="original" aria-pressed="false">${esc(s.backToOriginal)}</button>
          <button class="mt-bar__btn" type="button" data-mbar="translate">${esc(s.translate)}</button>
          <span class="mt-bar__spin" aria-hidden="true"><span class="mt-spinner--bar"></span></span>
          <button class="mt-bar__more" type="button" data-mbar="menu" aria-label="${esc(s.overflow)}" aria-haspopup="true" aria-expanded="false">
            <span class="mt-dots" aria-hidden="true"><i></i><i></i><i></i></span>
          </button>
          <button class="mt-bar__close" type="button" data-mbar="close" aria-label="${esc(s.close)}">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
          <div class="mt-dropup" hidden role="menu"></div>
        </div>

        <div class="mt-toast" role="status" hidden></div>`;
    }

    // ------------------------------------------------------ lang menus
    buildLangLists() {
      const languages = listLanguages();
      for (const role of ['src', 'tgt']) {
        const group = this.root.querySelector(`.mt-lang[data-role="${role}"]`);
        const list = group.querySelector('.mt-menu__list');
        const items = [];
        if (role === 'src') {
          items.push(
            `<li><button class="mt-menu__opt" type="button" data-code="auto">
               <span class="mt-menu__native">${esc(t().detect)}</span>
               <span class="mt-menu__en">${esc(AUTO_LABEL.en)}</span>
             </button></li>`,
          );
        }
        for (const info of languages) {
          items.push(
            `<li><button class="mt-menu__opt" type="button" data-code="${esc(info.code)}" title="${esc(info.en)}">
               <span aria-hidden="true">${info.flag}</span>
               <span class="mt-menu__native">${esc(info.native)}</span>
               <span class="mt-menu__en">${esc(info.en)}</span>
             </button></li>`,
          );
        }
        list.innerHTML = items.join('');
        this.langMenu[role] = group;
      }
    }

    // ------------------------------------------------------------ bind
    bind() {
      const on = (node, evt, handler, opts) => node && node.addEventListener(evt, handler, opts);

      on(this.el.fab, 'click', (e) => {
        e.stopPropagation();
        this.open();
      });

      on(this.root, 'click', (e) => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        const act = btn.dataset.act;
        if (act === 'lang') {
          const group = btn.closest('.mt-lang');
          this.toggleLangMenu(group.dataset.role, btn);
        } else if (act === 'swap') {
          this.swap();
        } else if (act === 'close') {
          this.close();
        } else if (act === 'overflow') {
          this.toggleOverflow(btn);
        } else if (act === 'translate') {
          this.onPrimary();
        } else if (act === 'revert') {
          this.onRevert();
        } else if (act === 'copy') {
          this.onCopy();
        } else if (act === 'sheet-close') {
          this.el.sheet.hidden = true;
        } else if (act === 'save') {
          this.saveSettings();
        } else if (act === 'reset') {
          store.reset();
          this.renderSettings();
          this.sync();
          this.toast(isKO ? '기본값으로 복원했습니다.' : 'Defaults restored.');
        } else if (act.startsWith('ov:')) {
          this.overflowAction(act.slice(3), btn);
        } else if (act.startsWith('eng:')) {
          const id = act.slice(4);
          store.set({ engineId: id });
          this.renderSettings();
          this.sync();
        }
      });

      // Language selection
      for (const role of ['src', 'tgt']) {
        const group = this.langMenu[role];
        const search = group.querySelector('.mt-menu__search');
        on(search, 'input', () => {
          const q = search.value.trim().toLowerCase();
          group.querySelectorAll('.mt-menu__opt').forEach((opt) => {
            const text = opt.textContent.toLowerCase();
            opt.parentElement.hidden = q && !text.includes(q);
          });
        });
        on(group.querySelector('.mt-menu__list'), 'click', (e) => {
          const opt = e.target.closest('.mt-menu__opt');
          if (!opt) return;
          this.pickLanguage(role, opt.dataset.code);
        });
      }

      // Global dismiss — ignore clicks that happen inside our own shadow host.
      on(
        document,
        'click',
        (e) => {
          if (this.host && this.host.contains(e.target)) return;
          this.dismissMenus();
        },
        true,
      );
      on(document, 'keydown', (e) => this.onKey(e), true);

      // Mobile bottom bar (TWP style)
      on(this.el.mobileBar, 'click', (e) => {
        const btn = e.target.closest('[data-mbar]');
        if (btn) {
          const act = btn.dataset.mbar;
          if (act === 'translate') app.translate();
          else if (act === 'original') app.revert();
          else if (act === 'menu') this.toggleDropup(btn);
          else if (act === 'close') this.hideBar();
          else if (act === 'popup') this.showSettings();
          return;
        }
        const item = e.target.closest('[data-mact]');
        if (!item) return;
        if (item.tagName === 'SELECT') return; // handled by change
        this.handleMobileAction(item.dataset.mact, item);
      });
      on(this.el.dropup, 'change', (e) => {
        if (e.target.matches('[data-mact="langselect"]')) {
          const code = e.target.value;
          const patch = code === AUTO ? { sourceLang: AUTO } : { targetLang: code };
          store.set(patch);
          this.sync();
        }
      });

      // Selection bubble
      const showPill = () => this.scheduleSelectionPill();
      on(document, 'mouseup', showPill);
      on(document, 'touchend', showPill, { passive: true });
      on(this.el.pill, 'mousedown', (e) => e.stopPropagation());
      on(this.el.pill, 'touchstart', (e) => e.stopPropagation(), { passive: true });
      on(this.el.pill, 'click', (e) => {
        e.stopPropagation();
        this.onSelectionTranslate();
      });

      // Mobile drag-to-dismiss
      this.enableDrag();

      // Re-sync whenever settings change.
      store.on('change', () => {
        this.applyTheme();
        this.sync();
      });
    }

    enableDrag() {
      const startDrag = (e) => {
        const handle = e.target.closest('.mt-pop__handle');
        if (!handle || !isMobile()) return;
        const panel = handle.parentElement;
        const startY = e.touches ? e.touches[0].clientY : e.clientY;
        panel.style.transition = 'none';
        const move = (ev) => {
          const y = ev.touches ? ev.touches[0].clientY : ev.clientY;
          panel.style.transform = `translateY(${Math.max(0, y - startY)}px)`;
        };
        const end = (ev) => {
          const y = ev.changedTouches ? ev.changedTouches[0].clientY : ev.clientY;
          panel.style.transition = '';
          panel.style.transform = '';
          document.removeEventListener('mousemove', move);
          document.removeEventListener('mouseup', end);
          document.removeEventListener('touchmove', move);
          document.removeEventListener('touchend', end);
          if (y - startY > 110) this.close();
        };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', end);
        document.addEventListener('touchmove', move, { passive: true });
        document.addEventListener('touchend', end);
      };
      this.root.addEventListener('mousedown', startDrag);
      this.root.addEventListener('touchstart', startDrag, { passive: true });
    }

    // ------------------------------------------------------------- theme
    applyTheme() {
      const pref = store.get().theme;
      const dark =
        pref === 'dark' ||
        (pref === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      this.root.setAttribute('data-theme', dark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-mt-theme', dark ? 'dark' : 'light');
    }

    // --------------------------------------------------------- open/close
    /** On phones the bottom bar is the whole UI, so there is nothing to open. */
    open() {
      this.dismissMenus();
      if (!isMobile()) {
        this.el.pop.hidden = false;
        this.el.sheet.hidden = true;
        this.root.setAttribute('data-open', '1');
      }
      this.sync();
    }

    /** Close the bar entirely (the × button). Reopen with Alt+T / the menu command. */
    hideBar() {
      this.barDismissed = true;
      this.el.mobileBar.hidden = true;
    }

    close() {
      this.el.pop.hidden = true;
      this.el.sheet.hidden = true;
      this.el.overflow.hidden = true;
      this.el.dropup.hidden = true;
      this.root.removeAttribute('data-open');
      this.hidePill();
    }

    get isOpen() {
      return !this.el.pop.hidden || !this.el.sheet.hidden;
    }

    toggle() {
      if (isMobile()) {
        if (this.el.mobileBar.hidden) {
          this.barDismissed = false;
          this.el.mobileBar.hidden = false;
        } else {
          this.hideBar();
        }
        return;
      }
      if (this.isOpen) this.close();
      else this.open();
    }

    dismissMenus() {
      for (const role of ['src', 'tgt']) {
        const g = this.langMenu[role];
        g.querySelector('.mt-menu').hidden = true;
        g.querySelector('.mt-lang__btn').setAttribute('aria-expanded', 'false');
      }
      if (this.el.overflow) this.el.overflow.hidden = true;
      if (this.el.dropup) this.el.dropup.hidden = true;
      const ovBtn = this.root.querySelector('[data-act="overflow"]');
      if (ovBtn) ovBtn.setAttribute('aria-expanded', 'false');
      const moreBtn = this.root.querySelector('[data-mbar="menu"]');
      if (moreBtn) moreBtn.setAttribute('aria-expanded', 'false');
      this.hidePill();
    }

    toggleLangMenu(role, btn) {
      const group = this.langMenu[role];
      const menu = group.querySelector('.mt-menu');
      const wasHidden = menu.hidden;
      this.dismissMenus();
      if (wasHidden) {
        menu.hidden = false;
        menu.removeAttribute('data-dir');
        btn.setAttribute('aria-expanded', 'true');
        group.querySelector('.mt-menu__search').value = '';
        group.querySelectorAll('.mt-menu__opt').forEach((o) => {
          o.parentElement.hidden = false;
        });
        this.fitMenu(menu);
        const active = group.querySelector(`[data-code="${role === 'src' ? store.get().sourceLang : store.get().targetLang}"]`);
        if (active) active.scrollIntoView({ block: 'center' });
        if (isMobile()) menu.querySelector('.mt-menu__search').focus();
      }
    }

    /** Flip a dropdown upward when it would run past the bottom of the window. */
    fitMenu(menu) {
      if (isMobile()) return;
      const rect = menu.getBoundingClientRect();
      if (rect.bottom > window.innerHeight - 8 && rect.top > rect.height + 8) {
        menu.setAttribute('data-dir', 'up');
      }
    }

    pickLanguage(role, code) {
      if (role === 'src') store.set({ sourceLang: code });
      else store.set({ targetLang: code });
      this.dismissMenus();
      this.sync();
    }

    swap() {
      const s = store.get();
      const from = s.sourceLang === AUTO ? null : s.sourceLang;
      store.set({
        sourceLang: s.targetLang,
        targetLang: from || guessPageLang() || 'en',
      });
      this.sync();
    }

    // ------------------------------------------------------------- state
    /** Reflect settings + translator state into the UI. */
    sync() {
      const s = store.get();
      const tr = translatorRef.current;
      const busy = service.isBusy();
      const translated = !!(tr && tr.isTranslated);

      const srcLabel = this.langMenu.src.querySelector('.mt-lang__label');
      const tgtLabel = this.langMenu.tgt.querySelector('.mt-lang__label');
      srcLabel.textContent = s.sourceLang === AUTO ? t().detect : langShort(s.sourceLang);
      tgtLabel.textContent = langShort(s.targetLang);

      for (const role of ['src', 'tgt']) {
        const code = role === 'src' ? s.sourceLang : s.targetLang;
        this.langMenu[role].querySelectorAll('.mt-menu__opt').forEach((o) => {
          o.setAttribute('aria-selected', String(o.dataset.code === code));
        });
      }

      this.el.fab.hidden = !s.showFab || isMobile();
      this.root.setAttribute('data-busy', busy ? '1' : '0');
      this.el.hint.textContent = t().idleHint;
      this.el.hint.hidden = !(!busy && !translated && !this.selectionText);
      this.el.err.hidden = true;

      // Original-text chip: shows the selection, or the detected source language.
      const detected = service.lastDetected;
      if (this.selectionText) {
        this.el.orig.hidden = false;
        this.el.origText.textContent = this.selectionText;
      } else if (translated && detected) {
        this.el.orig.hidden = false;
        this.el.origText.textContent = isKO
          ? `${langLabel(detected)} (원문)`
          : `${langLabel(detected)} (original)`;
      } else {
        this.el.orig.hidden = true;
      }

      this.el.bar.hidden = !busy;
      this.el.status.hidden = !busy;
      this.el.btnRevert.hidden = !translated;
      this.el.btnRevert.textContent = t().showOriginal;
      this.el.btnTranslate.textContent = busy ? t().translating : translated ? t().retranslate : t().translate;
      this.el.btnTranslate.disabled = busy;
      this.el.btnCopy.hidden = !translated;

      // Small credit line so the user knows which engine served the page.
      const engineLine = this.el.engineLine;
      if (engineLine) {
        const engine = translated ? service.lastEngine : null;
        engineLine.hidden = !engine;
        engineLine.textContent = engine ? engine.label : '';
      }

      // Mobile bar mirrors the same state.
      this.el.mobileBar.hidden = !isMobile() || this.barDismissed;
      this.el.barOriginal.setAttribute('aria-pressed', String(translated));
      this.el.barTranslate.setAttribute('aria-pressed', String(busy));
      this.el.barOriginal.disabled = !translated || busy;
      this.el.barTranslate.disabled = busy;
    }

    // -------------------------------------------------- mobile bar (TWP)
    toggleDropup(btn) {
      const menu = this.el.dropup;
      const wasHidden = menu.hidden;
      this.dismissMenus();
      if (wasHidden) {
        const s = store.get();
        const host = hostOf(location.href);
        const langs = listLanguages();
        const options = [`<option value="${AUTO}"${s.sourceLang === AUTO ? ' selected' : ''}>${esc(t().detect)}</option>`]
          .concat(
            langs.map(
              (l) =>
                `<option value="${esc(l.code)}"${l.code === s.targetLang ? ' selected' : ''}>${esc(`${l.flag} ${l.native} (${l.en})`)}</option>`,
            ),
          )
          .join('');
        menu.innerHTML = `
          <button class="mt-dropup__item" type="button" data-mact="language">
            ${isKO ? '번역 언어 변경' : 'Choose another language'}
            <small>${esc(langShort(s.targetLang))}</small>
            <select class="mt-dropup__select" data-mact="langselect">${options}</select>
          </button>
          <button class="mt-dropup__item" type="button" data-mact="engine">
            ${isKO ? '번역 엔진' : 'Translation engine'}
            <small>${esc(s.engineId === 'auto' ? t().engineAuto : (ENGINE_BY_ID.get(s.engineId) || {}).label || s.engineId)}</small>
          </button>
          <button class="mt-dropup__item" type="button" data-mact="selection">
            ${isKO ? '드래그 번역' : 'Translate selected text'}
            <small>${s.selectionBubble ? (isKO ? '켜짐' : 'On') : (isKO ? '꺼짐' : 'Off')}</small>
          </button>
          <button class="mt-dropup__item" type="button" data-mact="never">
            ${isKO ? '이 사이트 번역 안 함' : 'Never translate this site'}
            <small>${esc(host)}</small>
          </button>
          <button class="mt-dropup__item" type="button" data-mact="settings">${isKO ? '설정' : 'More options'}</button>`;
        menu.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
      }
    }

    handleMobileAction(action, node) {
      const s = store.get();
      if (action === 'language') return; // the native <select> handles it
      if (action === 'settings') {
        this.dismissMenus();
        this.showSettings();
        return;
      }
      if (action === 'selection') {
        store.set({ selectionBubble: !s.selectionBubble });
        this.toast(store.get().selectionBubble ? (isKO ? '드래그 번역을 켰습니다.' : 'Selection translation on') : (isKO ? '드래그 번역을 껐습니다.' : 'Selection translation off'));
      } else if (action === 'never') {
        const host = hostOf(location.href);
        const next = Array.isArray(s.neverSites) ? s.neverSites.slice() : [];
        const idx = next.findIndex((x) => hostOf(x) === host);
        if (idx === -1) next.push(host);
        else next.splice(idx, 1);
        store.set({ neverSites: next });
        this.toast(
          matchesList(host, store.get().neverSites)
            ? (isKO ? '이 사이트를 번역 목록에서 제외했습니다.' : 'Site excluded')
            : (isKO ? '이 사이트를 다시 번역합니다.' : 'Site included again'),
        );
      } else if (action === 'engine') {
        const ids = ['auto', ...ENGINES.map((e) => e.id)];
        const cur = s.engineId === 'auto' ? 0 : ids.indexOf(s.engineId);
        const nextId = ids[(cur + 1) % ids.length];
        store.set({ engineId: nextId });
        this.toast(
          nextId === 'auto'
            ? t().engineAuto
            : `${(ENGINE_BY_ID.get(nextId) || {}).label || nextId}`,
        );
      }
      const moreBtn = this.root.querySelector('[data-mbar="menu"]');
      this.toggleDropup(moreBtn);
    }

    setProgress(done, total) {
      const pct = total ? clamp(done / total, 0, 1) : 0;
      this.el.barFill.style.width = `${Math.round(pct * 100)}%`;
      this.el.statusText.textContent = `${t().translating} ${done} ${t().of} ${total} ${t().blocks}`;
    }

    // ----------------------------------------------------------- actions
    onPrimary() {
      if (this.selectionText) this.onSelectionTranslate();
      else app.translate();
    }

    onRevert() {
      app.revert();
    }

    onCopy() {
      const text = this.collectPageText();
      if (!text) return;
      navigator.clipboard
        ?.writeText(text)
        .then(() => this.toast(t().copied))
        .catch(() => this.toast(isKO ? '복사하지 못했습니다.' : 'Copy failed'));
    }

    collectPageText() {
      const tr = translatorRef.current;
      if (!tr) return '';
      const parts = [];
      for (const [node, rec] of tr.nodes) {
        if (!node.parentNode) continue;
        if (rec.applied) parts.push(rec.applied);
      }
      return parts.join('\n\n');
    }

    async onSelectionTranslate() {
      if (!this.selectionText || !this.selectionRange) return;
      const s = store.get();
      const text = this.selectionText;
      this.el.hint.hidden = true;
      this.el.status.hidden = false;
      this.el.statusText.textContent = t().translating;
      this.setBusy(true);
      try {
        const result = await service.translateText(text, {
          source: s.sourceLang === AUTO ? AUTO : s.sourceLang,
          target: s.targetLang,
          engineId: s.engineId,
        });
        const range = this.selectionRange;
        if (range) {
          const tr = translatorRef.current;
          try {
            range.deleteContents();
            const node = document.createTextNode(result);
            range.insertNode(node);
            if (tr) {
              tr.nodes.set(node, { original: text, applied: result, originalSpan: null });
              tr.startObserving();
            }
          } catch (err) {
            console.warn('[MiriTranslator] selection replace failed', err);
          }
        }
        this.toast(t().done);
      } catch (err) {
        this.showError(err);
      } finally {
        this.setBusy(false);
        this.hidePill();
      }
    }

    setBusy(busy) {
      this.root.setAttribute('data-busy', busy ? '1' : '0');
      this.el.status.hidden = !busy;
      this.el.btnTranslate.disabled = busy;
    }

    showError(err) {
      this.el.err.textContent = describeError(err);
      this.el.err.hidden = false;
    }

    // --------------------------------------------------------- selection
    scheduleSelectionPill() {
      if (!store.get().selectionBubble) return;
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) return this.hidePill();
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        if (!rect.width && !rect.height) return this.hidePill();
        const text = sel.toString().trim();
        if (text.length < 2 || text.length > 4000) return this.hidePill();
        let node = sel.anchorNode;
        while (node && node !== document.body) {
          const el = node.nodeType === 1 ? node : node.parentElement;
          if (!el) break;
          if (el.hasAttribute && (el.hasAttribute('data-mt') || el.closest('[data-mt]'))) return this.hidePill();
          node = node.parentNode;
        }
        this.selectionRange = sel.getRangeAt(0).cloneRange();
        this.selectionText = text;
        const x = clamp(rect.left + rect.width / 2 - 44, 12, window.innerWidth - 100);
        const y = Math.max(12, rect.top - 46);
        this.el.pill.style.left = `${x}px`;
        this.el.pill.style.top = `${y}px`;
        this.el.pill.hidden = false;
        this.sync();
      }, 10);
    }

    hidePill() {
      if (this.el.pill) this.el.pill.hidden = true;
      this.selectionText = '';
      this.selectionRange = null;
      if (this.el.orig) this.el.orig.hidden = true;
    }

    // ---------------------------------------------------------- overflow
    toggleOverflow(btn) {
      const menu = this.el.overflow;
      const wasHidden = menu.hidden;
      this.dismissMenus();
      if (wasHidden) {
        const s = store.get();
        const host = hostOf(location.href);
        const on = matchesList(host, s.autoSites);
        const never = matchesList(host, s.neverSites);
        menu.innerHTML = `
          <button class="mt-overflow__item" type="button" data-act="ov:settings">${ICON.settings} ${esc(t().settings)}</button>
          <button class="mt-overflow__item" type="button" data-act="ov:always">
            ${isKO ? '이 사이트에서 항상 번역' : 'Always translate this site'}
            ${s.alwaysOn ? '<span class="mt-check">✓</span>' : ''}
          </button>
          <button class="mt-overflow__item" type="button" data-act="ov:autoSite">
            ${isKO ? '자동 번역 사이트에 추가' : 'Add to auto-translate list'}<small>${esc(host)}</small>
            ${on ? '<span class="mt-check">✓</span>' : ''}
          </button>
          <button class="mt-overflow__item" type="button" data-act="ov:neverSite">
            ${isKO ? '이 사이트에서는 번역하지 않음' : 'Never translate this site'}
            ${never ? '<span class="mt-check">✓</span>' : ''}
          </button>
          <button class="mt-overflow__item" type="button" data-act="ov:bubble">
            ${isKO ? '드래그 번역' : 'Selection translation'}
            ${s.selectionBubble ? '<span class="mt-check">✓</span>' : ''}
          </button>
          <button class="mt-overflow__item" type="button" data-act="ov:fab">
            ${isKO ? '번역 버튼 표시' : 'Show translate button'}
            ${s.showFab ? '<span class="mt-check">✓</span>' : ''}
          </button>`;
        menu.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        this.fitMenu(menu);
      }
    }

    overflowAction(action, btn) {
      const s = store.get();
      const host = hostOf(location.href);
      const toggleIn = (list, value) => {
        const next = Array.isArray(list) ? list.slice() : [];
        const idx = next.findIndex((x) => hostOf(x) === host);
        if (idx === -1) next.push(host);
        else next.splice(idx, 1);
        return next;
      };
      if (action === 'settings') {
        this.dismissMenus();
        this.showSettings();
      } else if (action === 'always') {
        store.set({ alwaysOn: !s.alwaysOn });
        this.toggleOverflow(btn);
        if (store.get().alwaysOn) app.translate();
        else app.revert();
      } else if (action === 'autoSite') {
        store.set({ autoSites: toggleIn(s.autoSites) });
        this.toggleOverflow(btn);
      } else if (action === 'neverSite') {
        store.set({ neverSites: toggleIn(s.neverSites) });
        this.toggleOverflow(btn);
        if (matchesList(host, store.get().neverSites)) app.revert();
      } else if (action === 'bubble') {
        store.set({ selectionBubble: !s.selectionBubble });
        this.toggleOverflow(btn);
      } else if (action === 'fab') {
        store.set({ showFab: !s.showFab });
        this.toggleOverflow(btn);
      }
    }

    // ---------------------------------------------------------- settings
    showSettings() {
      // On phones the panel becomes a full-screen sheet anchored above the bar.
      this.el.pop.hidden = true;
      this.renderSettings();
      this.el.sheet.hidden = false;
    }

    renderSettings() {
      const s = store.get();
      const langs = listLanguages();
      const engineOptions = [
        `<option value="auto"${s.engineId === 'auto' ? ' selected' : ''}>${esc(t().engineAuto)}</option>`,
        ...ENGINES.map(
          (e) => `<option value="${esc(e.id)}"${s.engineId === e.id ? ' selected' : ''}>${esc(e.label)}</option>`,
        ),
      ].join('');

      const langOptions = (selected) =>
        langs
          .map((l) => `<option value="${esc(l.code)}"${selected === l.code ? ' selected' : ''}>${esc(`${l.flag} ${l.native} (${l.en})`)}</option>`)
          .join('');

      const modeChips = [
        ['replace', isKO ? '원문 대체' : 'Replace'],
        ['bilingual', isKO ? '원문 아래 표시' : 'Bilingual'],
        ['hide', isKO ? '원문 숨김' : 'Hide original'],
      ]
        .map(
          ([id, label]) =>
            `<button class="mt-chip" type="button" data-mode="${id}" aria-pressed="${s.mode === id}">${esc(label)}</button>`,
        )
        .join('');

      const engineCards = ENGINES.map(
        (e) => `<div class="mt-engine">
            <span class="mt-engine__dot" style="background:${esc(e.color || '#888')}"></span>
            <span class="mt-engine__meta"><b>${esc(e.label)}</b><small>${esc(e.sub)}</small></span>
            <span class="mt-tag mt-tag--free">${isKO ? '키 불필요' : 'No key'}</span>
          </div>`,
      ).join('');

      this.el.sheetBody.innerHTML = `
        <div class="mt-field">
          <label class="mt-field__label" for="mt-set-tgt">${isKO ? '번역 언어' : 'Translate into'}</label>
          <select class="mt-select" id="mt-set-tgt">${langOptions(s.targetLang)}</select>
        </div>

        <div class="mt-field">
          <label class="mt-field__label" for="mt-set-src">${isKO ? '원본 언어' : 'Translate from'}</label>
          <select class="mt-select" id="mt-set-src">
            <option value="auto"${s.sourceLang === AUTO ? ' selected' : ''}>${esc(t().detect)}</option>
            ${langOptions(s.sourceLang)}
          </select>
        </div>

        <div class="mt-field">
          <span class="mt-field__label">${isKO ? '번역 엔진' : 'Translation engine'}</span>
          <select class="mt-select" id="mt-set-engine">${engineOptions}</select>
          <p class="mt-field__hint">${isKO
            ? '“자동”은 대상 언어를 지원하는 엔진을 좋은 순서대로 사용하고, 실패하면 다음 엔진으로 넘어갑니다. 모든 엔진은 API 키가 필요 없습니다.'
            : '“Automatic” walks the engines in quality order, skipping any that do not support the target language and falling through on failure. No API key is required by any of them.'}</p>
        </div>

        <div class="mt-field">
          <span class="mt-field__label">${isKO ? '표시 방식' : 'Display mode'}</span>
          <div class="mt-chips" id="mt-mode">${modeChips}</div>
        </div>

        <div class="mt-field">
          <label class="mt-switch">
            <input type="checkbox" id="mt-set-always"${s.alwaysOn ? ' checked' : ''}>
            <span class="mt-switch__track"></span>
            <span class="mt-switch__text"><b>${isKO ? '항상 자동 번역' : 'Always translate'}</b><small>${isKO
              ? '지원하는 모든 페이지에서 자동으로 번역합니다.' : 'Translate every page automatically.'}</small></span>
          </label>
          <label class="mt-switch">
            <input type="checkbox" id="mt-set-bubble"${s.selectionBubble ? ' checked' : ''}>
            <span class="mt-switch__track"></span>
            <span class="mt-switch__text"><b>${isKO ? '드래그 번역' : 'Selection translation'}</b><small>${isKO
              ? '텍스트를 선택하면 번역 버튼이 나타납니다.' : 'Show a translate button when text is selected.'}</small></span>
          </label>
          <label class="mt-switch">
            <input type="checkbox" id="mt-set-fab"${s.showFab ? ' checked' : ''}>
            <span class="mt-switch__track"></span>
            <span class="mt-switch__text"><b>${isKO ? '플로팅 버튼 표시' : 'Show floating button'}</b><small>${isKO
              ? '기본은 꺼짐입니다. Alt+T 로도 팝업을 열 수 있습니다.' : 'Off by default. Alt+T opens the popup too.'}</small></span>
          </label>
          <label class="mt-switch">
            <input type="checkbox" id="mt-set-skipcode"${s.skipCode ? ' checked' : ''}>
            <span class="mt-switch__track"></span>
            <span class="mt-switch__text"><b>${isKO ? '코드 블록 제외' : 'Skip code blocks'}</b><small>${isKO
              ? 'pre, code, kbd 등 요소는 번역하지 않습니다.' : 'Leave pre, code and kbd elements alone.'}</small></span>
          </label>
        </div>

        <div class="mt-field">
          <label class="mt-field__label" for="mt-set-ignore">${isKO ? '번역 제외 CSS 선택자' : 'Ignore selectors'}</label>
          <textarea class="mt-textarea" id="mt-set-ignore" placeholder=".ads, #comments, [data-no-translate]">${esc(s.ignoreSelectors)}</textarea>
          <p class="mt-field__hint">${isKO ? '쉼표로 구분합니다.' : 'Comma separated.'}</p>
        </div>

        <div class="mt-field">
          <label class="mt-field__label" for="mt-set-theme">${isKO ? '테마' : 'Theme'}</label>
          <select class="mt-select" id="mt-set-theme">
            ${['auto', 'light', 'dark']
              .map((v) => {
                const label = { auto: isKO ? '시스템 설정' : 'System', light: isKO ? '라이트' : 'Light', dark: isKO ? '다크' : 'Dark' }[v];
                return `<option value="${v}"${s.theme === v ? ' selected' : ''}>${esc(label)}</option>`;
              })
              .join('')}
          </select>
        </div>

        <div class="mt-field">
          <span class="mt-field__label">${isKO ? '번역 엔진' : 'Engines'}</span>
          ${engineCards}
        </div>

        <div class="mt-field">
          <span class="mt-field__label">${isKO ? '단축키' : 'Shortcuts'}</span>
          <ul class="mt-list-reset">
            <li class="mt-shortcut"><span>${isKO ? '번역 팝업 열기' : 'Open translate popup'}</span><kbd>Alt+T</kbd></li>
            <li class="mt-shortcut"><span>${isKO ? '번역 / 원문 복귀' : 'Translate / revert'}</span><kbd>Alt+R</kbd></li>
            <li class="mt-shortcut"><span>${isKO ? '설정 열기' : 'Open settings'}</span><kbd>Alt+S</kbd></li>
            <li class="mt-shortcut"><span>${isKO ? '언어 목록 닫기' : 'Close menus'}</span><kbd>Esc</kbd></li>
          </ul>
        </div>

        <p class="mt-note">
          ${isKO
            ? '모든 엔진(<b>Google · 파파고 · DeepL · MyMemory · Reverso</b>)이 API 키 없이 동작합니다. 페이지 본문은 번역을 위해 선택한 서비스로만 전송됩니다.'
            : 'Every engine (<b>Google · Papago · DeepL · MyMemory · Reverso</b>) works without an API key. Page text is only sent to the service you pick.'}
          <br>${esc(`${APP.name} v${APP.version}`)}
        </p>`;

      const bind = (id, evt, handler) => {
        const node = this.el.sheetBody.querySelector(id);
        if (node) node.addEventListener(evt, handler);
      };
      bind('#mt-set-tgt', 'change', (e) => store.set({ targetLang: e.target.value }));
      bind('#mt-set-src', 'change', (e) => store.set({ sourceLang: e.target.value }));
      bind('#mt-set-engine', 'change', (e) => store.set({ engineId: e.target.value }));
      bind('#mt-set-always', 'change', (e) => store.set({ alwaysOn: e.target.checked }));
      bind('#mt-set-bubble', 'change', (e) => store.set({ selectionBubble: e.target.checked }));
      bind('#mt-set-fab', 'change', (e) => store.set({ showFab: e.target.checked }));
      bind('#mt-set-skipcode', 'change', (e) => store.set({ skipCode: e.target.checked }));
      bind('#mt-set-ignore', 'input', (e) => store.set({ ignoreSelectors: e.target.value }));
      bind('#mt-set-theme', 'change', (e) => {
        store.set({ theme: e.target.value });
        this.applyTheme();
      });

      const modeBox = this.el.sheetBody.querySelector('#mt-mode');
      if (modeBox) {
        modeBox.addEventListener('click', (e) => {
          const chip = e.target.closest('.mt-chip');
          if (!chip) return;
          store.set({ mode: chip.dataset.mode });
          this.renderSettings();
        });
      }
    }

    saveSettings() {
      // Every option is applied on change, so saving only closes the panel.
      this.el.sheet.hidden = true;
      this.sync();
      this.toast(isKO ? '설정을 저장했습니다.' : 'Settings saved.');
    }

    // -------------------------------------------------------------- misc
    toast(message, ms = 2200) {
      const node = this.el.toast;
      node.textContent = message;
      node.hidden = false;
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        node.hidden = true;
      }, ms);
    }

    onKey(e) {
      if (e.key === 'Escape') {
        if (!this.el.sheet.hidden) this.el.sheet.hidden = true;
        else if (this.isOpen) this.close();
        else this.dismissMenus();
        return;
      }
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const key = String(e.key).toLowerCase();
        if (key === 't') {
          e.preventDefault();
          this.toggle();
        } else if (key === 'r') {
          e.preventDefault();
          app.translateOrRevert();
        } else if (key === 's') {
          e.preventDefault();
          this.el.sheet.hidden ? this.showSettings() : (this.el.sheet.hidden = true);
        }
      }
    }
  }