/* Per-tool walkthrough scripts (see demo.js). Each plays a short sequence on the tool's real controls and ends with the tool back
   in its starting state, because it loops. Every action skips quietly if its control is missing. */
window.DEMOS = window.DEMOS || {};
const D = window.DEMOS;

/* Industry Swapper Plug-in: click through four industries, zoom, reset */
D['direct-mail-engine'] = async (d) => {
  // the list is redrawn after each pick, so each card is looked up fresh
  const pick = (text) => d.byText('#industryList .industry-card', text);
  for (const [label, text] of [['Tech', 'Cloud Storage'], ['Retail', 'Apparel'], ['Automotive', 'Sales Event'], ['Health', 'Dental']]) {
    d.say('Swap the industry: ' + label);
    await d.click(pick(text), 900); await d.wait(1500);
  }
  d.say('Zoom in to check the detail');
  await d.click('button[title="Zoom In"]'); await d.click('button[title="Zoom In"]'); await d.wait(1200);
  d.say('Back to the default piece');
  await d.click('.reset-btn'); await d.wait(1200);
};

/* Postmark Awards: tune the ribbon, randomise the path */
D['ribbon-text'] = async (d) => {
  const s = d.$$('input[type=range]');
  d.say('Bend the ribbon');
  await d.slider(s[0], 120, 1100); await d.wait(600);
  d.say('Thicken the ribbons');
  await d.slider(s[2], 80, 1100); await d.wait(600);
  d.say('Randomise the pattern');
  await d.click(d.byText('button', 'randomize')); await d.wait(1600);
  await d.click(d.byText('button', 'randomize')); await d.wait(1600);
  await d.slider(s[0], 50, 800); await d.slider(s[2], 55, 800);
};

/* Marketing Minesweeper: opens an area and a couple of safe squares, then steps on a bomb. A fresh board is dealt each time round. */
D['marketing-mine'] = async (d) => {
  if (typeof initGame !== 'function' || typeof gridElements === 'undefined') return;
  initGame();                                                        // a fresh board every loop
  await d.wait(500);
  const all = () => gridElements.flat();
  const nbrs = (c) => all().filter((n) => n !== c && Math.abs(n.x - c.x) <= 1 && Math.abs(n.y - c.y) <= 1);
  const at = (c) => d.canvasPoint((c.x + 0.5) * s, (c.y + 0.5) * s);
  const dist = (c) => Math.hypot(c.x - cols / 2, c.y - rows / 2);
  d.say('Click a square to open an area');
  const zero = all().filter((c) => !c.isMine && c.neighborCount === 0).sort((a, b) => dist(a) - dist(b))[0];
  if (zero) { await d.click(at(zero), 900); await d.wait(1100); }
  d.say('Numbers count the mines next to a square');
  for (let i = 0; i < 2; i++) {
    const next = all().filter((c) => !c.revealed && !c.isMine && nbrs(c).some((n) => n.revealed && n.neighborCount > 0))[0];
    if (!next) break;
    await d.click(at(next), 800); await d.wait(800);
  }
  d.say('One wrong click and it is a mine');
  const bomb = all().filter((c) => c.isMine && !c.revealed && nbrs(c).some((n) => n.revealed)).sort((a, b) => dist(a) - dist(b))[0] || all().find((c) => c.isMine && !c.revealed);
  if (bomb) { await d.click(at(bomb), 900); await d.wait(2600); }   // the board then shows every mine
};

/* Brand Guidelines Mini Site: open sections from the tiles and use their generators (logo, type, colour, motion), coming back to the tiles each time */
D['thread-brand-guidelines'] = async (d) => {
  const home = async () => { await d.click('.site .logo', 700); await d.wait(1100); };
  const chip = (sel) => d.click(sel, 650);

  d.say('Open a section from the tiles');
  await d.click('a.tile[data-sec="logo"]', 900); await d.wait(1500);
  await d.reveal('#lgKind', 900);   // scroll the section so the controls and the logo they change are on screen
  d.say('Logo: change the lockup');
  await chip('#lgKind button[data-v="monogram"]'); await d.wait(900);
  d.say('Logo: resize it');
  await d.slider('#lgSize', 520, 1100); await d.wait(500);
  await d.slider('#lgSize', 300, 800);
  d.say('Logo: switch the colour');
  await chip('#lgTheme button[data-v="ink"]'); await d.wait(900);
  await chip('#lgTheme button[data-v="yellow"]'); await d.wait(500);
  await home();

  d.say('Colour: pick an approved pairing');
  await d.click('a.tile[data-sec="color"]', 900); await d.wait(1500);
  await d.reveal('#pgrid', 900);
  const pairs = d.$$('#pgrid button');
  for (const i of [2, 6, 10]) { if (pairs[i]) { await d.click(pairs[i], 700); await d.wait(700); } }
  d.say('Colour: click a swatch to copy its hex');
  await d.reveal('#swCore', 800, 0.5);
  const sw = d.$('#swCore button'); if (sw) { await d.click(sw, 800); await d.wait(1200); }
  await home();

  d.say('Motion: change the style and the pen');
  await d.click('a.tile[data-sec="motion"]', 900); await d.wait(1500);
  await d.reveal('#moStyle', 900);
  await chip('#moStyle button[data-v="tilts"]'); await d.wait(1000);
  await d.slider('#moW', 9, 1000); await d.wait(700);
  await chip('#moTheme button[data-v="yellow"]'); await d.wait(1000);
  await chip('#moStyle button[data-v="loops"]'); await d.slider('#moW', 5, 700);
  await home();
};

/* Pattern Generator: change motif, nudge a control, move an object, recolour */
D['pattern-generator'] = async (d) => {
  const motifs = d.$$('#panel button').filter((b) => /^\s*\d/.test(b.textContent));
  d.say('Pick a motif');
  await d.click(motifs[2]); await d.wait(1400);
  await d.click(motifs[4]); await d.wait(1400);
  const r = d.$$('#panel input[type=range]');
  d.say('Adjust the pattern');
  if (r[0]) await d.slider(r[0], +r[0].max * 0.8, 1100);
  await d.wait(700);
  d.say('Move an object');
  await d.drag([0.4, 0.5], [0.6, 0.42], 1100); await d.wait(900);
  d.say('Recolour');
  await d.click(d.byText('#panel button', 'randomise colours')); await d.wait(1400);
  d.say('Reset');
  await d.click(d.byText('#panel button', 'reset')); await d.wait(900);
};

/* Kick Off Type Lab: font, text, sliders, colour */
D['kickoff-type-lab'] = async (d) => {
  const txt = d.$('#txt'), orig = txt ? txt.value : '';
  const opts = d.$$('#font option');
  d.say('Pick a font');
  if (opts[3]) await d.set('#font', opts[3].value);
  await d.wait(1000);
  d.say('Type your own word');
  await d.type('#txt', 'GROOVY', 90); await d.wait(900);
  d.say('Make it gooey and warped');
  await d.slider('#goo', 85, 1100); await d.slider('#warp', 60, 1100); await d.wait(800);
  d.say('Change the colour');
  await d.set('#cfg', '#c2410c'); await d.wait(1000);
  d.setValue('#cfg', '#17372b'); d.setValue('#goo', 35); d.setValue('#warp', 12); d.setValue('#txt', orig);
  if (opts[0]) d.setValue('#font', opts[0].value);
  await d.wait(600);
};

/* Palette Compositions: click to cycle */
D['palette-compositions'] = async (d) => {
  d.say('Click to cycle palettes and layouts');
  for (const p of [[0.5, 0.5], [0.55, 0.45], [0.45, 0.55], [0.5, 0.5], [0.6, 0.5]]) { await d.click(p, 900); await d.wait(1100); }
};

/* Integratron: the dome cycles from day to night by itself; scrolling zooms, a click rings a sound bath bowl */
D['integratron'] = async (d) => {
  d.sound();
  d.note('Sound is activated by interaction');
  d.say('Scroll to zoom into the dome');
  await d.wheel([0.5, 0.55], -900, 1500, 12); await d.wait(900);
  d.say('Click to ring a sound bath bowl');
  await d.click([0.5, 0.6], 900); await d.wait(1200);
  d.say('Scroll back out');
  await d.wheel(null, 1500, 1500, 12); await d.wait(900);
  d.say('The dome cycles from day to night on its own');
  await d.wait(2500);
};

/* Reprise Tiles: click the tiles' own controls (role chips, toggles, palette) */
D['reprise-tiles'] = async (d) => {
  if (typeof hits === 'undefined') return;
  const pt = (id, fx = 0.5) => { const h = hits.find((x) => x.id === id); return h ? d.canvasPoint(h.x + h.w * fx, h.y + h.h / 2) : null; };
  d.say('Click a role to change who the demo is for');
  for (const id of ['role0', 'role1', 'role0']) { const p = pt(id); if (p) { await d.click(p, 900); await d.wait(900); } }
  d.say('Flip a toggle');
  for (const id of ['tog', 'tog', 'clock']) { const p = pt(id); if (p) { await d.click(p, 900); await d.wait(800); } }
  d.say('Pick a palette colour');
  const pal = pt('pal', 0.75); if (pal) { await d.click(pal, 900); await d.wait(1400); }
  const pal0 = pt('pal', 0.2); if (pal0) { await d.click(pal0, 700); await d.wait(900); }
};

/* Banner Template Studio: format, layout, theme, copy, shuffle */
D['hero-banner-engine'] = async (d) => {
  const was = (k) => d.$('.seg[data-key="' + k + '"] button[aria-pressed="true"]');
  const layout = was('layout'), aspect = was('aspect'), anchor = was('anchor');
  const h = d.$('#heading'), hv = h ? h.value : '';
  d.say('Pick a format');
  await d.click('.seg[data-key="aspect"] button[data-v="16x9"]'); await d.wait(1200);
  d.say('Change the layout');
  await d.click('.seg[data-key="layout"] button[data-v="around"]'); await d.wait(1300);
  await d.click('.seg[data-key="layout"] button[data-v="band"]'); await d.wait(1300);
  d.say('Try a theme');
  const th = d.$$('#themes > *');
  await d.click(th[3]); await d.wait(1200);   // Lavender (not the yellow-green Lime theme)
  d.say('Edit the copy');
  await d.type('#heading', 'Build it once.', 80); await d.wait(1000);
  d.say('Shuffle the visuals');
  await d.click('#shuffle'); await d.wait(1200);
  if (aspect) await d.click(aspect);
  if (layout) await d.click(layout);
  if (anchor) await d.click(anchor);
  if (th[0]) await d.click(th[0]);
  d.setValue('#heading', hv);
  await d.wait(600);
};

/* No-Code Binary Motif: the mouse flips the grid in a wave */
D['binary-grid'] = async (d) => {
  d.say('Move the mouse to flip the grid');
  await d.sweep([[0.15, 0.3], [0.5, 0.65], [0.85, 0.35], [0.6, 0.8], [0.25, 0.7], [0.5, 0.45]], 1100);
};

/* Temporary Notes: brush across the bars */
D['sound-bars'] = async (d) => {
  d.sound();
  d.note('Sound is activated by interaction');
  d.say('Brush across the bars');
  await d.sweep([[0.1, 0.5], [0.45, 0.42], [0.8, 0.55], [0.55, 0.68], [0.2, 0.6], [0.7, 0.4]], 900);
};

/* Mail Stack: reshape the ribbon of postcards */
D['mail-stack'] = async (d) => {
  const s = d.$$('input[type=range]');
  d.say('Hover a postcard');
  await d.sweep([[0.45, 0.5], [0.6, 0.45]], 900); await d.wait(900);
  d.say('Reshape the path');
  if (s[0]) await d.slider(s[0], +s[0].max * 0.75, 1100);
  await d.wait(600);
  await d.click(d.byText('button', 'randomize')); await d.wait(1600);
  if (s[0]) await d.slider(s[0], 100, 900);
};

/* Brand Motion System: pick a motif, randomise the palette, move the word (click it, move, click to drop), switch motif again */
D['brand-motion'] = async (d) => {
  d.say('Pick a motion motif');
  await d.click(d.byText('button', 'orbit')); await d.wait(1600);
  await d.click(d.byText('button', 'stack')); await d.wait(1600);
  d.say('Randomise the palette');
  await d.click(d.byText('button', 'randomize')); await d.wait(1400);
  if (typeof textX !== 'undefined' && typeof width !== 'undefined') {
    // this tool picks a piece up with a click and puts it down with a second click
    const cx = 30 + (width - 370) / 2, cy = 20 + (height - 100) / 2;
    const ox = textX, oy = textY;
    d.say('Click the word to pick it up');
    await d.click(d.canvasPoint(cx + ox, cy + oy), 800); await d.wait(300);
    d.say('Move it, then click to put it down');
    await d.move(d.canvasPoint(cx + ox - 150, cy + oy - 90), 900); await d.wait(300);
    await d.click(d.canvasPoint(cx + ox - 150, cy + oy - 90), 200); await d.wait(900);
    // put the word back for the next loop
    await d.click(d.canvasPoint(cx + textX, cy + textY), 700); await d.wait(200);
    await d.move(d.canvasPoint(cx + ox, cy + oy), 700);
    await d.click(d.canvasPoint(cx + ox, cy + oy), 200); await d.wait(500);
  }
  d.say('Switch to another motif');
  await d.click(d.byText('button', 'grow')); await d.wait(1200);
};

/* Postmark Award Motion Styles: switch style, edit text, speed */
D['postmark-awards-motion'] = async (d) => {
  const styles = d.$$('#styles button');
  d.say('Switch the style');
  for (const b of [styles[1], styles[2], styles[3]]) { await d.click(b); await d.wait(2200); }
  d.say('Edit the text');
  const f = d.$('#fields input[type=text]'), orig = f ? f.value : '';
  await d.type(f, 'MAILPIECE', 80); await d.wait(1600);
  d.say('Speed it up');
  await d.slider('#speed', 1.7, 1000); await d.wait(1600);
  await d.slider('#speed', 1, 800);
  d.setValue(f, orig);
  await d.click(styles[0]); await d.wait(1200);
};

/* Brand Audit Engine plays its own timeline (library, audit, decision) with its own cursor, so this script only names the scene on screen */
D['brand-audit-engine'] = async (d) => {
  d.hide();   // the tool draws its own cursor
  for (let i = 0; i < 160; i++) {
    const t = typeof T !== 'undefined' ? T : 0;
    d.say(t < 5400 ? 'Browse the library' : t < 16500 ? 'Run an audit' : 'Request changes');
    await d.wait(200);
  }
};
