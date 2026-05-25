# AUR-5 visual references

Screenshots of comparable products' UI, used as design anchors for the AUR-5 happy-path onboarding story. See [`../design.md`](../design.md) § *Visual references — comparable app onboarding flows* for commentary on each.

## Expected files

Drag the three Claude iOS screenshots (provided 2026-05-24) into this directory with these names so the markdown image references in `design.md` resolve:

| Filename | What it shows | Relevance |
|----------|----------------|-----------|
| `claude-empty-state.png` | "Hey there, Vivek" empty / new-chat screen | **Direct** — closest analog to AUR-5 Home Stub |
| `claude-sidebar.png` | Recent-chats sidebar with Chats / Projects / Artifacts navigation | **Cross-bet** — relevant for AUR-4 multi-conversation sidebar |
| `claude-active-conversation.png` | Active conversation with "Decision question for you" + a/b/c options + bottom input bar | **Cross-bet** — relevant for AUR-2 voice loop surface |

Once the files are in place, `design.md` § *Visual references* will render them inline.

## Why these files live under AUR-5 even though 2 of 3 are for other bets

Keeping all visual references for the same source (Claude iOS app) in one folder makes it easier to maintain when we add more screenshots later. The cross-bet relevance is called out per-image in `design.md` so future bets can find them.
