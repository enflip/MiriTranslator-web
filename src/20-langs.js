// ==========================================================================
  // 20 — Language table
  // [code, englishName, nativeName, regionCode]
  // ==========================================================================

  const LANG_ROWS = [
    ['af', 'Afrikaans', 'Afrikaans', 'ZA'],
    ['sq', 'Albanian', 'Shqip', 'AL'],
    ['am', 'Amharic', 'አማርኛ', 'ET'],
    ['ar', 'Arabic', 'العربية', 'SA'],
    ['hy', 'Armenian', 'Հայերեն', 'AM'],
    ['az', 'Azerbaijani', 'Azərbaycan', 'AZ'],
    ['eu', 'Basque', 'Euskara', 'ES'],
    ['bn', 'Bengali', 'বাংলা', 'BD'],
    ['bs', 'Bosnian', 'Bosanski', 'BA'],
    ['bg', 'Bulgarian', 'Български', 'BG'],
    ['ca', 'Catalan', 'Català', 'ES'],
    ['ceb', 'Cebuano', 'Cebuano', 'PH'],
    ['zh-CN', 'Chinese (Simplified)', '简体中文', 'CN'],
    ['zh-TW', 'Chinese (Traditional)', '繁體中文', 'TW'],
    ['co', 'Corsican', 'Corsu', 'FR'],
    ['hr', 'Croatian', 'Hrvatski', 'HR'],
    ['cs', 'Czech', 'Čeština', 'CZ'],
    ['da', 'Danish', 'Dansk', 'DK'],
    ['nl', 'Dutch', 'Nederlands', 'NL'],
    ['en', 'English', 'English', 'US'],
    ['eo', 'Esperanto', 'Esperanto', null],
    ['et', 'Estonian', 'Eesti', 'EE'],
    ['fi', 'Finnish', 'Suomi', 'FI'],
    ['fr', 'French', 'Français', 'FR'],
    ['fy', 'Frisian', 'Frysk', 'NL'],
    ['gl', 'Galician', 'Galego', 'ES'],
    ['ka', 'Georgian', 'ქართული', 'GE'],
    ['de', 'German', 'Deutsch', 'DE'],
    ['el', 'Greek', 'Ελληνικά', 'GR'],
    ['gu', 'Gujarati', 'ગુજરાતી', 'IN'],
    ['ht', 'Haitian Creole', 'Kreyòl ayisyen', 'HT'],
    ['ha', 'Hausa', 'Hausa', 'NG'],
    ['haw', 'Hawaiian', 'ʻŌlelo Hawaiʻi', 'US'],
    ['he', 'Hebrew', 'עברית', 'IL'],
    ['hi', 'Hindi', 'हिन्दी', 'IN'],
    ['hmn', 'Hmong', 'Hmoob', null],
    ['hu', 'Hungarian', 'Magyar', 'HU'],
    ['is', 'Icelandic', 'Íslenska', 'IS'],
    ['ig', 'Igbo', 'Igbo', 'NG'],
    ['id', 'Indonesian', 'Bahasa Indonesia', 'ID'],
    ['ga', 'Irish', 'Gaeilge', 'IE'],
    ['it', 'Italian', 'Italiano', 'IT'],
    ['ja', 'Japanese', '日本語', 'JP'],
    ['jv', 'Javanese', 'Basa Jawa', 'ID'],
    ['kn', 'Kannada', 'ಕನ್ನಡ', 'IN'],
    ['kk', 'Kazakh', 'Қазақша', 'KZ'],
    ['km', 'Khmer', 'ភាសាខ្មែរ', 'KH'],
    ['rw', 'Kinyarwanda', 'Ikinyarwanda', 'RW'],
    ['ko', 'Korean', '한국어', 'KR'],
    ['ku', 'Kurdish', 'Kurdî', null],
    ['ky', 'Kyrgyz', 'Кыргызча', 'KG'],
    ['lo', 'Lao', 'ລາວ', 'LA'],
    ['la', 'Latin', 'Latina', null],
    ['lv', 'Latvian', 'Latviešu', 'LV'],
    ['lt', 'Lithuanian', 'Lietuvių', 'LT'],
    ['lb', 'Luxembourgish', 'Lëtzebuergesch', 'LU'],
    ['mk', 'Macedonian', 'Македонски', 'MK'],
    ['mg', 'Malagasy', 'Malagasy', 'MG'],
    ['ms', 'Malay', 'Bahasa Melayu', 'MY'],
    ['ml', 'Malayalam', 'മലയാളം', 'IN'],
    ['mt', 'Maltese', 'Malti', 'MT'],
    ['mi', 'Maori', 'Te Reo Māori', 'NZ'],
    ['mr', 'Marathi', 'मराठी', 'IN'],
    ['mn', 'Mongolian', 'Монгол', 'MN'],
    ['my', 'Myanmar (Burmese)', 'မြန်မာ', 'MM'],
    ['ne', 'Nepali', 'नेपाली', 'NP'],
    ['no', 'Norwegian', 'Norsk', 'NO'],
    ['ny', 'Nyanja (Chichewa)', 'ChiCheŵa', 'MW'],
    ['or', 'Odia (Oriya)', 'ଓଡ଼ିଆ', 'IN'],
    ['ps', 'Pashto', 'پښتو', 'AF'],
    ['fa', 'Persian', 'فارسی', 'IR'],
    ['pl', 'Polish', 'Polski', 'PL'],
    ['pt', 'Portuguese', 'Português', 'PT'],
    ['pa', 'Punjabi', 'ਪੰਜਾਬੀ', 'IN'],
    ['ro', 'Romanian', 'Română', 'RO'],
    ['ru', 'Russian', 'Русский', 'RU'],
    ['sm', 'Samoan', 'Samoa', 'WS'],
    ['gd', 'Scots Gaelic', 'Gàidhlig', 'GB'],
    ['sr', 'Serbian', 'Српски', 'RS'],
    ['st', 'Sesotho', 'Sesotho', 'LS'],
    ['sn', 'Shona', 'ChiShona', 'ZW'],
    ['sd', 'Sindhi', 'سنڌي', 'PK'],
    ['si', 'Sinhala', 'සිංහල', 'LK'],
    ['sk', 'Slovak', 'Slovenčina', 'SK'],
    ['sl', 'Slovenian', 'Slovenščina', 'SI'],
    ['so', 'Somali', 'Soomaali', 'SO'],
    ['es', 'Spanish', 'Español', 'ES'],
    ['su', 'Sundanese', 'Basa Sunda', 'ID'],
    ['sw', 'Swahili', 'Kiswahili', 'KE'],
    ['sv', 'Swedish', 'Svenska', 'SE'],
    ['tg', 'Tajik', 'Тоҷикӣ', 'TJ'],
    ['ta', 'Tamil', 'தமிழ்', 'IN'],
    ['tt', 'Tatar', 'Татарча', 'RU'],
    ['te', 'Telugu', 'తెలుగు', 'IN'],
    ['th', 'Thai', 'ไทย', 'TH'],
    ['tr', 'Turkish', 'Türkçe', 'TR'],
    ['uk', 'Ukrainian', 'Українська', 'UA'],
    ['ur', 'Urdu', 'اردو', 'PK'],
    ['uz', 'Uzbek', "O'zbekcha", 'UZ'],
    ['vi', 'Vietnamese', 'Tiếng Việt', 'VN'],
    ['cy', 'Welsh', 'Cymraeg', 'GB'],
    ['xh', 'Xhosa', 'isiXhosa', 'ZA'],
    ['zu', 'Zulu', 'isiZulu', 'ZA'],
    ['tl', 'Filipino', 'Filipino', 'PH'],
    ['yue', 'Cantonese', '粵語', 'HK'],
    ['ast', 'Asturian', 'Asturianu', 'ES'],
    ['sr-Latn', 'Serbian (Latin)', 'Srpski', 'RS'],
    ['zh', 'Chinese', '中文', 'CN'],
  ];

  /** Regional-indicator flag for an ISO country code. */
  function flagOf(region) {
    if (!region || region.length !== 2) return '🌐';
    return String.fromCodePoint(
      0x1f1e6 + region.toUpperCase().charCodeAt(0) - 65,
      0x1f1e6 + region.toUpperCase().charCodeAt(1) - 65,
    );
  }

  const LANGS = new Map();
  for (const [code, en, native, region] of LANG_ROWS) {
    LANGS.set(code, { code, en, native, region, flag: flagOf(region) });
  }

  const AUTO = 'auto';
  const AUTO_LABEL = { en: 'Detect language', native: '언어 감지' };

  /** Language list sorted the way Chrome sorts it: native label, then English. */
  function listLanguages(locale = navigator.language || 'en') {
    const isKo = /^ko/i.test(locale);
    return Array.from(LANGS.values()).slice().sort((a, b) => {
      const ka = isKo ? `${a.en} ${a.native}` : `${a.native} ${a.en}`;
      const kb = isKo ? `${b.en} ${b.native}` : `${b.native} ${b.en}`;
      return ka.localeCompare(kb);
    });
  }

  function langInfo(code) {
    if (!code || code === AUTO) return { code: AUTO, en: AUTO_LABEL.en, native: AUTO_LABEL.native, flag: '🌐' };
    return LANGS.get(code) || { code, en: code, native: code, flag: '🌐' };
  }

  /** Display label: "한국어 (Korean)" — mirrored after the primary script. */
  function langLabel(code, locale = navigator.language || 'en') {
    const info = langInfo(code);
    if (info.code === AUTO) return info.native;
    const isKo = /^ko/i.test(locale);
    const primary = isKo ? info.en : info.native;
    const secondary = isKo ? info.native : info.en;
    if (primary === secondary) return primary;
    // Hide redundancy for languages whose English name is the same word.
    if (primary.includes(secondary)) return primary;
    return `${primary} (${secondary})`;
  }

  /** Compact label for the language switcher button — one name only. */
  function langShort(code, locale = navigator.language || 'en') {
    const info = langInfo(code);
    if (info.code === AUTO) return info.native;
    return /^ko/i.test(locale) ? info.native : info.en;
  }

  /**
   * Normalise any engine language tag to our canonical code.
   * Handles 'zh-CN', 'zh-Hans', 'iw'→'he', 'in'→'id', 'tl'/'fil'→'tl', 'pt-BR'→'pt'.
   */
  function normalizeLang(raw) {
    if (!raw) return null;
    let code = String(raw).trim();
    const lower = code.toLowerCase().replace(/_/g, '-');
    if (lower === 'auto' || lower === 'detect' || lower === 'null') return AUTO;
    const alias = { iw: 'he', in: 'id', nb: 'no', nn: 'no', yue: 'yue' };
    if (alias[lower]) return alias[lower];
    // Handle script-tagged Chinese: zh-Hans* → zh-CN, zh-Hant* → zh-TW
    if (lower.startsWith('zh')) {
      if (lower.includes('hant') || lower.includes('tw') || lower.includes('hk') || lower.includes('mo')) return 'zh-TW';
      if (lower.includes('cn') || lower.includes('sg') || lower.includes('hans')) return 'zh-CN';
      return 'zh-CN';
    }
    if (LANGS.has(lower)) return lower;
    const base = lower.split('-')[0];
    if (LANGS.has(base)) return base;
    return lower;
  }

  /** Best-effort match of a page's UI language to our table. */
  function guessPageLang(locales) {
    const list = Array.isArray(locales) ? locales : navigator.languages || [navigator.language];
    for (const l of list) {
      const code = normalizeLang(l);
      if (code && code !== AUTO && LANGS.has(code)) return code;
    }
    return null;
  }