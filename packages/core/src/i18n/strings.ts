/**
 * Bilingual string registry for AUR-5 onboarding (English + Hindi Devanagari).
 *
 * Source of truth: `docs/bets/AUR-1/stories/AUR-5/copy.md` (UX Writer, approved
 * 2026-05-24 by Vivek). Strings must be used VERBATIM — never paraphrase
 * (Engineer-role forbidden list).
 *
 * To add a new string: add the key here AND in copy.md AND get HITL approval
 * on the copy.md change before this file lands.
 *
 * v1 launch languages: 'en' + 'hi' only per architecture decision 2026-05-24.
 * Ramp languages (ta, te, bn, mr, kn) require per-language quality eval per R-SPEECH.
 */

import type { Language } from '../types/index';

export const stringIds = [
  // Language Picker screen
  'language.title',
  'language.option.en',
  'language.option.hi',
  // Handle Entry screen
  'handle.title',
  'handle.placeholder',
  'handle.helper',
  'handle.submit',
  'handle.checking',
  'handle.error.invalid_chars',
  'handle.error.too_short',
  'handle.error.too_long',
  'handle.error.taken',
  'handle.error.network',
  // Passkey Enrollment screen
  'passkey.title',
  'passkey.body',
  'passkey.submit',
  'passkey.finalising',
  'passkey.error.cancelled',
  'passkey.error.network',
  // Not Supported screen
  'unsupported.title',
  'unsupported.body',
  // Home Stub screen
  'home.welcome',
  'home.placeholder',
  'home.footer',
] as const;

export type StringId = (typeof stringIds)[number];

type StringTable = Readonly<Record<StringId, string>>;

export const strings: Readonly<Record<Language, StringTable>> = {
  en: {
    // Language Picker
    'language.title': 'Choose your language',
    'language.option.en': 'English',
    'language.option.hi': 'हिन्दी',
    // Handle Entry
    'handle.title': 'Pick a name to use here',
    'handle.placeholder': 'e.g. ravi_2026',
    'handle.helper': '3 to 32 letters, numbers, or underscore',
    'handle.submit': 'Continue',
    'handle.checking': 'Checking…',
    'handle.error.invalid_chars': 'Use only letters, numbers, or underscore',
    'handle.error.too_short': 'A bit too short — make it at least 3 characters',
    'handle.error.too_long': 'A bit too long — keep it under 32 characters',
    'handle.error.taken': "That one's taken — try another",
    'handle.error.network': "Couldn't reach Aura. Check your connection and try again.",
    // Passkey Enrollment
    'passkey.title': 'Let this phone remember you',
    'passkey.body':
      'Your fingerprint or face unlocks Aura on this device. Nothing personal leaves your phone.',
    'passkey.submit': 'Continue',
    'passkey.finalising': 'Almost done…',
    'passkey.error.cancelled': "We couldn't enroll this device. Tap to try again.",
    'passkey.error.network': "Couldn't reach Aura. Check your connection and try again.",
    // Not Supported
    'unsupported.title': "This version doesn't work on your phone yet",
    'unsupported.body': "We're working on a way in. Check back next week.",
    // Home Stub
    'home.welcome': 'Welcome, {handle}.',
    'home.placeholder': 'Conversations are coming.',
    'home.footer': 'Aura — your patient friend.',
  },
  hi: {
    // Language Picker
    'language.title': 'अपनी भाषा चुनिए',
    'language.option.en': 'English',
    'language.option.hi': 'हिन्दी',
    // Handle Entry
    'handle.title': 'यहाँ अपना नाम चुनिए',
    'handle.placeholder': 'जैसे ravi_2026',
    'handle.helper': '3 से 32 अक्षर, नंबर, या अंडरस्कोर',
    'handle.submit': 'जारी रखें',
    'handle.checking': 'जाँच रहे हैं…',
    'handle.error.invalid_chars': 'केवल अक्षर, नंबर, या अंडरस्कोर का उपयोग करें',
    'handle.error.too_short': 'थोड़ा छोटा है — कम से कम 3 अक्षर रखिए',
    'handle.error.too_long': 'थोड़ा लंबा है — 32 अक्षर से कम रखिए',
    'handle.error.taken': 'यह किसी और का है — दूसरा आज़माइए',
    'handle.error.network': 'Aura तक नहीं पहुँच पाए। कनेक्शन देखकर फिर से कोशिश कीजिए।',
    // Passkey Enrollment
    'passkey.title': 'इस फ़ोन को याद रखने दीजिए',
    'passkey.body':
      'आपकी उँगली या चेहरा इस फ़ोन पर Aura को खोलेगा। कुछ भी निजी फ़ोन से बाहर नहीं जाता।',
    'passkey.submit': 'जारी रखें',
    'passkey.finalising': 'लगभग हो गया…',
    'passkey.error.cancelled': 'इस फ़ोन को जोड़ नहीं सके। फिर से कोशिश के लिए टैप कीजिए।',
    'passkey.error.network': 'Aura तक नहीं पहुँच पाए। कनेक्शन देखकर फिर से कोशिश कीजिए।',
    // Not Supported
    'unsupported.title': 'यह संस्करण अभी आपके फ़ोन पर नहीं चलता',
    'unsupported.body': 'हम कोई रास्ता बना रहे हैं। अगले हफ़्ते फिर देखिए।',
    // Home Stub
    'home.welcome': 'आपका स्वागत है, {handle}.',
    'home.placeholder': 'बातचीत जल्द ही आ रही है।',
    'home.footer': 'Aura — आपका धैर्यवान दोस्त।',
  },
};

/**
 * Resolve a string by id + language, optionally interpolating {placeholders}.
 * Missing keys throw — every string must exist for every language at build time.
 */
export function t(
  language: Language,
  id: StringId,
  vars?: Readonly<Record<string, string>>,
): string {
  const raw = strings[language][id];
  if (!vars) return raw;
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, v),
    raw,
  );
}
