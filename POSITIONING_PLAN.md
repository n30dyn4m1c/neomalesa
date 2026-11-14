# Reposition neomalesa.com for client work: data stories and custom software

## Context

The site is built to start conversations, but it speaks to the wrong reader in the wrong voice:

- **The first thing a visitor is offered is a job-seeker pitch.** Start Here opens on the "Hiring" tab ("For hiring managers and search firms").
- **The hero sells systems only.** The Grand Pacific Prize, the strongest public proof, is the third item in a credentials line. The claim ("in Papua New Guinea, by Papua New Guineans") is a manifesto, not a statement of what a client gets.
- **Data storytelling is not offered anywhere in Engagements.** The five areas are a generic ICT menu. The only place the site asks for data work is the CTA band on `dataviz/index.html`.
- **The voice is cold by rule.** `STYLE_GUIDE.md` bans "I" and asks for a "dossier" register. That rule is the source of the AI feel, and any model that edits the site will follow it.
- **The best traffic never arrives.** *The Ocean Knows First* and *Told to Resign* (separate repos) carry no link to neomalesa.com and no way to ask for similar work. The per-story pages in `dataviz/` have a signup box but no commission CTA.

Decisions already made by Neo: ship structure first with short interim copy marked `INTERIM`; add WhatsApp as a second contact channel; say nothing about cost.

## The approach

**One idea, two offers, one ladder.** Neo makes what an organisation knows readable and usable: data stories that people finish, and the lean software behind them. The data story is the way in (small, bounded, public, already proven by the prize). Custom systems and ongoing work are where the relationship grows.

**Place is a credential, not a cause.** Port Moresby stays visible through detail: the kicker, the live clock, PNG subjects, a line of Tok Pisin where it fits. The belief that PNG can build its own systems is said once, in the first person, in Background.

**The site is a closing tool.** Most of the right visitors will arrive from a shared data story or a link Neo sends. So every story page must lead back to a conversation, and `engagements/` must be a page worth sending to a prospect.

## Risks and trade-offs

| Tension | Choice | What it costs |
|---|---|---|
| Local conviction vs international appeal | Place shown through detail; the belief stated once in Background | Local buyers who liked "by Papua New Guineans" see a quieter stance |
| Manifesto vs commercial clarity | Hero and thesis say what a client gets | The page opens with less drama |
| Data stories vs systems | Lead with data proof; name both in every key line | Risk of being read as "the chart person". Systems are probably the larger contracts, and their proof is thin (UPNG is an employer; Klower's is in build) |
| "I" vs institutional weight | First person in prose; Abide Tech named as the contracting entity; formal section names kept | A solo voice can read as small to a procurement officer |
| Full-time UPNG role | Hiring path demoted, not deleted. Background says plainly how client work fits | Fewer role enquiries; the capacity question needs an honest answer only Neo can write |
| Accountability stories vs government clients | *The Ocean Knows First* (climate, neutral) leads; political stories sit below it | The most shareable pieces are the ones most likely to make a public-sector buyer cautious |
| AI assistance vs "human voice" | Claim direction, judgement, and checking, as the stories already disclose. Never claim hand-craft | Interim copy is AI-written. It is marked and must be replaced |
| WhatsApp | Added beside email and inside the composer | Publishes a number and sets an expectation of fast replies. Use a business number |
| No analytics | Measure by inbox: the composer subject names the offer | No funnel data. Keeps the "no tracking" promise the stories make |

## Part A. Implementation (for the implementing model)

Rules for every step:

- Work on a branch and open one PR per priority tier. The site deploys from `main` via GitHub Pages.
- Do not write new prose beyond the interim lines given here. Put `<!-- INTERIM: Neo to rewrite -->` above each one. When Neo supplies text, install it verbatim and change only mechanics (entities, British spelling).
- Keep the design system, the section order and numerals (I–VII), the motion, and the Interlude.
- Machine-read fields (`<meta>`, JSON-LD) stay in the third person.
- Blocked on Neo: the WhatsApp number in international format. Do not invent one. If it is missing, ship everything else and leave a comment where it goes.

### P1. Change who the page speaks to

**1. `STYLE_GUIDE.md` first**, so later edits follow the new voice. Replace sections 1–3 and 7 with the principles in Part B. Keep section 4 (mechanics), section 5 (section names), and section 6 (visual identity). Remove the "Presidential, House-of-Cards" line and the pronoun-free rule. Update the `data-intent` list in section 4 to include `data`.

**2. Hero** (`index.html` lines 204–210).
- Claim, interim: "I turn data into stories people read to the end, and build the lean software institutions run on."
- Role line reordered so the prize leads: "Grand Pacific Prize, Pacific Dataviz Challenge 2026 · Founder, Abide Tech · Software development lead, University of Papua New Guinea".
- Buttons unchanged.

**3. Ticker** (lines 247, 250). Reorder both groups to open with "Data Stories", "Dashboards", "Custom Software", then the rest.

**4. Thesis and figures** (lines 255–281). Keep the block and its word-by-word animation.
- Label: "The belief". Text, interim: "Most data is collected, filed, and never read. A number does its work only when someone understands it." Sign-off, interim: "That is what I build for."
- The current conviction sentence moves to Background (step 7).
- Replace the "5 · Areas of engagement, one point of contact" figure with `4` · "Data stories on Papua New Guinea, published in 2026" (matches `dataviz/index.html`). Keep the other three.

**5. Start Here** (lines 283–348). Keep the tablist markup and `initPaths()` (`js/main.js:558`); only the tabs and panels change.
- Tabs: `i` "Data to tell" (`data-path="data"`, selected by default), `ii` "A system to build" (`data-path="project"`), `iii` "Curious" (`data-path="question"`). Rename ids from `path-role` to `path-data` and keep `aria-controls` in step.
- Data panel, interim. Kicker: "For teams with a report, a dataset, or a survey". Title: "Data that should be seen, not filed." (Neo's own line from the dataviz page.) Points: "I turn a dataset or a report into charts, maps, or a full scrolling story that reads well on a phone." / "Every figure is sourced and checked, and the sources are published with the work." / "The Ocean Knows First won the Grand Pacific Prize at the Pacific Dataviz Challenge 2026." Actions: primary "Describe the data" (`data-intent="data"`), ghost "See the data stories" (`#work`).
- System panel: keep the existing title and Klower's point. First point becomes "Client work is delivered through Abide Tech, in PNG, across the Pacific, and remotely." Actions unchanged.
- Curious panel: unchanged.
- The Hiring panel is removed. Roles stay reachable through the composer chip and `experience/`.

**6. Composer** (`index.html` lines 781–788; `js/main.js:788` `INTENTS`).
- Add intent `data`: subject "A data story", placeholder "What the data is, and who needs to understand it."
- Chip order: A data story (checked) · A system (value stays `project`, so every existing `?about=project` link still works) · Advice or training · A question · A role · Something else.
- Lead (line 770), interim: "A dataset, a system that should exist, a question. A few lines are enough to begin."

**7. Background** (lines 654–661), interim, first person:
- "I lead in-house software development at the University of Papua New Guinea, where our own team builds the systems rather than outsourcing them. I founded Abide Tech in 2026 to take on client work in PNG, across the Pacific, and remotely."
- "I believe Papua New Guinea can build its own systems: fitted to the institution, leaner to run, and owned by the people who depend on them."
- "My interests include PNG language preservation, mental models, data storytelling, and agentic AI."

**8. Search and link previews** (`index.html` head, lines 6–142).
- Title: "Neo Malesa — Data Storytelling and Custom Software | Port Moresby, Papua New Guinea".
- Description, Open Graph, Twitter: "Neo Malesa turns data into stories people read and builds custom software for institutions and businesses in Papua New Guinea, the Pacific, and remotely. Grand Pacific Prize, Pacific Dataviz Challenge 2026. Founder of Abide Tech; software development lead at the University of Papua New Guinea."
- JSON-LD `Person`: `jobTitle` "Data storyteller and software developer"; matching `description`; add `"award": "Grand Pacific Prize, Pacific Dataviz Challenge 2026"`; in `knowsAbout` add "Data Storytelling" and "Scrollytelling", remove the three trading entries.

### P2. Offers, contact, and the paths back from the work

**9. Engagements areas** (`index.html` lines 550–582, mirrored in `engagements/index.html` lines 78–102). Six cells stay, so `.areas` needs no CSS change.
- Lead, interim: "For businesses and institutions in PNG, across the Pacific, and remotely."
- 01 Data Stories and Visual Reports: "A dataset, survey, or report turned into charts, maps, or a full interactive story, with the sources published." Add a textlink to *The Ocean Knows First*, using the pattern already in `.areas__item--open`.
- 02 Dashboards and Decision Tools: "Live views of your own data, built for the people who decide with it."
- 03 Custom Software and Systems: "Software, information systems, and web platforms, built to specification, with the web, cloud, and database architecture beneath them."
- 04 Applied AI and Automation: existing text.
- 05 Advisory and Training: "Which technologies fit, and how to adopt them. Training for technical and executive teams."
- \+ Something Else: existing text.
- Step 1 of How It Begins: "A few lines on the problem, by email or WhatsApp. No formal brief required." No cost or duration anywhere.

**10. WhatsApp.**
- Add a WhatsApp row to the Direct list (after Email, `index.html` ~line 833) linking to `https://wa.me/<number>`.
- Add a third composer button, "Send by WhatsApp", built from the existing `compose()` in `initBrief()` (`js/main.js:828`): open `https://wa.me/<number>?text=` plus the encoded subject and body. Same empty-message guard as the other two buttons. This also covers visitors with no mail app.
- Update the note under the form (line 813): "Nothing is sent from this page and nothing is stored. The message opens in your own email or WhatsApp."

**11. Commission CTAs on the pages that get shared.** Add the existing `cta-band` component (as on `dataviz/index.html`: "Commissions" / "Data that should be seen, not filed?" / "Describe the data") to `dataviz/pngpm-ages/index.html` and `dataviz/png-passport/index.html`, after the signup box. Point every data CTA, including the one on `dataviz/index.html`, to `?about=data#connect`.

**12. Feature card: how it was made.** Under *The Ocean Knows First* card on the home page, add a sibling link to the Medium essay "What I Learned About El Niño While Building This Project" (URL in `writing-pinned.json`), following the `.dataviz__edition` sibling-link pattern in `dataviz/index.html`. The card is one `<a>`, so the link must sit outside it. Add the same link on `dataviz/index.html`.

**13. `experience/index.html` CTA band.** Swap the buttons: primary "Describe a project" (`?about=project`), ghost "Discuss a role" (`?about=role`).

**14. Story title.** The site says "Told to Quit. Almost No One Does."; the live story is headed "Told to Resign. Almost No One Does." Confirm with Neo, then make `index.html` (card title and `aria-label`) and `dataviz/index.html` match the story.

### P3. Depth and polish

**15. `engagements/index.html` becomes the page Neo sends to prospects.** Add one section, "Plain Terms", for Neo's own answers to what institutional buyers ask: who does the work, how client work fits beside UPNG, remote working, Abide Tech as the contracting entity, who owns the code and data, how AI assistance is used and checked. Build the section with existing `mandates__*` classes; leave it out until Neo's text exists.

**16. Home tools row.** Move the Ichimoku trading bot off the home page (it stays in `resources/`) and change `.cards--four` to `.cards`. Neo's call: it shows range, but a trading bot beside an institutional pitch invites the wrong question.

**17. Home writing list.** Show three chosen pieces instead of the latest three: add a `featured` flag in `writing-pinned.json`, prefer flagged posts in `render()` (`js/main.js` ~line 702), and check `.github/scripts/update_writing.py` keeps the flag. Suggested picks: the *Ocean Knows First* essay, "Voting Technology Is a Stack", "A Short History of ICT Regulation in PNG".

**18. Housekeeping.** `README.md` features list (Start Here tabs, composer intents, WhatsApp). Optional: reorder `BEACONS` in `js/game.js` so Data comes first, and put the six lines in the first person once Neo has written them.

## Part B. Writing briefs (for Neo)

### Principles (these replace sections 1–3 of the style guide)

1. **Say "I".** Labels stay as labels (dates, titles, card meta). Sentences get a narrator.
2. **Open on the reader's trouble, not your title.** The first sentence of each section should be something the reader already thinks.
3. **One checkable detail per paragraph.** A number, a place, a name. Your own bar: "Australia, 850 km away, requires one; Peru, 14,600 km away, does not."
4. **Say it aloud first.** Record yourself answering the prompts below, transcribe it, then cut a third. This is the fastest way out of the AI register.
5. **Show the place, state the belief once.** Tok Pisin where it comes naturally, as in the opening of *Told to Resign*. The conviction about PNG appears once, in Background.
6. **Invite, never plead.** Each section ends with one next step. (Kept from the current guide.)
7. **Claim only what the work shows.** "In build" stays "in build". AI assistance is disclosed the way the stories disclose it.

Habits in the current copy to cut: sentences with no subject; lists of three for rhythm ("Data stories in public, systems in service, tools free to use."); closing aphorisms ("That is the work."); "not this, but that" phrasing ("Nothing off the shelf."); abstract nouns with no example (systems, institutions, engagements).

### Order to write in

Hero, then the Start Here data panel, then Engagements 01 and 03, then Background. Everything else can wait.

### Hero claim

- Job: tell a stranger in one sentence what they could hire you for.
- Limits: one sentence, 20 words at most, names both the data work and the building. The kicker already says Port Moresby, so the sentence need not.
- Prompts: When a friend outside technology asks what you do, what do you say? What did a reader of *The Ocean Knows First* tell you they finally understood?
- Three directions to try: lead with what the reader gets; lead with a single fact from your own work and then say you build such things; a plain two-part statement like the interim line.
- Test: read it to someone who does not know you and ask what you would do for them. If they cannot answer, rewrite.

### Start Here (two client panels)

- Shape: a title of eight words or fewer, then three points of 20 words or fewer. Point one is their problem in their words. Point two is what you do about it. Point three is proof, with a link.
- Picture one person per panel. Data: a communications or monitoring lead with a report nobody finished. System: a manager whose office runs on spreadsheets and a vendor quote they cannot afford.
- Prompts: What does that person say in the first meeting? What do they have at the end that they did not have before?

### Engagements

- Each area: two sentences. When someone should call you, then what they end up with. No cost.
- Prompts: Describe the last time someone showed you data that deserved better. What did UPNG stop needing an outside vendor for?
- How It Begins: say who replies and how soon, in your own words.
- Plain Terms (step 15): answer each buyer question in one or two sentences.

### Background

- Job: the one place for your story. 120–180 words in three short paragraphs.
- Paragraph one: where it started, as a moment (tutoring at UPNG, the first system, Korea). Paragraph two: what you do now, including how client work fits beside UPNG. Paragraph three: what you believe about PNG building its own systems, once.
- Prompts: What was the first thing you built that other people depended on? Why publish data stories about PNG when nobody is paying for them?

### Facts only Neo can supply

WhatsApp business number · year started at UPNG and any numbers that can be shared (users, systems, years in service) · reply time you will keep · whether "handed over so your own people can run it" is a promise you make · the correct title of the resignations story · a first testimonial when Klower's ships.

## Part C. Outside this repo (Neo)

1. **Link the stories back.** Add "Neo Malesa · neomalesa.com" and one line inviting commissions (`https://neomalesa.com/?about=data#connect`) to the footers of `pacificdatavizchallenge26` and `png-calls-to-resign`. This is probably the largest single source of the right visitors. Check the challenge rules allow a footer edit to a winning entry.
2. Use the finished hero sentence as the bio line on LinkedIn, X, Medium, and GitHub.
3. Optional: a domain address (for example hello@neomalesa.com) forwarding to the current inbox.
4. After 60–90 days, count enquiries by subject line ("A data story", "A project") and adjust which offer leads.

## Verification

1. `python3 -m http.server 8000`, then open `http://localhost:8000`.
2. Start Here: three tabs, data selected on load; arrow keys, Home, and End move between tabs; each tab's button presets the matching composer chip.
3. Composer: `?about=data#connect`, `?about=project#connect`, and `?about=role#connect` each preset the right chip. Subject reads "A data story — <org>". "Open in email", "Copy the message", and "Send by WhatsApp" all carry the same text; an empty message is refused by all three.
4. Every subpage CTA lands on the composer with the right chip (`dataviz/`, both story pages, `experience/`, `engagements/`, `resources/`, `now.html`).
5. JSON-LD parses: extract each `application/ld+json` block and run it through `python3 -m json.tool`.
6. `grep -rn "hiring\|Hiring\|path-role" index.html js/` returns nothing unexpected. `grep -rn "INTERIM" .` lists every line still waiting for Neo.
7. Check at 360px width, with `prefers-reduced-motion`, and with JavaScript off (all panels and copy still readable).
8. Read the home page top to bottom as a client with a dataset: within the first two screens it should be clear what Neo does, that the prize-winning story is his, and how to write to him.
