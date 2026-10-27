/**
 * IEU Metacognitive Prompt Machine (Pure JavaScript / p5.js Mode)
 * Copy and paste this directly into your OpenProcessing sketch.
 */

let leftInput, rightOutput, thinkingOutput, apiKeyInput, generateBtn, autoThinkingToggle, agentSelect;

function setup() {
  // Create background canvas
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('position', 'fixed');
  cnv.style('top', '0');
  cnv.style('left', '0');
  cnv.style('z-index', '-1');
  cnv.style('display', 'block');
  cnv.style('pointer-events', 'none'); 
  background('#B3E19C'); // Lime green
  noLoop(); 

  // Inject CSS styling with strict layout reset for perfect centering
  // (the page keeps the hub nav on top, so the layout rules live on #stage instead of body)
  let css = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    #stage, #stage *, #stage *::before, #stage *::after {
      box-sizing: border-box;
    }

    html, body {
      width: 100%;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: transparent; 
    }

    #stage {
      color: #1a2e2b;
      font-family: 'Plus Jakarta Sans', sans-serif;
      display: flex;
      flex-direction: column; 
      align-items: center; 
      justify-content: center;
      min-height: calc(100vh - 60px);
      padding: 30px 20px;
    }

    .app-container {
      width: 100%;
      max-width: 1050px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Top API Header */
    .api-header {
      background: #FFFFFF;
      border-radius: 20px;
      padding: 16px 24px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
      display: flex;
      align-items: center;
      gap: 16px;
      width: 100%;
    }

    .api-header label {
      font-weight: 700;
      font-size: 14px;
      color: #105B52;
      white-space: nowrap;
    }

    .api-header input {
      flex: 1;
      background: #F4F7F8;
      border: 1px solid #E2E8EC;
      color: #1a2e2b;
      padding: 10px 16px;
      border-radius: 12px;
      font-size: 14px;
      outline: none;
      font-family: inherit;
    }

    .api-header input:focus {
      border-color: #105B52;
    }

    /* Main Grid Layout */
    .prompt-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      width: 100%;
    }

    @media (max-width: 850px) {
      .prompt-grid { grid-template-columns: 1fr; }
    }

    /* Inside Card Titles */
    .card-title-inside {
      font-size: 18px;
      font-weight: 800;
      color: #105B52;
      margin-bottom: 12px;
      background: transparent !important;
      padding: 0;
      box-shadow: none;
    }

    .card-title-inside.right-title {
      color: #B3E19C !important;
    }

    /* Control Controls */
    .controls-row {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-wrap: wrap;
    }

    .control-select, .toggle-btn {
      background: #F4F7F8;
      border: 1px solid #E2E8EC;
      color: #105B52;
      font-weight: 600;
      font-size: 11px;
      padding: 6px 8px;
      border-radius: 8px;
      outline: none;
      cursor: pointer;
      font-family: inherit;
    }

    .toggle-btn.active {
      background: #105B52;
      color: #B3E19C;
      border-color: #105B52;
    }

    /* Dashboard Cards */
    .dashboard-card {
      background: #FFFFFF;
      border-radius: 24px;
      padding: 20px;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      height: 480px;
      justify-content: space-between;
    }

    /* Right Card */
    .dashboard-card.metacog-card {
      background: #105B52;
      color: #FFFFFF;
      box-shadow: 0 15px 40px rgba(16, 91, 82, 0.25);
    }

    /* Sub-sections */
    .split-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
      overflow: hidden;
    }

    .sub-section {
      background: #F8FAFB;
      border: 1px solid #E8ECEF;
      border-radius: 14px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

    .thinking-section {
      background: transparent;
      border: none;
      padding: 4px 2px;
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

    .sub-section-title {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #5A7370;
      margin-bottom: 4px;
    }

    textarea.prompt-textarea {
      width: 100%;
      background: transparent;
      border: none;
      color: #1a2e2b;
      font-size: 13px;
      line-height: 1.4;
      resize: none;
      outline: none;
      font-family: inherit;
      flex: 1;
    }

    .thinking-box {
      font-size: 12px;
      color: #4A605D;
      overflow-y: auto;
      flex: 1;
      white-space: pre-wrap;
      font-style: italic;
    }

    /* Output Content */
    .output-content {
      color: #FFFFFF;
      font-size: 13px;
      line-height: 1.6;
      overflow-y: auto;
      flex: 1;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .output-content strong.ieu-kw {
      color: #B3E19C; 
      font-weight: 700;
    }

    /* Card Footers */
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid rgba(0,0,0,0.06);
    }

    .metacog-card .card-footer {
      border-top: 1px solid rgba(255,255,255,0.15);
    }

    .convert-btn {
      background: #105B52;
      color: #B3E19C;
      border: none;
      padding: 8px 12px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }

    .convert-btn:hover {
      background: #0d4a42;
    }

    .metacog-card .convert-btn {
      background: #B3E19C;
      color: #105B52;
    }

    .metacog-card .convert-btn:hover {
      background: #9edc84;
    }

    .convert-btn:disabled {
      background: #CBD5E1;
      color: #64748B;
      cursor: not-allowed;
    }

    /* Loading Spinner Animations */
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .loader {
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top: 2px solid currentColor;
      width: 14px;
      height: 14px;
      animation: spin 1s linear infinite;
      display: inline-block;
    }
    
    .loader-dark {
      border: 2px solid rgba(16, 91, 82, 0.2);
      border-top: 2px solid #105B52;
    }
  `;

  createElement('style', css);

  // Root Container with ID
  let app = createDiv().class('app-container').id('artboard').parent('stage');

  // Top Bar
  let apiHeader = createDiv().class('api-header').parent(app);
  createSpan('Gemini API Key:').parent(apiHeader);
  apiKeyInput = createInput('', 'password')
    .attribute('placeholder', 'Paste your Gemini API key here...')
    .parent(apiHeader);

  // Main 2-Column Grid
  let grid = createDiv().class('prompt-grid').parent(app);

  // --- LEFT COLUMN ---
  let leftCol = createDiv().parent(grid);
  let leftCard = createDiv().class('dashboard-card').parent(leftCol);
  createDiv('Non-Metacognitive Prompt').class('card-title-inside').parent(leftCard);

  let splitContainer = createDiv().class('split-container').parent(leftCard);

  let inputSub = createDiv().class('sub-section').parent(splitContainer);
  createDiv('Input Prompt').class('sub-section-title').parent(inputSub);
  leftInput = createElement('textarea')
    .class('prompt-textarea')
    .value("The table columns don't line up. Fix the header alignment.")
    .attribute('placeholder', 'Enter basic prompt here...')
    .parent(inputSub);

  let thinkingSub = createDiv().class('thinking-section').parent(splitContainer);
  createDiv('LLM Thinking Process').class('sub-section-title').parent(thinkingSub);
  
  // Set initial thinking text
  let defaultThinking = `To resolve the alignment issue, the core logical gap must be addressed by identifying the specific table format (Markdown, HTML, or text) and locating the syntax discrepancy. By applying structural heuristics, we can explicitly define alignment rules (e.g., delimiter positioning or CSS properties) and establish a permanent standard to prevent future misalignment. This systematic correction translates a vague visual complaint into an actionable technical solution.`;
  thinkingOutput = createDiv(defaultThinking).class('thinking-box').parent(thinkingSub);

  let leftFooter = createDiv().class('card-footer').parent(leftCard);
  
  let leftControls = createDiv().class('controls-row').parent(leftFooter);
  agentSelect = createSelect().class('control-select').parent(leftControls);
  
  // Points to the active free-tier Flash models
  agentSelect.option('Gemini 3.5 Flash', 'gemini-3.5-flash'); 
  agentSelect.option('Gemini 3.8 Flash', 'gemini-3.8-flash');

  autoThinkingToggle = createButton('Thinking: ON')
    .class('toggle-btn active')
    .parent(leftControls)
    .mousePressed(() => {
      let isActive = autoThinkingToggle.hasClass('active');
      if (isActive) {
        autoThinkingToggle.removeClass('active').html('Thinking: OFF');
      } else {
        autoThinkingToggle.addClass('active').html('Thinking: ON');
      }
    });

  generateBtn = createButton('Transform ➔')
    .class('convert-btn')
    .parent(leftFooter)
    .mousePressed(rewriteToIEU);

  // --- RIGHT COLUMN ---
  let rightCol = createDiv().parent(grid);
  let rightCard = createDiv().class('dashboard-card metacog-card').parent(rightCol);
  
  createDiv('IEU Metacognitive Prompt').class('card-title-inside right-title').parent(rightCard);

  // Set initial metacog prompt text
  let defaultMetacog = `Here is the refined prompt structured under the IEU metacognitive framework:

### Context / Issue Overview
The table columns and headers are visually misaligned, causing readability issues. This is typically caused by inconsistent column widths, missing delimiter syntax in markdown, or mismatched text alignment properties between the header row and the data rows.

- <strong class="ieu-kw">Identify:</strong> Identify the specific table format being used (e.g., Markdown, HTML, or LaTeX) and locate the alignment rules or delimiter tokens (such as \`:\` in Markdown \`| :--- |\` or \`text-align\` properties in CSS) that govern column widths.
- <strong class="ieu-kw">Evaluate:</strong> Evaluate the structural gap between the header row and the data rows to determine where the width or alignment properties diverge (e.g., evaluating if a specific column header is left-aligned while its data is right-aligned).
- <strong class="ieu-kw">Update:</strong> Update the table structure to enforce consistent alignment rules across both headers and columns, and establish a permanent formatting template to ensure all future tables automatically inherit these alignment standards.`;

  rightOutput = createDiv(defaultMetacog)
    .class('output-content')
    .parent(rightCard);

  let rightFooter = createDiv().class('card-footer').parent(rightCard);
  createDiv('').parent(rightFooter); 
  createButton('Copy Output')
    .class('convert-btn')
    .parent(rightFooter)
    .mousePressed(() => {
      let textToCopy = rightOutput.elt.innerText;
      navigator.clipboard.writeText(textToCopy);
      alert('Copied IEU prompt to clipboard!');
    });
}

function draw() {
  // Left intentionally blank - UI is entirely DOM-based
}

async function rewriteToIEU() {
  let apiKey = apiKeyInput.value().trim();
  let basicPrompt = leftInput.value().trim();
  let selectedModel = agentSelect.value();
  let isAutoThinkingOn = autoThinkingToggle.hasClass('active');

  if (!basicPrompt) {
    alert('Please enter a basic prompt in the left box first.');
    return;
  }

  if (!apiKey) {
    alert('Please paste your Gemini API key in the top bar.');
    return;
  }

  // Inject circular spinners during processing
  generateBtn.html('<span class="loader"></span> Processing...').attribute('disabled', '');
  rightOutput.html('<em>Restructuring into IEU framework...</em>');
  thinkingOutput.html('<div style="display:flex; align-items:center; gap:8px;"><span class="loader loader-dark"></span> Awaiting prompt execution...</div>');

  let promptInstruction = `
    You are an AI prompt rewriting engine using the IEU (Identify, Evaluate, Update) metacognitive framework.
    
    Take this basic user prompt: "${basicPrompt}"

    Before giving your final output, write your internal reasoning steps inside <thinking> tags (analyze the underlying logic gap, heuristic choices, and structural corrections).
    
    After the thinking process, output the refined metacognitive prompt structured with:
    - Context / issue overview
    - **Identify**: Identify the heuristic or rule used for the choice.
    - **Evaluate**: Evaluate the logic gap or flaw.
    - **Update**: Update the permanent rule or system standard moving forward.

    Formatting requirements:
    - Wrap the keywords **Identify**, **Evaluate**, and **Update** with double asterisks so they get highlighted.
  `;

  let url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptInstruction }] }]
      })
    });

    let data = await response.json();

    if (data.error) {
      rightOutput.html(`<span style="color:#FFB4AB">API Error (${data.error.code}): ${data.error.message}</span>`);
      thinkingOutput.html(`Error details: ${data.error.message}`);
    } else if (data.candidates && data.candidates[0].content.parts[0].text) {
      let rawText = data.candidates[0].content.parts[0].text;

      let thinkingMatch = rawText.match(/<thinking>([\s\S]*?)<\/thinking>/i);
      let cleanOutput = rawText;

      if (thinkingMatch && thinkingMatch[1]) {
        if (isAutoThinkingOn) {
          thinkingOutput.html(thinkingMatch[1].trim());
        } else {
          thinkingOutput.html('Auto-thinking is currently turned off.');
        }
        cleanOutput = rawText.replace(/<thinking>[\s\S]*?<\/thinking>/i, '').trim();
      } else {
        thinkingOutput.html('Model processed request successfully without explicit inner monologue tags.');
      }

      let styledText = cleanOutput
        .replace(/\*\*(Identify)\*\*/gi, '<strong class="ieu-kw">Identify</strong>')
        .replace(/\*\*(Evaluate)\*\*/gi, '<strong class="ieu-kw">Evaluate</strong>')
        .replace(/\*\*(Update)\*\*/gi, '<strong class="ieu-kw">Update</strong>')
        .replace(/(Identify:)/gi, '<strong class="ieu-kw">Identify:</strong>')
        .replace(/(Evaluate:)/gi, '<strong class="ieu-kw">Evaluate:</strong>')
        .replace(/(Update:)/gi, '<strong class="ieu-kw">Update:</strong>');

      rightOutput.html(styledText);
    } else {
      rightOutput.html(`<span style="color:#FFB4AB">Unexpected API response format. Check console or API key permissions.</span>`);
      thinkingOutput.html('No candidates returned.');
    }
  } catch (err) {
    rightOutput.html(`<span style="color:#FFB4AB">Network Error: ${err.message}</span>`);
    thinkingOutput.html('Network request failed.');
  } finally {
    generateBtn.html('Transform ➔').removeAttribute('disabled');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background('#B3E19C'); // Lime green
}
