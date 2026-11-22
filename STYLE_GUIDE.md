# Style Guide — neomalesa.com

The reference for how this site reads and looks. When in doubt, choose the quieter option.

---

## 1. Voice

The site speaks in the first person. A sentence has a narrator, and the narrator is Neo:
"I turn data into stories…", "I lead in-house software development…". Labels stay as
labels (dates, titles, card meta). Machine-read fields — `schema.org` JSON-LD and
`<meta>` tags — stay in the third person.

The reader is a client with a dataset, a report, or a system that should exist. Speak to
that person plainly, show the work, and end with one next step.

Place is a credential, not a cause. Port Moresby shows through detail: the kicker, the
live clock, PNG subjects, a line of Tok Pisin where it fits. The belief that Papua New
Guinea can build its own systems is said once, in the first person, in Background.

---

## 2. Principles

1. **Say "I".** Labels stay as labels (dates, titles, card meta). Sentences get a narrator.
2. **Open on the reader's trouble, not your title.** The first sentence of each section
   should be something the reader already thinks.
3. **One checkable detail per paragraph.** A number, a place, a name. The bar:
   "Australia, 850 km away, requires one; Peru, 14,600 km away, does not."
4. **Say it aloud first.** Record an answer to the prompt, transcribe it, then cut a
   third. This is the fastest way out of the AI register.
5. **Show the place, state the belief once.** Tok Pisin where it comes naturally, as in
   the opening of *Told to Resign*. The conviction about PNG appears once, in Background.
6. **Invite, never plead.** Each section ends with one next step.
7. **Claim only what the work shows.** "In build" stays "in build". AI assistance is
   disclosed the way the stories disclose it: direction, judgement, and checking — never
   a claim of hand-craft.

---

## 3. Habits to cut

| Cut | Why |
|---|---|
| Sentences with no subject ("Leads in-house…") | Reads as a dossier, not a person |
| Lists of three for rhythm ("Data stories in public, systems in service, tools free to use.") | Rhythm without information |
| Closing aphorisms ("That is the work.") | Ends on a pose instead of a next step |
| "Not this, but that" phrasing ("Nothing off the shelf.") | Defines the work by what it is not |
| Abstract nouns with no example (systems, institutions, engagements) | Give the example instead |

### Words and phrases to avoid
Pleading: *hire me, available for work, I'd love to, feel free to, don't hesitate, let's connect, reach out.*
Hype: *premier, world-class, cutting-edge, passionate, excited to, thrilled.*
Filler: *for organisations, leverage, utilise, in order to, very, really.*

### Interim copy
Copy written as a placeholder until Neo supplies his own carries
`<!-- INTERIM: Neo to rewrite -->` directly above it. `grep -rn "INTERIM" .` lists
every line still waiting. When Neo's text arrives, install it verbatim and change only
mechanics (entities, British spelling).

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
  project", "Discuss a role", "Ask a question". Give a link `data-intent` (`data`,
  `project`, `advice`, `question`, `role`, `other`) to preset the composer's subject; from
  another page use `index.html?about=data#connect`.

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

- [ ] Does each sentence have a narrator ("I"), except labels and meta/structured data?
- [ ] Does the first sentence name something the reader already thinks?
- [ ] Is there one checkable detail — a number, a place, a name — per paragraph?
- [ ] Does the section end in one clear next step?
- [ ] Is the invitation an instruction, not a plea?
- [ ] No superlatives, hype words, aphorisms, or lists of three for rhythm?
- [ ] Does it claim only what the work shows?
- [ ] British spelling consistent?
- [ ] Interim copy marked with `<!-- INTERIM: Neo to rewrite -->`?
