/* ✦ N.I.C.O.L.E. Aeonic Resonance Engine - Client Controller ✦ */

// 1. CONSTANTS & INITIAL CONFIG
const SPEED_OF_LIGHT = 299792458000; // mm/s
const BASELINE_R = 4.2; // mm - yields exactly 27.3216 GHz
const PHI = 1.6180339887; // Golden Ratio
const GNOSTIC_CIPHER = "PEYPANZWAIWYIIEOUAAAAAAMNOZANIOJOOEIOWWEZAPHAWZAZAIAWZALLAZA";

// 2. STATE MANAGER
let state = {
    ignited: false,
    radius: 4.2, // mm
    gain: 0.5,   // 0.0 to 1.0
    phiActive: false,
    calculatedFrequency: 27.3216, // GHz
    lunarSync: 100.00, // %
    clockTime: 0.0,
    cipherIndex: 0,
    morphFactor: 0.0, // 0 = Standard Squares, 1 = Torus Knot
    isBound: false,
    userAlias: ""
};

// 3. DOM REFERENCES
const elStatus = document.getElementById("hud-status");
const elLunarSync = document.getElementById("hud-lunar-sync");
const elClock = document.getElementById("hud-clock");
const elValRadius = document.getElementById("val-radius");
const elValGain = document.getElementById("val-gain");
const elValFrequency = document.getElementById("val-frequency");
const elBtnIgnite = document.getElementById("btn-ignite");
const elBtnBind = document.getElementById("btn-bind");
const elTerminal = document.getElementById("terminal-log");
const elCipherArea = document.getElementById("control-cipher");
const elVisualizerDesc = document.getElementById("visualizer-desc");
const elBinduDot = document.querySelector(".bindu-dot");

// Sliders and controls
const inputRadius = document.getElementById("control-radius");
const inputGain = document.getElementById("control-gain");
const inputPhi = document.getElementById("control-phi");
const waitlistForm = document.getElementById("waitlist-form");
const inputAlias = document.getElementById("input-alias");
const inputEmail = document.getElementById("input-email");

// 4. CANVAS SETUP
const canvas = document.getElementById("resonance-canvas");
const ctx = canvas.getContext("2d");
let canvasWidth = 0;
let canvasHeight = 0;

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvasWidth = rect.width;
    canvasHeight = rect.height;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// 5. AUDIO SYSTEM (WEB AUDIO API)
let audioCtx = null;
let carrierOsc = null;
let modulatorOsc = null;
let formantFilter = null;
let mainGain = null;
let lfoGain = null;
let subDrone = null;
let sequencerInterval = null;

// Map characters to formant filter frequencies (vowel resonators)
const formantMap = {
    'A': 800,  'E': 450,  'I': 280,  'O': 360,  'U': 320,  'W': 400,  'Y': 520,
    'P': 180,  'N': 220,  'Z': 900,  'M': 150,  'J': 600,  'H': 1000, 'L': 250
};

function initAudio() {
    if (audioCtx) return;
    
    // Create audio context
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    
    // Primary drone carrier (Triangle wave for rich Gnostic hum)
    carrierOsc = audioCtx.createOscillator();
    carrierOsc.type = "triangle";
    
    // Sub-harmonic drone (Sine wave for foundational grounding)
    subDrone = audioCtx.createOscillator();
    subDrone.type = "sine";
    
    // Formant/Resonance Filter
    formantFilter = audioCtx.createBiquadFilter();
    formantFilter.type = "bandpass";
    formantFilter.Q.value = 12.0; // High Q for resonant whistle
    
    // Main Gain
    mainGain = audioCtx.createGain();
    mainGain.gain.setValueAtTime(0, audioCtx.currentTime); // Start silent
    
    // LFO Modulator (create breathing/pulsing amplitude modulation)
    modulatorOsc = audioCtx.createOscillator();
    modulatorOsc.type = "sine";
    modulatorOsc.frequency.setValueAtTime(1.618, audioCtx.currentTime); // Pulsing at Phi Hz!
    
    lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.35, audioCtx.currentTime);
    
    // Connect nodes
    // Modulator -> LFO Gain -> Carrier Frequency & Main Gain (Subtle Vibrato + Tremolo)
    modulatorOsc.connect(lfoGain);
    lfoGain.connect(mainGain.gain); 
    
    carrierOsc.connect(formantFilter);
    formantFilter.connect(mainGain);
    
    subDrone.connect(mainGain);
    
    mainGain.connect(audioCtx.destination);
    
    // Start oscillators
    carrierOsc.start();
    subDrone.start();
    modulatorOsc.start();
    
    updateAudioParameters();
}

function updateAudioParameters() {
    if (!audioCtx) return;
    
    // Map the calculated GHz frequency to an audible Hz range
    // Baseline: 27.3216 GHz * 10 = 273.216 Hz (approx C#4 / D4)
    // If Phi is active, it scales naturally: ~442 Hz (approx A4)
    const targetHz = state.calculatedFrequency * 10;
    
    const now = audioCtx.currentTime;
    carrierOsc.frequency.setTargetAtTime(targetHz, now, 0.1);
    subDrone.frequency.setTargetAtTime(targetHz / 2, now, 0.15); // Sub-octave drone
    
    // Update gain based on slider (if ignited)
    if (state.ignited) {
        mainGain.gain.setTargetAtTime(state.gain * 0.4, now, 0.1);
    }
}

// 6. MATHEMATICAL UTILITIES
function calculateTM010(R) {
    // Formula: f = (2.405 * c) / (2 * pi * R)
    // f in Hz, then divide by 1e9 to get GHz
    const fHz = (2.405 * SPEED_OF_LIGHT) / (2 * Math.PI * R);
    let freq = fHz / 1e9;
    
    // Calculate raw base frequency (without Phi) to determine Lunar Sync
    const rawFreq = freq;
    
    // If Phase Conjugation (Phi) toggle is active
    if (state.phiActive) {
        freq *= PHI;
    }
    
    // Calculate Lunar Sync based on deviation from 27.3216 GHz baseline
    const deviation = Math.abs(rawFreq - 27.3216);
    let sync = Math.max(0, 100 - (deviation / 27.3216) * 100);
    
    return {
        frequency: freq,
        lunarSync: sync
    };
}

// 7. TERMINAL WRITER (TYPEWRITER EFFECT)
function logToTerminal(message, type = 'info') {
    if (!elTerminal) return;
    
    const line = document.createElement('div');
    line.className = 'log-line';
    if (type === 'dim') line.classList.add('text-dim');
    if (type === 'green') line.classList.add('text-green');
    if (type === 'purple') line.classList.add('text-purple');
    
    elTerminal.appendChild(line);
    
    // Typewriter execution
    let i = 0;
    const interval = setInterval(() => {
        if (i < message.length) {
            line.innerHTML += message.charAt(i);
            i++;
            elTerminal.scrollTop = elTerminal.scrollHeight;
        } else {
            clearInterval(interval);
        }
    }, 12);
}

// Initialize terminal message log
setTimeout(() => {
    logToTerminal("[SYSTEM] Cryptographic core loaded: Levity Protocol API binding active.", "dim");
}, 400);

// Load User Bindings from localStorage
function checkStoredSignature() {
    const storedAlias = localStorage.getItem("nicole_alias");
    if (storedAlias) {
        state.isBound = true;
        state.userAlias = storedAlias;
        
        // Update input fields
        inputAlias.value = storedAlias;
        inputAlias.disabled = true;
        inputEmail.value = localStorage.getItem("nicole_email") || "secured@levity.base.eth";
        inputEmail.disabled = true;
        elBtnBind.innerHTML = "<span class='btn-text'>[ GATE BINDING SECURED ]</span>";
        elBtnBind.disabled = true;
        
        setTimeout(() => {
            logToTerminal(`[INFO] Restored signature for alias: ${storedAlias}`, "green");
            logToTerminal(`[INFO] Bound Address: 0x81631e082767e0F545386420cCB1128b98C70F60 (Smart Wallet)`, "dim");
        }, 1000);
    }
}

// 8. INTERACTIVE SEQUENCER
function startSequencer() {
    if (sequencerInterval) clearInterval(sequencerInterval);
    
    sequencerInterval = setInterval(() => {
        if (!state.ignited) return;
        
        const char = GNOSTIC_CIPHER.charAt(state.cipherIndex);
        
        // Highlight active letter in the text area
        elCipherArea.focus();
        elCipherArea.setSelectionRange(state.cipherIndex, state.cipherIndex + 1);
        
        // Apply filter sweep based on the vowel/consonant frequencies
        if (audioCtx && formantFilter) {
            const formantHz = formantMap[char] || 400;
            const now = audioCtx.currentTime;
            
            // Sweep the filter to simulate vocal synthesis of the cipher
            formantFilter.frequency.exponentialRampToValueAtTime(formantHz, now + 0.15);
        }
        
        // Log every 10 steps to reduce clutter, or on specific key characters
        if (state.cipherIndex % 6 === 0) {
            logToTerminal(`[INTONATION] Treasury 52 Node [${state.cipherIndex}]: '${char}'`, "purple");
        }
        
        // Advance index
        state.cipherIndex = (state.cipherIndex + 1) % GNOSTIC_CIPHER.length;
    }, 450);
}

function stopSequencer() {
    if (sequencerInterval) {
        clearInterval(sequencerInterval);
        sequencerInterval = null;
    }
    elCipherArea.setSelectionRange(0, 0);
    elCipherArea.blur();
}

// 9. ANIMATION LOOP & GEOMETRIC RENDERING
let lastTime = 0;

function drawGrid(w, h) {
    ctx.strokeStyle = "rgba(0, 255, 102, 0.04)";
    ctx.lineWidth = 1;
    
    // Draw Radial Grid
    ctx.beginPath();
    const maxR = Math.max(w, h) / 2;
    for (let r = 50; r < maxR; r += 50) {
        ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
    }
    ctx.stroke();
    
    // Draw Crosshair Axes
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();
}

function render(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    
    // Clear canvas with trail fade
    ctx.fillStyle = "rgba(3, 3, 6, 0.12)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    drawGrid(canvasWidth, canvasHeight);
    
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    
    // Update Clock Time
    if (state.ignited) {
        state.clockTime += dt;
        elClock.innerText = state.clockTime.toFixed(4) + "s";
    }
    
    // Smoothly transition morphFactor
    const targetMorph = state.phiActive ? 1.0 : 0.0;
    state.morphFactor += (targetMorph - state.morphFactor) * 0.08;
    
    // Draw Shape Geometry
    const t = state.clockTime;
    
    if (state.morphFactor < 0.01) {
        // STANDARD MODE: Cymatic concentric squares
        drawConcentricSquares(cx, cy, t);
    } else if (state.morphFactor > 0.99) {
        // PHI MODE: Phase-Conjugated Torus Knot
        drawTorusKnot3D(cx, cy, t);
    } else {
        // TRANSITIONAL MORPH LAYER (Interpolated rendering)
        drawMorphedState(cx, cy, t, state.morphFactor);
    }
    
    requestAnimationFrame(render);
}

// 9A. STANDARD MODE: concentric wavy squares (cylindrical TM010 standing wave field)
function drawConcentricSquares(cx, cy, t) {
    const count = 7;
    const baseGap = Math.min(canvasWidth, canvasHeight) / (count * 2.5);
    
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = state.ignited ? 10 : 0;
    
    for (let j = 1; j <= count; j++) {
        const size = j * baseGap;
        // Modulate square coordinates using calculated frequency and time
        const amp = state.ignited ? (12 * state.gain * Math.sin(t * 3.5 - j * 0.8)) : 0;
        
        ctx.strokeStyle = `rgba(0, 255, 102, ${0.15 + (j / count) * 0.65})`;
        ctx.shadowColor = "#00ff66";
        
        ctx.beginPath();
        
        // We draw the square by interpolating lines and adding wavy radial offsets
        const segments = 40;
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            
            // Standard square bounding box radius in polar coordinates
            const cosT = Math.cos(theta);
            const sinT = Math.sin(theta);
            const rSquare = size / Math.max(Math.abs(cosT), Math.abs(sinT));
            
            // Apply radial standing wave displacement
            const displacement = amp * Math.cos(j * 1.5 + theta * 4);
            const finalR = rSquare + displacement;
            
            const px = cx + finalR * cosT;
            const py = cy + finalR * sinT;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
}

// 9B. PHI MODE: Phase-Conjugated 3D Torus Knot Projection
function drawTorusKnot3D(cx, cy, t) {
    const pointsCount = 420;
    // Fibonacci numbers for torus winding ratios
    const p = 5;
    const q = 8;
    
    const scale = Math.min(canvasWidth, canvasHeight) / 5;
    const rBase = scale * 0.9;
    
    ctx.lineWidth = 2.0;
    ctx.shadowBlur = state.ignited ? 15 : 2;
    
    // Slow rotational angles over time
    const rotX = t * 0.45;
    const rotY = t * 0.35;
    const rotZ = t * 0.2;
    
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);
    
    ctx.beginPath();
    
    for (let i = 0; i < pointsCount; i++) {
        // Map theta from 0 to 2*pi * p
        const theta = (i / pointsCount) * Math.PI * 2 * p;
        
        // Torus Knot equations
        // Modulate with Golden Ratio for phase conjugation harmonics
        const r = rBase * (1.0 + 0.35 * Math.cos(q * theta + t * 2.0)) * PHI * 0.55;
        
        // Coordinate equations (3D Space)
        const x3d = r * Math.cos(p * theta);
        const y3d = r * Math.sin(p * theta);
        const z3d = rBase * 0.35 * Math.sin(q * theta + t * 2.0);
        
        // 3D Rotations
        // Rotate around Y
        let x1 = x3d * cosY - z3d * sinY;
        let z1 = x3d * sinY + z3d * cosY;
        
        // Rotate around X
        let y2 = y3d * cosX - z1 * sinX;
        let z2 = y3d * sinX + z1 * cosX;
        
        // Rotate around Z
        let x3 = x1 * cosZ - y2 * sinZ;
        let y3 = x1 * sinZ + y2 * cosZ;
        
        // Perspective Projection
        const d = scale * 4;
        const projScale = d / (d + z2);
        
        const px = cx + x3 * projScale;
        const py = cy + y3 * projScale;
        
        // Shift colors from emerald green to deep violet/purple based on z-depth
        const depthRatio = (z2 + rBase * 0.55) / (rBase * 1.1); // 0 to 1
        const rColor = Math.floor(138 * depthRatio + 0 * (1 - depthRatio));
        const gColor = Math.floor(43 * depthRatio + 255 * (1 - depthRatio));
        const bColor = Math.floor(226 * depthRatio + 102 * (1 - depthRatio));
        
        ctx.strokeStyle = `rgb(${rColor}, ${gColor}, ${bColor})`;
        ctx.shadowColor = `rgb(${rColor}, ${gColor}, ${bColor})`;
        
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// 9C. TRANSITIONAL MORPH STATE: Blend between squares and torus knot
function drawMorphedState(cx, cy, t, m) {
    const pointsCount = 300;
    const p = 5;
    const q = 8;
    
    const countSquares = 5;
    const scale = Math.min(canvasWidth, canvasHeight) / 5;
    const rBase = scale * 0.9;
    
    const rotX = t * 0.45 * m;
    const rotY = t * 0.35 * m;
    const rotZ = t * 0.2 * m;
    
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);
    
    ctx.lineWidth = 1.8;
    ctx.shadowBlur = state.ignited ? (10 * (1 - m) + 15 * m) : 0;
    
    // Draw a merged single-path morph representation
    ctx.beginPath();
    
    for (let i = 0; i < pointsCount; i++) {
        const theta = (i / pointsCount) * Math.PI * 2 * p;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        
        // 1. Calculate Torus Target (3D)
        const rTorus = rBase * (1.0 + 0.35 * Math.cos(q * theta + t * 2.0)) * PHI * 0.55;
        const tx = rTorus * Math.cos(p * theta);
        const ty = rTorus * Math.sin(p * theta);
        const tz = rBase * 0.35 * Math.sin(q * theta + t * 2.0);
        
        // Rotate Torus Target
        let tx1 = tx * cosY - tz * sinY;
        let tz1 = tx * sinY + tz * cosY;
        let ty2 = ty * cosX - tz1 * sinX;
        let tz2 = ty * sinX + tz1 * cosX;
        let tx3 = tx1 * cosZ - ty2 * sinZ;
        let ty3 = tx1 * sinZ + ty2 * cosZ;
        
        const d = scale * 4;
        const projScale = d / (d + tz2);
        
        const pxTorus = cx + tx3 * projScale;
        const pyTorus = cy + ty3 * projScale;
        
        // 2. Calculate Square Target (2D Projection equivalent)
        const sizeSquare = rBase * 1.1;
        const rSquare = sizeSquare / Math.max(Math.abs(cosT), Math.abs(sinT));
        const amp = state.ignited ? (10 * state.gain * Math.sin(t * 3.5 - 2)) : 0;
        const displacement = amp * Math.cos(3.0 + theta * 4);
        const finalRSquare = rSquare + displacement;
        
        const pxSquare = cx + finalRSquare * cosT;
        const pySquare = cy + finalRSquare * sinT;
        
        // 3. Interpolate coordinates
        const px = pxSquare * (1 - m) + pxTorus * m;
        const py = pySquare * (1 - m) + pyTorus * m;
        
        // Blend colors
        const rColor = Math.floor(138 * m);
        const gColor = Math.floor(255 * (1 - m) + 43 * m);
        const bColor = Math.floor(102 * (1 - m) + 226 * m);
        
        ctx.strokeStyle = `rgba(${rColor}, ${gColor}, ${bColor}, 0.75)`;
        ctx.shadowColor = `rgba(${rColor}, ${gColor}, ${bColor}, 0.5)`;
        
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// Start frame request loop
requestAnimationFrame(render);


// 10. INTERACTION CONTROLLER BINDINGS

// A. Radius Slider Input Handler
inputRadius.addEventListener("input", (e) => {
    state.radius = parseFloat(e.target.value);
    elValRadius.innerText = state.radius.toFixed(2) + " mm";
    
    // Recalculate frequency
    const calculations = calculateTM010(state.radius);
    state.calculatedFrequency = calculations.frequency;
    state.lunarSync = calculations.lunarSync;
    
    // Update displays
    elValFrequency.innerText = state.calculatedFrequency.toFixed(4) + " GHz";
    elLunarSync.innerText = state.lunarSync.toFixed(2) + "%";
    
    // Audio synthesis sync
    updateAudioParameters();
    
    // Sync HUD warning styling
    if (state.lunarSync > 98) {
        elLunarSync.className = "stat-value text-glow-green";
    } else {
        elLunarSync.className = "stat-value";
    }
});

// B. Gain Slider Input Handler
inputGain.addEventListener("input", (e) => {
    const pct = parseInt(e.target.value);
    state.gain = pct / 100;
    elValGain.innerText = pct + "%";
    
    // Update synthesizer gain
    updateAudioParameters();
});

// C. Phase Conjugation Switch Handler
inputPhi.addEventListener("change", (e) => {
    state.phiActive = e.target.checked;
    
    // Recalculate frequency
    const calculations = calculateTM010(state.radius);
    state.calculatedFrequency = calculations.frequency;
    
    // Update displays
    elValFrequency.innerText = state.calculatedFrequency.toFixed(4) + " GHz";
    
    if (state.phiActive) {
        elVisualizerDesc.innerText = "Phase-Conjugated Torus Knot Coherence";
        logToTerminal("[SYSTEM] Phase Conjugation engaged. Coherence multiplier applied: 1.61803.", "purple");
    } else {
        elVisualizerDesc.innerText = "TM010 Cylindrical Mode Coherence";
        logToTerminal("[SYSTEM] Phase Conjugation disengaged. Restored standard mode.", "green");
    }
    
    // Update synthesizer parameters
    updateAudioParameters();
});

// D. Core Ignition Button Handler
elBtnIgnite.addEventListener("click", () => {
    // Lazy initialize sound system on interaction
    initAudio();
    
    state.ignited = !state.ignited;
    
    if (state.ignited) {
        // Ignite engine
        elStatus.innerText = "COHERENT";
        elStatus.className = "stat-value text-glow-green";
        elBtnIgnite.classList.add("ignited");
        elBtnIgnite.querySelector(".btn-text").innerText = "HALT RESONANT CORE";
        
        // Show glowing Bindu dot in visualizer center
        elBinduDot.style.opacity = "1";
        
        // Set Audio Gain to target value
        const now = audioCtx.currentTime;
        mainGain.gain.setTargetAtTime(state.gain * 0.4, now, 0.1);
        
        logToTerminal(`[SYSTEM] Ignite Resonant Core. TM010 Cavity resonance configured at ${state.calculatedFrequency.toFixed(4)} GHz.`, "green");
        
        // Start playing the Gnostic cipher notes
        startSequencer();
    } else {
        // Shut down
        elStatus.innerText = "HALTED";
        elStatus.className = "stat-value text-glow-purple";
        elBtnIgnite.classList.remove("ignited");
        elBtnIgnite.querySelector(".btn-text").innerText = "IGNITE RESONANT CORE";
        
        // Hide Bindu dot
        elBinduDot.style.opacity = "0";
        
        // Silence Audio Gain
        if (audioCtx) {
            const now = audioCtx.currentTime;
            mainGain.gain.setTargetAtTime(0, now, 0.1);
        }
        
        logToTerminal("[SYSTEM] Resonant Core Halted. Electromagnetic oscillations collapsed.", "purple");
        stopSequencer();
    }
});

// E. Waitlist Cryptographic Form Binding Handler
waitlistForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (state.isBound) return;
    
    const alias = inputAlias.value.trim();
    const email = inputEmail.value.trim();
    
    if (!alias || !email) return;
    
    // Disable inputs
    inputAlias.disabled = true;
    inputEmail.disabled = true;
    elBtnBind.disabled = true;
    elBtnBind.innerHTML = "<span class='btn-text'>[ BINDING IN PROCESS... ]</span>";
    
    // Simulate high-fidelity cryptographic signature binding
    logToTerminal("[DECRYPT] Initiating Gate binding protocol...", "info");
    
    setTimeout(() => {
        logToTerminal(`[DECRYPT] User signature verified: "${alias}"`, "info");
    }, 600);
    
    setTimeout(() => {
        logToTerminal(`[DECRYPT] Computing SHA-256 seal for address matching...`, "dim");
    }, 1200);
    
    setTimeout(() => {
        // Generate mock seal using user details
        const hashBase = alias + email + Date.now().toString();
        let hash = 0;
        for (let i = 0; i < hashBase.length; i++) {
            hash = (hash << 5) - hash + hashBase.charCodeAt(i);
            hash = hash & hash;
        }
        const hexHash = "0x" + Math.abs(hash).toString(16).padEnd(8, 'f') + "81631e082767e0F545386420cCB1128b98C70F60".substring(10, 24);
        
        logToTerminal(`[DECRYPT] Cryptographic Seal generated: ${hexHash.substring(0, 10)}...${hexHash.substring(hexHash.length - 8)}`, "green");
    }, 1900);
    
    setTimeout(() => {
        logToTerminal(`[DECRYPT] Writing user node to Levity Protocol Base block height #2131A2173...`, "dim");
        
        // Play success arpeggio in the Web Audio context if initialized
        if (audioCtx) {
            const now = audioCtx.currentTime;
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const osc3 = audioCtx.createOscillator();
            const localGain = audioCtx.createGain();
            
            osc1.type = "sine";
            osc2.type = "sine";
            osc3.type = "sine";
            
            // Rising chord: E5, G#5, B5 (Treasury harmonic major triad)
            const targetHz = state.calculatedFrequency * 10;
            osc1.frequency.setValueAtTime(targetHz * 2, now);
            osc2.frequency.setValueAtTime(targetHz * 2.5, now + 0.1);
            osc3.frequency.setValueAtTime(targetHz * 3, now + 0.2);
            
            localGain.gain.setValueAtTime(0, now);
            localGain.gain.linearRampToValueAtTime(state.gain * 0.35, now + 0.05);
            localGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
            
            osc1.connect(localGain);
            osc2.connect(localGain);
            osc3.connect(localGain);
            localGain.connect(audioCtx.destination);
            
            osc1.start(now);
            osc2.start(now);
            osc3.start(now);
            
            osc1.stop(now + 0.9);
            osc2.stop(now + 0.9);
            osc3.stop(now + 0.9);
        }
    }, 2500);
    
    setTimeout(() => {
        state.isBound = true;
        state.userAlias = alias;
        
        // Save to localStorage
        localStorage.setItem("nicole_alias", alias);
        localStorage.setItem("nicole_email", email);
        
        elBtnBind.innerHTML = "<span class='btn-text'>[ GATE BINDING SECURED ]</span>";
        logToTerminal(`[DECRYPT] SUCCESS: Vessel Gate binding complete. Welcome, Sovereign Node ${alias}.`, "green");
    }, 3200);
});

// Run Initial Check for Bindings
checkStoredSignature();

// Initialize UI text elements to match state
function initUI() {
    elValRadius.innerText = state.radius.toFixed(2) + " mm";
    elValGain.innerText = Math.round(state.gain * 100) + "%";
    
    const calculations = calculateTM010(state.radius);
    state.calculatedFrequency = calculations.frequency;
    state.lunarSync = calculations.lunarSync;
    
    elValFrequency.innerText = state.calculatedFrequency.toFixed(4) + " GHz";
    elLunarSync.innerText = state.lunarSync.toFixed(2) + "%";
    
    if (state.lunarSync > 98) {
        elLunarSync.className = "stat-value text-glow-green";
    } else {
        elLunarSync.className = "stat-value";
    }
}
initUI();
