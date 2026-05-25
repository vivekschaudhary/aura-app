---
bet: AUR-1
story: AUR-5
author: UX Writer
created: 2026-05-24
approved: 2026-05-24
approved_by: Vivek
---

# Copy: Happy-path passkey onboarding

## Voice and tone

Aura's voice is **patient, non-judgemental, plain** — the friend who listens before suggesting. Onboarding is the user's first impression of that voice, so every string follows:

- **Plain words, not feature-words.** "Choose your language" beats "Localisation preference."
- **No marketing.** Skip "Welcome to the future of…"-style copy. The user is here to do a thing; help them do it.
- **No imperative-feeling commands** where possible. Prefer "Continue when ready" over "Submit."
- **Hindi (Devanagari):** simple, conversational register — *roman* Hindi terms are OK when they're how people actually speak (e.g. "OK" is fine; "स्वीकार करें" is stiff).
- **Errors say what + what to do.** Per Compass UX Writer rules.
- **Bilingual.** Every string has an English and Hindi (Devanagari) version. The string IDs are language-agnostic; the rendered language is picked by `User.primary_language`.

## Strings

| Location / ID | English | Hindi (Devanagari) | Rationale |
|---------------|---------|---------------------|-----------|
| `language.title` | Choose your language | अपनी भाषा चुनिए | First screen — single sentence, no caps. "चुनिए" is the polite-imperative form. |
| `language.option.en` | English | English | English option label stays Latin even in Hindi context — users recognise the word. |
| `language.option.hi` | हिन्दी | हिन्दी | Hindi option label stays Devanagari even in English context. |
| `handle.title` | Pick a name to use here | यहाँ अपना नाम चुनिए | Avoid "username" — too technical. "नाम" reads naturally. |
| `handle.placeholder` | e.g. ravi_2026 | जैसे ravi_2026 | Same example both languages — Latin-only by current `handleSchema` (Devanagari handles deferred per AUR-1 brief P2 Issue). |
| `handle.helper` | 3 to 32 letters, numbers, or underscore | 3 से 32 अक्षर, नंबर, या अंडरस्कोर | Plain rule statement. |
| `handle.submit` | Continue | जारी रखें | Non-imperative continuation. |
| `handle.checking` | Checking… | जाँच रहे हैं… | Present-continuous, polite-plural. |
| `handle.error.invalid_chars` | Use only letters, numbers, or underscore | केवल अक्षर, नंबर, या अंडरस्कोर का उपयोग करें | Tells what to do. |
| `handle.error.too_short` | A bit too short — make it at least 3 characters | थोड़ा छोटा है — कम से कम 3 अक्षर रखिए | Gentle, suggests fix. |
| `handle.error.too_long` | A bit too long — keep it under 32 characters | थोड़ा लंबा है — 32 अक्षर से कम रखिए | Symmetric to too_short. |
| `handle.error.taken` | That one's taken — try another | यह किसी और का है — दूसरा आज़माइए | "किसी और का है" (someone else's) is warmer than "duplicate." |
| `handle.error.network` | Couldn't reach Aura. Check your connection and try again. | Aura तक नहीं पहुँच पाए। कनेक्शन देखकर फिर से कोशिश कीजिए। | Names the problem + the fix. |
| `passkey.title` | Let this phone remember you | इस फ़ोन को याद रखने दीजिए | Sets the mental model — not "create credential" jargon. |
| `passkey.body` | Your fingerprint or face unlocks Aura on this device. Nothing personal leaves your phone. | आपकी उँगली या चेहरा इस फ़ोन पर Aura को खोलेगा। कुछ भी निजी फ़ोन से बाहर नहीं जाता। | Two truths in plain words — what it does + privacy promise. |
| `passkey.submit` | Continue | जारी रखें | Same as handle. |
| `passkey.finalising` | Almost done… | लगभग हो गया… | Reassurance during the post-biometric tRPC call. |
| `passkey.error.cancelled` | We couldn't enroll this device. Tap to try again. | इस फ़ोन को जोड़ नहीं सके। फिर से कोशिश के लिए टैप कीजिए। | "Enroll" → "जोड़" (add). Doesn't blame user. |
| `passkey.error.network` | Couldn't reach Aura. Check your connection and try again. | Aura तक नहीं पहुँच पाए। कनेक्शन देखकर फिर से कोशिश कीजिए। | Reuse string from handle.error.network — terminology consistency. |
| `unsupported.title` | This version doesn't work on your phone yet | यह संस्करण अभी आपके फ़ोन पर नहीं चलता | Honest. Names the cause without blaming the device. |
| `unsupported.body` | We're working on a way in. Check back next week. | हम कोई रास्ता बना रहे हैं। अगले हफ़्ते फिर देखिए। | Sets expectation; no false promise. |
| `home.welcome` | Welcome, {handle}. | आपका स्वागत है, {handle}. | Includes interpolation. Devanagari uses formal welcome — fits Aura's reflective tone. |
| `home.placeholder` | Conversations are coming. | बातचीत जल्द ही आ रही है। | Tells them what they unlocked — a future, not an ending. |
| `home.footer` | Aura — your patient friend. | Aura — आपका धैर्यवान दोस्त। | First sighting of brand voice. Reflective; doesn't promise. |

## Terminology consistency

| Term | English usage | Hindi usage | Notes |
|------|---------------|-------------|-------|
| Handle | "name to use here" (avoided "username") | "नाम" (avoided "यूज़रनेम") | Plain word. Matches the data model concept (handle is a display identifier, not a credential). |
| Passkey | "let this phone remember you" (avoided "passkey" as a noun) | "इस फ़ोन को याद रखने" | The word "passkey" is new + foreign to the audience; describe the *function*, not the standard's name. |
| Continue | "Continue" / "जारी रखें" | both | Single forward-motion verb across all screens. |
| Aura | "Aura" (Latin) | "Aura" (Latin) | Brand name stays Latin in both languages — common pattern (cf. Paytm, Swiggy). |

## DRI Log

### Decisions

- [2026-05-24] [UX Writer] **Don't use the word "passkey" in any user-facing string.** Describe what it does: "Let this phone remember you. Your fingerprint or face unlocks Aura."
  - **Rationale (required):** The word "passkey" is mass-unfamiliar in 2026; even Western users find it new. For our vernacular Indian mass-market user, the word would prompt confusion or distrust. Describe the experience (biometric unlock, on-device only) — that's what the user cares about.
  - **Area (required, tag):** copy / terminology.
  - **Alternatives considered (required):** Use "passkey" with a tooltip explainer (rejected — adds friction); use "PIN" (rejected — inaccurate, misleads about security model); use "fingerprint login" (rejected — excludes Face ID).
  - **Reversibility:** easy — swap copy in any future story.

- [2026-05-24] [UX Writer] **Handle label is "name to use here" / "यहाँ अपना नाम चुनिए" — not "username".**
  - **Rationale (required):** "Username" is a technical word our user may have never typed. "Name to use here" is a plain explanation of what the field is for.
  - **Area (required, tag):** copy / terminology.
  - **Alternatives considered (required):** "Username" (rejected — jargon), "Display name" (rejected — implies "your real name"), "ID" (rejected — implies official identification).
  - **Reversibility:** easy.

- [2026-05-24] [UX Writer] **Brand name "Aura" stays Latin even in Hindi UI.**
  - **Rationale (required):** Pattern established by Indian consumer brands (Paytm, Swiggy, Zomato) — brand stays in Latin even in vernacular contexts because it's how people recognise + speak the name. Transliterating to "आउरा" would confuse, not help.
  - **Area (required, tag):** copy / brand / i18n.
  - **Alternatives considered (required):** Devanagari transliteration "आउरा" (rejected — confusing); both ("Aura (आउरा)") (rejected — clutter).
  - **Reversibility:** easy.

### Risks

- [2026-05-24] [UX Writer] **R-COPY-1: Hindi copy hasn't been reviewed by a native Hindi speaker.** I wrote it; nuance, register, regional dialect choices haven't been validated.
  - **Likelihood (required):** high (machine-translated-feeling copy is a real failure mode in India).
  - **Impact (required):** medium-high (off-tone Hindi destroys the "patient friend" voice and breaks the brand-trust moat at first contact).
  - **Mitigation (required):** Before TestFlight cohort sees this, recruit at least 2 Hindi-primary speakers (ideally matching the personas) to review every Hindi string and rewrite anything that reads stilted. Treat this as a Story 1.5 polish task between AUR-5 and AUR-6 if findings are substantial. Log Issue if a polish story is needed.
  - **Area (required, tag):** copy / i18n / quality.

### Issues
_None at copy-draft stage._
