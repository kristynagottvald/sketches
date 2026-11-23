/* Per-tool walkthrough scripts (see demo.js). Each plays a short sequence on the tool's real controls and ends with the tool back
   in its starting state, because it loops. Every action skips quietly if its control is missing. */
window.DEMOS = window.DEMOS || {};
const D = window.DEMOS;

/* Industry Swapper Plug-in: swap the industry, zoom, reset */
D['direct-mail-engine'] = async (d) => {
  const cards = d.$$('#industryList .industry-card');
  d.say('Swap the industry');
  await d.click(cards[2]); await d.wait(1400);
  await d.click(cards[5]); await d.wait(1400);
  await d.click(cards[1]); await d.wait(1400);
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
  d.say('Thicken the type');
  await d.slider(s[2], 80, 1100); await d.wait(600);
  d.say('Randomise the pattern');
  await d.click(d.byText('button', 'randomize')); await d.wait(1600);
  await d.click(d.byText('button', 'randomize')); await d.wait(1600);
  await d.slider(s[0], 50, 800); await d.slider(s[2], 55, 800);
};

/* Marketing Minesweeper: a few reveals */
D['marketing-mine'] = async (d) => {
  d.say('Reveal squares');
  for (const p of [[.5, .5], [.42, .46], [.58, .54], [.5, .38], [.5, .62]]) { await d.click(p, 900); await d.wait(900); }
  await d.wait(1200);
};

/* Brand Guidelines Mini Site: open a section, come back */
D['thread-brand-guidelines'] = async (d) => {
  d.say('Open a section');
  await d.click('a.tile[data-sec="color"]'); await d.wait(2600);
  await d.click('a.logo'); await d.wait(1200);
  d.say('Open another');
  await d.click('a.tile[data-sec="typography"]'); await d.wait(2600);
  await d.click('a.logo'); await d.wait(1000);
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

/* Integratron: ring the bowls */
D['integratron'] = async (d) => {
  d.say('Ring the sound bath bowls');
  for (const p of [[0.35, 0.6], [0.5, 0.66], [0.65, 0.6], [0.5, 0.5]]) { await d.click(p, 1000); await d.wait(1200); }
};

/* Reprise Tiles: poke the tiles */
D['reprise-tiles'] = async (d) => {
  d.say('Click the tiles');
  for (const p of [[0.3, 0.35], [0.6, 0.3], [0.7, 0.65], [0.4, 0.7], [0.5, 0.5]]) { await d.click(p, 900); await d.wait(1100); }
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
  await d.click(th[2]); await d.wait(1200);
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

/* Brand Motion System: motifs, palette, a drag */
D['brand-motion'] = async (d) => {
  d.say('Pick a motion motif');
  await d.click(d.byText('button', 'orbit')); await d.wait(1600);
  await d.click(d.byText('button', 'stack')); await d.wait(1600);
  d.say('Randomise the palette');
  await d.click(d.byText('button', 'randomize')); await d.wait(1400);
  d.say('Drag a piece around the frame');
  await d.drag([0.3, 0.5], [0.4, 0.38], 1000); await d.wait(900);
  await d.click(d.byText('button', 'grow')); await d.wait(900);
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
