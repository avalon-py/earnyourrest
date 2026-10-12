# Earn Your Rest

**Earn it. Name it. Then rest.**

A one-screen habit tool for people who can't rest while there's work to be done. Live at https://earnyourrest.vercel.app

Built as my idea for the Apple Developer Academy @BINUS challenge: *How might we help people rest and recharge in a world that never switches off?*

## The idea

I'm not against rest. I'm against rest that is unnamed and unearned. Guilt needs an accusation ("you could be doing more"), and a rest that is named in advance and earned by finishing something concrete answers it before it's asked.

The habit has four steps:

1. **Name the rest.** For example, "watch an episode of The Mentalist" or "go to PIK with friends".
2. **Name the work**, tied to a checkable finish line. For example, "solve three problems of Calculus", not "study until it's good enough".
3. **Finish the work.**
4. **Rest, then reflect.** What moved me?

The rule behind it: no gate reached, no half-resting on your phone.

## How the app works

1. Type `Finish ___` and `Then ___`, then lock it in.
2. Your rest appears blurred and locked next to your work.
3. When the finish line is reached, tap the button and the rest unlocks.
4. After resting, write a line or two of reflection (optional).
5. The last five earned rests are kept in a small log.

There are no accounts and no backend. Everything is stored in your browser's `localStorage`, so nothing leaves your device.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and the four screens (setup, gate, rest, reflect) |
| `style.css` | Layout and styling, with automatic light and dark mode |
| `script.js` | State, screen flow and `localStorage` persistence |

## Run locally

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Honest limits

This is productivity-flavored on purpose: it works for me because I'm motivated by clear gates. The goal isn't more output, it's guilt-free rest. Other people may need a small guaranteed rest on bad days, and they can adjust the rule.