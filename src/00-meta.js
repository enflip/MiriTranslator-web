// ==UserScript==
// @name         MiriTranslator — 웹페이지 번역
// @name:en      MiriTranslator — Webpage Translator (Chrome-style)
// @name:ko      MiriTranslator — 웹페이지 번역
// @namespace    https://github.com/enflip/MiriTranslator-web
// @version      1.0.0
// @description  크롬 기본 번역 기능과 같은 UX로 웹페이지를 번역합니다. 키가 필요 없는 무료 API(구글, 파파고, DeepL, MyMemory, Reverso)를 기본 지원하고, DeepL·Microsoft·Papago Cloud·Google Cloud·LibreTranslate 같은 무료 티어 API 키도 입력할 수 있습니다.
// @description:en Translates web pages with a Chrome-like UI. Ships with keyless free APIs (Google, Papago, DeepL, MyMemory, Reverso) and supports optional free-tier API keys (DeepL, Microsoft, Papago Cloud, Google Cloud, LibreTranslate).
// @author       enflip
// @license      MIT
// @match        *://*/*
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcng9IjI0IiBmaWxsPSIjNDI4NWY0Ii8+PHRleHQgeD0iMzgiIHk9IjQwIiBmb250LXNpemU9IjU2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5HPC90ZXh0Pjx0ZXh0IHg9IjM4IiB5PSI3NCIgZm9udC1zaXplPSI1NiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iZmZmIj7lYbE8PC90ZXh0Pjwvc3ZnPg==
// @connect      *
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

/* eslint-disable no-undef */
(function () {
  'use strict';

  const APP = {
    name: 'MiriTranslator',
    version: '1.0.0',
    homepage: 'https://github.com/enflip/MiriTranslator-web',
  };

  if (window.__MIRI_TRANSLATOR__) return;
  window.__MIRI_TRANSLATOR__ = { app: APP };

  /* eslint-enable no-undef */