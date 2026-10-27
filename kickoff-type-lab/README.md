# Kick Off Type Lab

A p5.js type tool for exploring groovy, gooey, western lettering (built for the Lob Company Kick Off logo). Live text on the left, a Figma-style type panel on the right.

## What it does

- Live text editing with a font picker, weight, size, line height
- **Letter spacing follows the text cursor.** A caret sets the gap after the previous letter, a selection sets every selected letter. Double-click the text to select all.
- **Default spacing** moves every letter and adds to individual spacing instead of overwriting it
- **Gooey** rounds the outlines (hard edges, no blur), **Warp** ripples the text, **Stretch X/Y** widens and heightens letterforms, offset shadow, colors
- **SVG export** with outlined glyph paths (Copy SVG, Show code, Download on OpenProcessing)

## Files

| File | Purpose |
|---|---|
| `index.html` | Source of truth: markup, CSS and the p5 sketch |
| `sketch.js` | Generated. Self-contained OpenProcessing sketch (builds its own UI) |
| `index.embedded.html` | Generated. Single-file build with fonts embedded as data URIs |
| `sketch-code.html` | Generated. Code viewer page |
| `build.py` | Regenerates the three files above: `python3 build.py` |
| `fonts/` | Font files used by the tool (see licensing below) |

Edit `index.html`, then run `python3 build.py`. Never edit the generated files by hand.

## Run it on OpenProcessing

1. New p5.js sketch, replace `sketch.js` with this repo's `sketch.js`.
2. Upload the files from `fonts/` to the sketch with the same names (listed in `FONT_FILES` at the top of the code).
3. Run. Without the fonts it falls back to Chango, and "Load font file…" adds any font by hand.

## What I learned building it

**Fonts**
- A web page cannot read fonts installed on your Mac. `local()` name guessing is unreliable, so the fonts are embedded (artifact) or uploaded (OpenProcessing).
- I could not tell a font was wrong from its filename. Previewing candidates with the real text found problems fast. dafont accepts a preview text in the URL: `https://www.dafont.com/search.php?q=groovy&text=COMPANY+KICK+OFF&psize=s`. Search single words, not phrases.
- dafont downloads are at `https://dl.dafont.com/dl/?f=<slug>`, for example `retro_groovy`.
- Many fonts here are trial, demo or personal-use only.

**Canvas and p5**
- Set the canvas font yourself (`drawingContext.font`) and draw with `fillText`. p5's `textFont` with a family list silently stopped text from resizing when the font had not loaded.
- Give the font a real fallback stack (`Chango, "Arial Black", sans-serif`) so size changes always apply.
- Per-letter spacing is stored as an array parallel to the text. On every edit, diff the old and new text (common prefix and suffix) so spacing stays attached to the right letters.
- Drive spacing from the textarea's `selectionStart` / `selectionEnd`. The selection survives focus changes, so a spacing field can edit it after you click the field.

**Effects**
- Gooey that rounds shapes without blur: blur the layer, threshold the alpha hard (about 1px of anti-aliasing), then repaint every pixel in the solid color. Repainting the color removes the halo that makes it look blurry.
- Warp: draw the text into an offscreen canvas and redraw it in 2px strips, shifted by a sine wave. Do vertical strips first, then horizontal ones.
- Cache the expensive layers. Re-render the goo only when settings change, and only redo the warp when the animation phase changes. Otherwise a blinking caret re-runs the whole pipeline.

**SVG export**
- `opentype.js` turns each letter into real outline paths from the font bytes.
- Gooey exports as an SVG filter: `feGaussianBlur` followed by `feComponentTransfer` with a steep alpha slope (`slope=16 intercept=-7.5`).
- Warp is applied to the path points. Curves and long lines are subdivided first so the ripple bends them.
- Bold and italic are approximated (thin stroke, skew). Fonts without outline data export as live text.
- Figma may ignore the SVG filter. Export with Gooey at 0 if the shapes come in flat.

**Claude artifact limits**
- Downloads are blocked in the artifact viewer, so use a Copy button there. The Download button only appears outside the viewer.
- Scripts load only from allowed CDNs. cdnjs hosts `p5.js` and `opentype.js`.
- Do not use `$` as a helper name in OpenProcessing code. It can clash with a global. The generated sketch uses `dom()`.

## Upload to your GitHub sketches repo

First check licensing. Several fonts in `fonts/` are trial, demo or personal-use files. **Do not commit them to a public repo.** Add this to `.gitignore` and keep the font files local:

```
fonts/
index.embedded.html
```

`index.embedded.html` contains the fonts as base64, so it counts as redistributing them. Add a `fonts/README.md` that lists the font names and where to get them.

### If your repo already exists

```bash
# 1. clone it, or cd into your local copy
git clone git@github.com:<you>/<sketches-repo>.git
cd <sketches-repo>

# 2. add the sketch as its own folder
mkdir kickoff-type-lab
cp -R "/Users/kristynagottvald/Claude Code/kickoff-type-tool/." kickoff-type-lab/
cd kickoff-type-lab && printf 'fonts/\nindex.embedded.html\n' > .gitignore && cd ..

# 3. commit and push on a branch
git checkout -b add-kickoff-type-lab
git add kickoff-type-lab
git commit -m "Add Kick Off Type Lab sketch"
git push -u origin add-kickoff-type-lab
```

Then open a pull request, or merge it to `main` if you push directly to main.

### If you want a new repo for it

```bash
cd "/Users/kristynagottvald/Claude Code/kickoff-type-tool"
printf 'fonts/\nindex.embedded.html\n' > .gitignore
git init && git add . && git commit -m "Kick Off Type Lab"
gh repo create kickoff-type-lab --private --source=. --push
```

### Suggested layout for a repo of sketches

```
sketches/
  kickoff-type-lab/
    README.md      <- this file
    index.html
    sketch.js
    build.py
    fonts/README.md
  next-sketch/
    ...
```

One folder per sketch, each with its own README that links the OpenProcessing URL once you publish it.
