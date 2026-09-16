import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import formatDate from 'date-fns/format';
import parseDate from 'date-fns/parse';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import { configure as configureMarkdownEditor } from '@gravity-ui/markdown-editor';
// eslint-disable-next-line import/no-unresolved
import { i18n as markdownEditorI18n } from '@gravity-ui/markdown-editor/_/i18n/i18n';

import { embeddedLocales, languages } from './locales';

// --- Język interfejsu edytora WYSIWYG (@gravity-ui/markdown-editor) ---
// Biblioteka dostarcza tłumaczenia UI edytora TYLKO dla 'en' i 'ru'. Dla polskiego
// rejestrujemy własny keyset paska narzędzi (tooltipy przycisków). Inne języki
// spadają do angielskiego (do uzupełnienia analogicznie w razie potrzeby).
markdownEditorI18n.registerKeyset('pl', 'menubar', {
  bold: 'Pogrubienie',
  checkbox: 'Pole wyboru',
  code: 'Kod',
  code_inline: 'Kod w tekście',
  codeblock: 'Blok kodu',
  colorify: 'Kolor tekstu',
  colorify__color_blue: 'Niebieski',
  colorify__color_default: 'Domyślny',
  colorify__color_gray: 'Szary',
  colorify__color_green: 'Zielony',
  colorify__color_orange: 'Pomarańczowy',
  colorify__color_red: 'Czerwony',
  colorify__color_violet: 'Fioletowy',
  colorify__color_yellow: 'Żółty',
  colorify__group_text: 'Tekst',
  cut: 'Sekcja zwijana',
  emoji: 'Emoji',
  emoji__hint: 'Emoji można dodać w trybie WYSIWYG lub ręcznie w składni',
  file: 'Plik',
  'folding-heading': 'Nagłówek zwijany',
  'folding-heading__hint': 'Tekst pod nagłówkiem można zwijać i rozwijać',
  gpt: 'Widżet GPT',
  heading: 'Nagłówek',
  heading1: 'Nagłówek 1',
  heading2: 'Nagłówek 2',
  heading3: 'Nagłówek 3',
  heading4: 'Nagłówek 4',
  heading5: 'Nagłówek 5',
  heading6: 'Nagłówek 6',
  hrule: 'Separator',
  html: 'HTML',
  image: 'Obraz',
  italic: 'Kursywa',
  link: 'Odnośnik',
  list: 'Lista',
  list__action_lift: 'Zmniejsz wcięcie',
  list__action_sink: 'Zwiększ wcięcie',
  list_action_disabled: 'Niezgodne z logiką listy',
  mark: 'Wyróżnienie',
  math: 'Wzór',
  math_block: 'Blok wzoru',
  math_inline: 'Wzór w tekście',
  mermaid: 'Mermaid',
  mono: 'Czcionka o stałej szerokości',
  more_action: 'Więcej akcji',
  move_list: 'Przenieś element listy',
  note: 'Notatka',
  olist: 'Lista numerowana',
  quote: 'Cytat',
  quotelink: 'Cytat z odnośnikiem',
  redo: 'Ponów',
  strike: 'Przekreślenie',
  table: 'Tabela',
  tabs: 'Zakładki',
  text: 'Tekst',
  ulist: 'Lista wypunktowana',
  underline: 'Podkreślenie',
  undo: 'Cofnij',
});

const EDITOR_LANGS = new Set(['en', 'ru', 'pl']);
const applyEditorLang = () => {
  const lng = (i18n.resolvedLanguage || 'en').split('-')[0];
  configureMarkdownEditor({ lang: EDITOR_LANGS.has(lng) ? lng : 'en' });
};
applyEditorLang();

i18n.dateFns = {
  locales: {},
  addLocale(language, locale) {
    this.locales[language] = locale;

    registerLocale(language, locale);
  },
  getLocale(language = i18n.resolvedLanguage) {
    return this.locales[language];
  },
  format(date, format, { language, ...options } = {}) {
    return formatDate(date, format, {
      locale: this.getLocale(language),
      ...options,
    });
  },
  parse(dateString, format, backupDate, { language, ...options } = {}) {
    return parseDate(dateString, format, backupDate, {
      locale: this.getLocale(language),
      ...options,
    });
  },
};

i18n.on('languageChanged', () => {
  setDefaultLocale(i18n.resolvedLanguage);
  applyEditorLang();
});

const formatDatePostProcessor = {
  type: 'postProcessor',
  name: 'formatDate',
  process(value, _, options) {
    return i18n.dateFns.format(options.value, value);
  },
};

const parseDatePostProcessor = {
  type: 'postProcessor',
  name: 'parseDate',
  process(value, _, options) {
    return i18n.dateFns.parse(options.value, value, new Date());
  },
};

i18n
  .use(LanguageDetector)
  .use(formatDatePostProcessor)
  .use(parseDatePostProcessor)
  .use(initReactI18next)
  .init({
    resources: embeddedLocales,
    fallbackLng: 'en-US',
    supportedLngs: languages,
    load: 'currentOnly',
    interpolation: {
      escapeValue: false,
      format(value, format, language) {
        if (value instanceof Date) {
          return i18n.dateFns.format(value, format, {
            language,
          });
        }

        return value;
      },
    },
    react: {
      useSuspense: true,
    },
    debug: process.env.NODE_ENV !== 'production',
  });

i18n.loadCoreLocale = async (language = i18n.resolvedLanguage) => {
  if (language === i18n.options.fallbackLng[0]) {
    return;
  }

  const { default: locale } = await import(`./locales/${language}/core`);

  Object.keys(locale).forEach((namespace) => {
    if (namespace === 'dateFns') {
      i18n.dateFns.addLocale(language, locale[namespace]);
    } else {
      i18n.addResourceBundle(language, namespace, locale[namespace], true, true);
    }
  });
};

i18n.detectLanguage = () => {
  const {
    services: { languageDetector, languageUtils },
  } = i18n;

  localStorage.removeItem(languageDetector.options.lookupLocalStorage);

  const detectedLanguages = languageDetector.detect();

  i18n.language = languageUtils.getBestMatchFromCodes(detectedLanguages);
  i18n.languages = languageUtils.toResolveHierarchy(i18n.language);

  i18n.resolvedLanguage = undefined;
  i18n.setResolvedLanguage(i18n.language);
};

export default i18n;
