/**
 * AuraCalc — Modern Dynamic Calculator
 * Core Logic & Interactive Experiences
 */

(() => {
  'use strict';

  // --- DOM Elements ---
  const mainDisplay = document.getElementById('mainDisplay');
  const expressionLine = document.getElementById('expressionLine');
  const previewLine = document.getElementById('previewLine');
  const liveIndicator = document.getElementById('liveCalcIndicator');
  const memoryIndicator = document.getElementById('memoryIndicator');
  const copyResultBtn = document.getElementById('copyResultBtn');

  const calculatorCard = document.getElementById('calculatorCard');
  const sciToggleBtn = document.getElementById('sciToggleBtn');
  const scientificPanel = document.getElementById('scientificPanel');
  const degRadBtn = document.getElementById('degRadBtn');
  const modeTag = document.getElementById('modeTag');

  const soundToggle = document.getElementById('soundToggle');
  const iconSoundOn = soundToggle.querySelector('.icon-sound-on');
  const iconSoundOff = soundToggle.querySelector('.icon-sound-off');

  const themeBtn = document.getElementById('themeBtn');
  const themeMenu = document.getElementById('themeMenu');
  const themeOptions = document.querySelectorAll('.theme-opt');

  const historyToggleBtn = document.getElementById('historyToggleBtn');
  const historyDrawer = document.getElementById('historyDrawer');
  const closeHistoryBtn = document.getElementById('closeHistoryBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const historyList = document.getElementById('historyList');

  const shortcutsBtn = document.getElementById('shortcutsBtn');
  const shortcutsModal = document.getElementById('shortcutsModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  const toastNotification = document.getElementById('toastNotification');
  const toastText = document.getElementById('toastText');
  const spotlight = document.getElementById('spotlight');

  // --- State Variables ---
  let expression = '';
  let currentInput = '0';
  let isEvaluated = false;
  let angleMode = 'DEG'; // 'DEG' or 'RAD'
  let memoryValue = 0;
  let hasMemory = false;
  let soundEnabled = true;
  let toastTimeout = null;

  const STORAGE_KEYS = {
    THEME: 'auracalc_theme',
    HISTORY: 'auracalc_history',
    SOUND: 'auracalc_sound',
    MEMORY: 'auracalc_memory',
    ANGLE: 'auracalc_angle'
  };

  let historyItems = [];

  // --- Web Audio API Synthesizer ---
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSound(type = 'click') {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'click') {
        // Crisp tactile click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(820, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.start(now);
        osc.stop(now + 0.035);
      } else if (type === 'operator') {
        // Melodic accent
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1050, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.045);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.start(now);
        osc.stop(now + 0.045);
      } else if (type === 'equal') {
        // Harmonious chord chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.07); // A5
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'clear') {
        // Gentle descending tone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch {
      // Audio errors safely caught
    }
  }

  // --- Toast System ---
  function showToast(message) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastText.textContent = message;
    toastNotification.classList.add('show');
    toastTimeout = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2400);
  }

  // --- Display Update & Dynamic Formatting ---
  function updateDisplay() {
    mainDisplay.textContent = formatDisplayNumber(currentInput);
    expressionLine.textContent = expression;
    adjustDisplayFontSize();
    updateLivePreview();

    // Auto scroll to latest character
    mainDisplay.scrollLeft = mainDisplay.scrollWidth;
    expressionLine.scrollLeft = expressionLine.scrollWidth;
  }

  function formatDisplayNumber(str) {
    if (!str) return '0';
    if (['Error', 'Infinity', '-Infinity', 'NaN'].includes(str)) {
      return str;
    }
    const parts = str.split('.');
    if (!isNaN(parts[0]) && parts[0] !== '') {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    return str;
  }

  function adjustDisplayFontSize() {
    const len = currentInput.length;
    if (len > 16) {
      mainDisplay.style.fontSize = '1.35rem';
    } else if (len > 11) {
      mainDisplay.style.fontSize = '1.75rem';
    } else {
      mainDisplay.style.fontSize = '2.3rem';
    }
  }

  // --- Safe Mathematical Core Engine ---
  function factorial(n) {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n > 170) return Infinity;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  function sanitizeForEvaluation(expr) {
    let s = expr;
    // Replace visual symbols
    s = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');

    // Handle constants
    s = s.replace(/\bpi\b/g, `(${Math.PI})`);
    s = s.replace(/\be\b/g, `(${Math.E})`);

    // Degree vs Radian conversions for trig functions
    const toRad = angleMode === 'DEG' ? `* (${Math.PI} / 180)` : '';
    const toDeg = angleMode === 'DEG' ? `* (180 / ${Math.PI})` : '';

    // Advanced / Scientific functions
    s = s.replace(/asin\(([^)]+)\)/g, `(Math.asin($1)${toDeg})`);
    s = s.replace(/acos\(([^)]+)\)/g, `(Math.acos($1)${toDeg})`);
    s = s.replace(/atan\(([^)]+)\)/g, `(Math.atan($1)${toDeg})`);
    s = s.replace(/sin\(([^)]+)\)/g, `Math.sin(($1)${toRad})`);
    s = s.replace(/cos\(([^)]+)\)/g, `Math.cos(($1)${toRad})`);
    s = s.replace(/tan\(([^)]+)\)/g, `Math.tan(($1)${toRad})`);
    s = s.replace(/sqrt\(([^)]+)\)/g, `Math.sqrt($1)`);
    s = s.replace(/log\(([^)]+)\)/g, `Math.log10($1)`);
    s = s.replace(/ln\(([^)]+)\)/g, `Math.log($1)`);
    s = s.replace(/abs\(([^)]+)\)/g, `Math.abs($1)`);

    // Power operator ^
    s = s.replace(/\^/g, '**');

    // Percentage notation e.g. 50%
    s = s.replace(/(\d+(\.\d+)?)%/g, '($1 * 0.01)');

    // Factorials e.g. 5!
    s = s.replace(/(\d+)!/g, 'factorial($1)');

    return s;
  }

  function evaluateExpression(rawExpr) {
    if (!rawExpr || rawExpr.trim() === '') return '0';

    try {
      // Auto-close any unclosed parentheses
      let openParenCount = (rawExpr.match(/\(/g) || []).length;
      let closeParenCount = (rawExpr.match(/\)/g) || []).length;
      let exprToEval = rawExpr;
      while (openParenCount > closeParenCount) {
        exprToEval += ')';
        closeParenCount++;
      }

      const sanitized = sanitizeForEvaluation(exprToEval);

      // Evaluate safely inside isolated Function sandbox
      const evalFunc = new Function('factorial', `
        "use strict";
        return (${sanitized});
      `);

      const result = evalFunc(factorial);

      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        return 'Error';
      }

      // Precision rounding to avoid 0.0000000000000001 floating point issues
      const rounded = Math.round(result * 1e12) / 1e12;
      return rounded.toString();
    } catch {
      return 'Error';
    }
  }

  // --- Real-time Ghost Preview ---
  function updateLivePreview() {
    const testExpr = expression ? (isOperator(expression.trim().slice(-1)) ? expression + currentInput : expression) : currentInput;
    if (!testExpr || testExpr === currentInput || isEvaluated) {
      previewLine.textContent = '';
      liveIndicator.style.opacity = '0';
      return;
    }

    const previewResult = evaluateExpression(testExpr);
    if (previewResult !== 'Error' && previewResult !== currentInput) {
      previewLine.textContent = `= ${formatDisplayNumber(previewResult)}`;
      liveIndicator.style.opacity = '1';
    } else {
      previewLine.textContent = '';
      liveIndicator.style.opacity = '0';
    }
  }

  function isOperator(ch) {
    return ['+', '-', '*', '/', '^', '%', '×', '÷', '−'].includes(ch);
  }

  // --- Input Handlers ---
  function inputDigit(digit) {
    playSound('click');
    if (isEvaluated) {
      currentInput = digit;
      expression = '';
      isEvaluated = false;
    } else {
      if (currentInput === '0' || currentInput === 'Error') {
        currentInput = digit;
      } else {
        currentInput += digit;
      }
    }
    updateDisplay();
  }

  function inputDecimal() {
    playSound('click');
    if (isEvaluated) {
      currentInput = '0.';
      expression = '';
      isEvaluated = false;
    } else {
      if (!currentInput.includes('.')) {
        currentInput += '.';
      }
    }
    updateDisplay();
  }

  function handleOperator(op) {
    playSound('operator');
    let visualOp = op;
    if (op === '*') visualOp = '×';
    else if (op === '/') visualOp = '÷';
    else if (op === '-') visualOp = '−';

    if (currentInput === 'Error') {
      clearAll();
      return;
    }

    if (isEvaluated) {
      expression = currentInput + ' ' + visualOp + ' ';
      isEvaluated = false;
    } else {
      if (expression !== '' && isOperator(expression.trim().slice(-1)) && currentInput === '0') {
        // Swap operator if user clicked another without typing digit
        expression = expression.trim().slice(0, -1) + visualOp + ' ';
      } else {
        expression += currentInput + ' ' + visualOp + ' ';
      }
    }

    currentInput = '0';
    updateDisplay();
  }

  function handlePercentage() {
    playSound('operator');
    if (currentInput === 'Error') return;
    const num = parseFloat(currentInput);
    if (!isNaN(num)) {
      currentInput = (num / 100).toString();
      updateDisplay();
    }
  }

  function handleParenthesis(parenChar) {
    playSound('click');
    if (isEvaluated) {
      expression = parenChar;
      currentInput = '0';
      isEvaluated = false;
    } else {
      if (parenChar === '(') {
        if (currentInput === '0') {
          expression += '(';
        } else {
          expression += currentInput + ' × (';
        }
        currentInput = '0';
      } else {
        // Close parenthesis ')'
        expression += currentInput + ') ';
        currentInput = '0';
      }
    }
    updateDisplay();
  }

  function handleEquals() {
    if (currentInput === 'Error') return;

    let fullExpr = expression + currentInput;
    if (!fullExpr || fullExpr.trim() === '') return;

    playSound('equal');

    const result = evaluateExpression(fullExpr);

    if (result !== 'Error') {
      addToHistory(fullExpr, result);
    }

    expression = fullExpr + ' =';
    currentInput = result;
    isEvaluated = true;
    updateDisplay();
  }

  function clearAll() {
    playSound('clear');
    expression = '';
    currentInput = '0';
    isEvaluated = false;
    updateDisplay();
  }

  function handleBackspace() {
    playSound('click');
    if (isEvaluated) {
      clearAll();
      return;
    }
    if (currentInput.length > 1) {
      currentInput = currentInput.slice(0, -1);
    } else {
      currentInput = '0';
    }
    updateDisplay();
  }

  function toggleNegate() {
    playSound('click');
    if (currentInput === '0' || currentInput === 'Error') return;
    if (currentInput.startsWith('-')) {
      currentInput = currentInput.substring(1);
    } else {
      currentInput = '-' + currentInput;
    }
    updateDisplay();
  }

  // --- Scientific Functions ---
  function handleSciFunction(funcName) {
    playSound('operator');
    const num = parseFloat(currentInput);

    if (funcName === 'square') {
      if (!isNaN(num)) {
        currentInput = (num * num).toString();
      }
    } else if (funcName === 'inverse') {
      if (num === 0) {
        currentInput = 'Error';
      } else {
        currentInput = (1 / num).toString();
      }
    } else if (funcName === 'factorial') {
      const res = factorial(num);
      currentInput = isNaN(res) ? 'Error' : res.toString();
    } else if (funcName === 'abs') {
      currentInput = Math.abs(num).toString();
    } else if (funcName === 'tenPower') {
      currentInput = Math.pow(10, num).toString();
    } else {
      // Direct functional expression e.g. sin(
      if (isEvaluated) {
        expression = `${funcName}(`;
        currentInput = '0';
        isEvaluated = false;
      } else {
        expression += `${funcName}(`;
        currentInput = '0';
      }
    }
    updateDisplay();
  }

  function handleConstant(name) {
    playSound('click');
    if (name === 'pi') {
      currentInput = Math.PI.toString();
    } else if (name === 'e') {
      currentInput = Math.E.toString();
    }
    isEvaluated = false;
    updateDisplay();
  }

  // --- Memory Operations ---
  function handleMemory(action) {
    playSound('click');
    const val = parseFloat(currentInput) || 0;

    switch (action) {
      case 'mem-clear':
        memoryValue = 0;
        hasMemory = false;
        showToast('Memory Cleared (MC)');
        break;
      case 'mem-recall':
        if (hasMemory) {
          currentInput = memoryValue.toString();
          isEvaluated = false;
          showToast(`Recalled: ${memoryValue}`);
        } else {
          showToast('Memory is empty');
        }
        break;
      case 'mem-plus':
        memoryValue += val;
        hasMemory = true;
        showToast(`M+ (${memoryValue})`);
        break;
      case 'mem-minus':
        memoryValue -= val;
        hasMemory = true;
        showToast(`M- (${memoryValue})`);
        break;
    }

    if (hasMemory) {
      memoryIndicator.classList.remove('hidden');
    } else {
      memoryIndicator.classList.add('hidden');
    }
    localStorage.setItem(STORAGE_KEYS.MEMORY, JSON.stringify({ memoryValue, hasMemory }));
    updateDisplay();
  }

  // --- History System ---
  function loadHistory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      historyItems = saved ? JSON.parse(saved) : [];
      renderHistory();
    } catch {
      historyItems = [];
    }
  }

  function addToHistory(expr, result) {
    const item = {
      expr,
      result,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    historyItems.unshift(item);
    if (historyItems.length > 50) historyItems.pop();
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyItems));
    renderHistory();
  }

  function renderHistory() {
    if (historyItems.length === 0) {
      historyList.innerHTML = `
        <div class="history-empty">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
          </svg>
          <p>No calculations yet</p>
          <span class="subtext">Your completed calculations will appear here. Click one to reload it!</span>
        </div>
      `;
      return;
    }

    historyList.innerHTML = '';
    historyItems.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <span class="hist-time">${item.timestamp}</span>
        <div class="hist-exp">${escapeHtml(item.expr)} =</div>
        <div class="hist-result">${escapeHtml(item.result)}</div>
      `;
      div.addEventListener('click', () => {
        playSound('click');
        currentInput = item.result;
        expression = item.expr;
        isEvaluated = true;
        updateDisplay();
        showToast('Restored from history');
        historyDrawer.classList.remove('open');
      });
      historyList.appendChild(div);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Button Tactile Ripple Feedback ---
  function createRipple(e, btn) {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    const clientX = e.clientX || rect.left + rect.width / 2;
    const clientY = e.clientY || rect.top + rect.height / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${clientX - rect.left - radius}px`;
    ripple.style.top = `${clientY - rect.top - radius}px`;

    btn.appendChild(ripple);
    setTimeout(() => {
      ripple.remove();
    }, 550);
  }

  // --- Theme Management ---
  function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    themeOptions.forEach(opt => {
      if (opt.getAttribute('data-theme-val') === theme) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  // --- Copy & Paste Handlers ---
  async function copyCurrentResult() {
    try {
      await navigator.clipboard.writeText(currentInput);
      playSound('click');
      showToast('Copied to clipboard!');
    } catch {
      // Fallback execCommand
      const textarea = document.createElement('textarea');
      textarea.value = currentInput;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('Copied to clipboard!');
    }
  }

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.trim();
      if (!isNaN(cleaned) && cleaned !== '') {
        currentInput = cleaned;
        isEvaluated = false;
        updateDisplay();
        playSound('click');
        showToast(`Pasted: ${cleaned}`);
      }
    } catch {
      // Clipboard read permissions may be restricted
    }
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Keypad Click Delegation
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.calc-btn');
      if (!btn) return;

      createRipple(e, btn);

      const action = btn.dataset.action;
      const val = btn.dataset.val;

      switch (action) {
        case 'num':
          inputDigit(val);
          break;
        case 'decimal':
          inputDecimal();
          break;
        case 'operator':
          handleOperator(val);
          break;
        case 'percent':
          handlePercentage();
          break;
        case 'paren':
          handleParenthesis(val);
          break;
        case 'equals':
          handleEquals();
          break;
        case 'clear':
          clearAll();
          break;
        case 'backspace':
          handleBackspace();
          break;
        case 'negate':
          toggleNegate();
          break;
        case 'func':
          handleSciFunction(val);
          break;
        case 'constant':
          handleConstant(val);
          break;
      }
    });

    // Auxiliary Strip (Scientific drawer, Angle toggle, Memory)
    document.querySelector('.aux-strip').addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;

      const action = btn.dataset.action;
      if (action === 'toggle-sci') {
        const isCollapsed = scientificPanel.classList.toggle('collapsed');
        btn.classList.toggle('active', !isCollapsed);
        calculatorCard.classList.toggle('sci-expanded', !isCollapsed);
        playSound('click');
      } else if (action === 'toggle-angle') {
        angleMode = angleMode === 'DEG' ? 'RAD' : 'DEG';
        degRadBtn.textContent = angleMode;
        modeTag.textContent = angleMode;
        localStorage.setItem(STORAGE_KEYS.ANGLE, angleMode);
        playSound('click');
        showToast(`Angle mode: ${angleMode}`);
        updateLivePreview();
      } else if (action.startsWith('mem-')) {
        handleMemory(action);
      }
    });

    // Copy Result Button
    copyResultBtn.addEventListener('click', copyCurrentResult);

    // Sound Toggle
    soundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      iconSoundOn.classList.toggle('hidden', !soundEnabled);
      iconSoundOff.classList.toggle('hidden', soundEnabled);
      localStorage.setItem(STORAGE_KEYS.SOUND, soundEnabled);
      showToast(soundEnabled ? 'Sound enabled' : 'Sound muted');
      if (soundEnabled) playSound('click');
    });

    // Theme Menu Trigger
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!themeMenu.contains(e.target) && e.target !== themeBtn) {
        themeMenu.classList.remove('show');
      }
    });

    themeOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        const theme = opt.getAttribute('data-theme-val');
        setTheme(theme);
        themeMenu.classList.remove('show');
        playSound('click');
      });
    });

    // History Toggle & Actions
    historyToggleBtn.addEventListener('click', () => {
      historyDrawer.classList.toggle('open');
      playSound('click');
    });

    closeHistoryBtn.addEventListener('click', () => {
      historyDrawer.classList.remove('open');
    });

    clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Clear all calculation history?')) {
        historyItems = [];
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
        renderHistory();
        playSound('clear');
        showToast('History cleared');
      }
    });

    // Keyboard Shortcuts Modal
    shortcutsBtn.addEventListener('click', () => {
      shortcutsModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
      shortcutsModal.classList.add('hidden');
    });

    shortcutsModal.addEventListener('click', (e) => {
      if (e.target === shortcutsModal) {
        shortcutsModal.classList.add('hidden');
      }
    });

    // Keyboard input handling with visual feedback on button
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key;

      // Copy / Paste Shortcuts
      if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 'c') {
        copyCurrentResult();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 'v') {
        pasteFromClipboard();
        return;
      }

      // Close modal / history on Escape
      if (key === 'Escape') {
        if (!shortcutsModal.classList.contains('hidden')) {
          shortcutsModal.classList.add('hidden');
          return;
        }
        if (historyDrawer.classList.contains('open')) {
          historyDrawer.classList.remove('open');
          return;
        }
        clearAll();
        return;
      }

      // Help Modal
      if (key === '?') {
        shortcutsModal.classList.toggle('hidden');
        return;
      }

      // History Toggle
      if (key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey) {
        historyDrawer.classList.toggle('open');
        return;
      }

      // Highlight corresponding key button
      highlightKey(key);

      if (key >= '0' && key <= '9') {
        inputDigit(key);
      } else if (key === '.' || key === ',') {
        inputDecimal();
      } else if (['+', '-', '*', '/'].includes(key)) {
        handleOperator(key);
      } else if (key === '%') {
        handlePercentage();
      } else if (key === '^') {
        handleOperator('^');
      } else if (key === '(' || key === ')') {
        handleParenthesis(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Backspace') {
        handleBackspace();
      } else if (key === 'Delete') {
        clearAll();
      } else if (key.toLowerCase() === 's' && !e.ctrlKey) {
        handleSciFunction('sin');
      } else if (key.toLowerCase() === 't' && !e.ctrlKey) {
        handleSciFunction('tan');
      }
    });

    // Dynamic Spotlight following cursor
    window.addEventListener('pointermove', (e) => {
      if (spotlight) {
        spotlight.style.left = `${e.clientX}px`;
        spotlight.style.top = `${e.clientY}px`;
      }
    });
  }

  // Visual button keypress flash
  function highlightKey(key) {
    let selector = `[data-key="${key}"]`;
    if (key === 'Enter') selector = `[data-action="equals"]`;
    if (key === 'Escape' || key === 'Delete') selector = `[data-action="clear"]`;

    const btn = document.querySelector(selector);
    if (btn) {
      btn.classList.add('key-pressed');
      setTimeout(() => {
        btn.classList.remove('key-pressed');
      }, 140);
    }
  }

  // --- Initializer ---
  function init() {
    // Restore saved settings
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    setTheme(savedTheme);

    const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND);
    if (savedSound !== null) {
      soundEnabled = savedSound === 'true';
      iconSoundOn.classList.toggle('hidden', !soundEnabled);
      iconSoundOff.classList.toggle('hidden', soundEnabled);
    }

    const savedAngle = localStorage.getItem(STORAGE_KEYS.ANGLE);
    if (savedAngle) {
      angleMode = savedAngle;
      degRadBtn.textContent = angleMode;
      modeTag.textContent = angleMode;
    }

    try {
      const savedMem = localStorage.getItem(STORAGE_KEYS.MEMORY);
      if (savedMem) {
        const memObj = JSON.parse(savedMem);
        memoryValue = memObj.memoryValue || 0;
        hasMemory = memObj.hasMemory || false;
        if (hasMemory) memoryIndicator.classList.remove('hidden');
      }
    } catch {
      // Ignored
    }

    loadHistory();
    setupEventListeners();
    updateDisplay();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
