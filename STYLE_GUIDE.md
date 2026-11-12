# Style Guide — neomalesa.com

The reference for how this site reads and looks. When in doubt, choose the quieter option.

---

## 1. Voice

The record uses **no first- or third-person pronouns** — neither "I" nor "he". Each line is a statement
of record, like a dossier or a dispatch: *Leads… Directs… Email:…* This is quiet,
confident authority at its most self-possessed — fact without a narrator. Measured and
Presidential, House-of-Cards composed; never loud, never pleading, never LinkedIn-fake.

The underlying attitude, in one line:

> **This is the record. This is the conviction behind it. Bring the problem.**

State facts plainly, then turn to the reader and say what to do next. Authority comes
from restraint, not adjectives — and an invitation made once, plainly, carries more
weight than a pitch. The site exists to start conversations: with an employer, a
client, or anyone who can use what is here. Every section should leave the reader one
step from writing in.

---

## 2. Principles

1. **Pronoun-free record, declarative.** Lead with the verb: "Leads…", "Directs…", "Work spans…"
   — never "I lead…" and never "Neo Malesa leads…". Label form for data points: "Email: …".
   (Exception: machine-read fields — `schema.org` JSON-LD, `<meta>` tags — stay third
   person for SEO.)
2. **Invite, never plead.** The reader is addressed directly and told what to do:
   "Bring the problem.", "Describe the project.", "A few lines are enough to begin."
   An invitation is an instruction given with confidence — never a request, never an
   apology, never a list of reasons to hire. "You" and "your" are used where the
   reader is being spoken to; the record itself stays pronoun-free.
3. **Every section ends in a next step.** A section that shows work closes with the
   way to ask for it. The contact is never more than one action away.
4. **No boasting.** Cut superlatives and status flexes. The facts carry the weight.
5. **Terse.** For the record, prefer declarative fragments ("Systems built to absorb
   failure and keep running."). The imperative is kept for the reader's next step.
6. **Plain words.** Drop filler and jargon that adds nothing ("for organisations",
   "leverage", "passionate about").
7. **Gravitas through brevity.** A short, exact sentence reads more serious than a long,
   qualified one.

---

## 3. Do / Don't

| Don't | Do |
|---|---|
| "Neo Malesa leads digital systems architecture…" / "I lead…" | "Leads in-house digital information systems development…" |
| "He also has a strong interest in…" | "Interests include the history of Papua New Guinea and the classical world." |
| "Papua New Guinea's premier academic institution" | "the national university" |
| "I take on a limited number of projects each year and am available for:" | "Software, infrastructure, applied AI, advisory, and training." |
| "I'd love to hear from you!" / "Feel free to reach out." | "Bring the problem." / "A few lines are enough to begin." |
| "Hire me" / "Available for work" | "Discuss a role" / "Describe the project" |
| "Contact me to learn more about how I can help your organisation." | "A system that should exist, and does not yet." → "Describe the project" |
| "Make decisions based on data, history, and evidence." | "Decisions grounded in data, history, and evidence." |
| "Advisory and implementation … for organisations." | "Advisory and delivery of enterprise AI systems, infrastructure, and technical governance." |

### Words and phrases to avoid
Pleading: *hire me, available for work, I'd love to, feel free to, don't hesitate, let's connect, reach out.*
Hype: *premier, world-class, cutting-edge, passionate, excited to, thrilled.*
Filler: *for organisations, leverage, utilise, in order to, very, really.*

---

## 4. Mechanics

- **Spelling:** British/Commonwealth (organis*e*, analys*e*, programm*e*).
- **Punctuation:** Use the middot ` &middot; ` to separate inline list items (roles,
  locations). Em dashes sparingly.
- **Capitalisation:** Section headings in Title Case; body in sentence case.
- **Numerals:** Spell out one through nine; figures for 10 and up.
- **Roman numerals** index the sections (I–VII). Keep them sequential when adding or
  removing sections — the numeral appears twice per section: once in the rail
  (`.rail__list` in `index.html`), and once on the heading as `data-ghost` plus
  `.section__index`.
- **Subsections** are indexed from their section: `II.i`, `II.ii`, `II.iii`. Each has
  a `.subsection__heading` with the index, a name, and an optional note.
- **Calls to act** are short verb phrases, three words at most: "Describe the
  project", "Discuss a role", "Ask a question". Give a link `data-intent` (`role`,
  `project`, `advice`, `question`, `other`) to preset the composer's subject; from
  another page use `index.html?about=role#connect`.

---

## 5. Section register

Section names are deliberately formal and understated — they set the tone before a word
of body copy is read:

`Start Here · Work · Engagements · Writing · Background · Interlude · Correspondence`

Keep this register. Favour a single weighty noun over a descriptive phrase
("Correspondence", not "Get in touch"; "Engagements", not "Work with me"). The
directness lives in the calls to act and the lines beneath the headings, not in the
headings themselves.

---

## 6. Visual identity

The look is dark, restrained, and institutional — a state document more than a portfolio.

- **Typefaces:** Cormorant Garamond for display (name, headings); Spectral for body.
  Both serif. No sans-serif.
- **Palette:** Near-black ground (`#0d0f12`); muted gold (`#7E5F18`) as the single accent —
  used for the seal monogram and fine rules, never for large areas.
- **Mark:** A gold seal monogram "N" in a thin circle (drawn inline as the favicon).
- **Texture:** A faint film grain over the whole page; engraved ghost roman numerals
  behind section headings; an outlined name watermark in the footer. All barely-there —
  texture, never decoration.
- **Motion:** Present throughout, and always slow and deliberate — masked hero
  reveals, a swell of brass hairlines that answers the pointer, a ticker, a conviction
  that takes ink word by word, figures that count up, plates that lean toward the
  pointer, parallax on the ghost numerals and portrait. Nothing bounces, nothing
  rushes. Calm conveys confidence. All motion respects `prefers-reduced-motion`.
- **Interlude:** One game, *Light the Islands* — a night sea in the site's own slate
  and brass. It tells the record through play and ends on an invitation to write. It
  loads only when the reader chooses to play.
- **Space:** Generous. Let copy breathe; crowding reads as anxiety.

---

## 7. Checklist before publishing copy

- [ ] The record pronoun-free and verb-first (except meta/structured data)?
- [ ] Does the section end in a clear next step for the reader?
- [ ] Is the invitation an instruction, not a plea?
- [ ] No superlatives or hype words?
- [ ] Could any sentence be shorter without losing meaning?
- [ ] British spelling consistent?
- [ ] Does it sound like a statement of fact, followed by a plain invitation — not a pitch?
