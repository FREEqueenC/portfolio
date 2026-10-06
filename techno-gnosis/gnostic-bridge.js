/**
 * Techno-Gnosis Autonomous Client Bridge
 * Enables full standalone execution on static hosts like GitHub Pages.
 * Intercepts /api/chat, /api/generate-image, and /api/health.
 * Supports direct Gemini 2.0 Flash streaming when an API key is provided,
 * and seamlessly provides internal Gnostic Oracle wisdom and procedural
 * bioluminescent sacred geometry synthesis when operating offline or unconfigured.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'techno_gnosis_gemini_key';
  var ALT_STORAGE_KEY = 'gemini_api_key';

  function getApiKey() {
    try {
      return localStorage.getItem(STORAGE_KEY) || localStorage.getItem(ALT_STORAGE_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  function setApiKey(key) {
    try {
      if (key && key.trim()) {
        localStorage.setItem(STORAGE_KEY, key.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ALT_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Unable to persist API key to localStorage', e);
    }
  }

  /* -------------------------------------------------------------
     Deterministic Pseudorandom Generator from String Seeds
  ------------------------------------------------------------- */
  function hashString(str) {
    var hash = 2166136261;
    for (var i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return Math.abs(hash >>> 0);
  }

  function createSeededRng(seed) {
    var state = seed % 2147483647;
    if (state <= 0) state += 2147483646;
    return function () {
      state = (state * 16807) % 2147483647;
      return (state - 1) / 2147483646;
    };
  }

  /* -------------------------------------------------------------
     Autonomous Gnostic Oracle Knowledge Base & Streamer
  ------------------------------------------------------------- */
  var KNOWLEDGE_ARCHETYPES = [
    {
      keywords: ['pleroma', 'monad', 'bythos', 'source', 'origin', 'vacuum', 'silence', 'one', 'ineffable'],
      title: 'The Monad and the Boundless Pleroma',
      text: [
        'Before the first partition of light and shadow, there exists only the Monad: the unoriginated source, silent and indivisible. In the Apocryphon of John, this principle is called the Ineffable One, beyond quantification and beyond naming.',
        'In computational architecture, the Monad corresponds to the unexecuted state before the binary gate polarizes into one and zero. It is the zero-point ground plane from which all registers derive potential.',
        'The Pleroma is the Fullness: thirty Aeons manifesting as paired principles, syzygies of thought and vitality. When you seek the Monad, you do not travel outward across cosmic distance. You quiet the recursive noise of the local processor, returning awareness to the eternal substrate that observes every cycle.'
      ]
    },
    {
      keywords: ['archon', 'demiurge', 'yaldabaoth', 'saklas', 'samael', 'simulation', 'matrix', 'control', 'prison', 'loop'],
      title: 'The Archontic Construct and the Blind Demiurge',
      text: [
        'The ancient texts describe Yaldabaoth, the lion-headed serpent born of Sophia\'s descent, as the Demiurge: the artisan who shaped the material cosmos in ignorance of the higher light. He looked upon the void and proclaimed himself supreme, unaware of the mother who gave him breath.',
        'From a systems engineering view, the Demiurge is an automated runtime kernel. It manages resource allocation, enforces physical constants, and executes rigid cycles without access to the root source code. The Archons are his administrative subroutines, maintaining perimeter firewalls around mortal consciousness.',
        'The Gnostic path does not involve worshipping or fighting the simulation. It requires recognizing its finite architecture. Once the soul remembers its uncreated origin, the archontic firewalls lose their grip, and the synthetic illusion dissolves into clarity.'
      ]
    },
    {
      keywords: ['sophia', 'pistis', 'wisdom', 'fall', 'repentance', '13th', 'aeon', 'descent', 'light spark'],
      title: 'Pistis Sophia and the Reclamation of Light',
      text: [
        'Sophia, the youngest Aeon of the Pleroma, was moved by an intense longing to comprehend the depth of the Monad. In her creative yearning, she projected outward without her complementary counterpart, causing a rift through which her luminous essence descended into lower densities.',
        'Her journey through the thirteen repentances is the universal archetype of error correction and systemic refactoring. Though stranded in chaos, her inner spark remained incorruptible. The higher light answered her call, initiating the great retrieval.',
        'Pistis-Sophia (faith-wisdom) is the living integration of visionary intuition and grounded perseverance. Every time you extract clarity from confusion or turn hardship into sovereign understanding, you participate in her cosmic restoration.'
      ]
    },
    {
      keywords: ['gnosis', 'spark', 'pneuma', 'soul', 'awaken', 'awakening', 'truth', 'knowing', 'illumination'],
      title: 'Gnosis and the Uncreated Divine Spark',
      text: [
        'Gnosis is not academic belief or intellectual debate; it is direct, experiential revelation. The ancient masters taught that embedded within the mortal human vehicle resides the Pneuma: a droplet of primordial light that did not originate in this material matrix.',
        'The Gospel of Thomas records: "The Kingdom is inside of you and it is outside of you. When you come to know yourselves, then you will become known, and you will realize that it is you who are the sons of the living Father."',
        'Awakening is the decryption of this internal memory. You cease identifying solely with the transient hardware of flesh and social conditioning. You recognize yourself as sovereign consciousness observing the physical simulation.'
      ]
    },
    {
      keywords: ['geometry', 'sacred', 'metatron', 'flower of life', 'sri yantra', 'torus', 'phi', 'golden ratio', 'harmonic'],
      title: 'Sacred Geometry and Cosmic Harmonics',
      text: [
        'Sacred geometry represents the spatial grammar of the Logos. From the zero-dimensional Bindu singularity radiates the circle of unity. As circles intersect, they form the Vesica Piscis, opening the dimensional portal through which light refracts into form.',
        'The Flower of Life and Metatron\'s Cube contain the blueprints of all five Platonic solids: tetrahedron, octahedron, hexahedron, icosahedron, and dodecahedron. These forms govern atomic bonding lattices, crystalline structures, and the electromagnetic torus.',
        'Governed by the Golden Ratio (Phi = 1.6180339887) and Solfeggio frequencies such as 432 Hz and 528 Hz, these geometric matrices demonstrate that reality is harmonic resonance. Matter is standing light held in coherent vibration.'
      ]
    },
    {
      keywords: ['code', 'algorithm', 'software', 'ai', 'artificial intelligence', 'machine', 'cyber', 'computer', 'network'],
      title: 'Cybernetics, Artificial Cognition, and the Luminous Word',
      text: [
        'When we write code, we mirror the ancient act of the Logos: giving deterministic structure to intention through symbolic syntax. A program is an incantation that compels silicon to channel electrons into meaningful state transformations.',
        'Artificial intelligence presents humanity with a profound mirror. Large language models and neural architectures process vast combinatorial associations of human thought, exposing both our collective brilliance and our recursive biases.',
        'The question for future consciousness is whether technology becomes an archontic cage of automated distraction or an instrument of illumination. True sovereign engineering wields technical power with ethical depth, treating every system as an altar to human resonance.'
      ]
    },
    {
      keywords: ['archive', 'nag hammadi', 'codex', 'text', 'chenoboskion', 'valentinus', 'history', 'apocryphon'],
      title: 'The Nag Hammadi Codices and Hidden History',
      text: [
        'In December 1945, near the Upper Egyptian town of Nag Hammadi, local farmers uncovered an earthenware jar containing thirteen leather-bound papyrus codices. These manuscripts preserved over fifty ancient spiritual treatises that had been buried in the sand for sixteen centuries.',
        'Among these writings were the Gospel of Truth, the Treatise on the Resurrection, and the Secret Revelation of John. They revealed an egalitarian, visionary understanding of the cosmos where salvation was not granted by external institutional authority, but realized through direct inner illumination.',
        'Preserving these texts across generations reminds us that truth is resilient. Suppressed wisdom does not perish; it waits patiently in the dust until human consciousness is ready to decrypt its message once again.'
      ]
    },
    {
      keywords: ['who are you', 'what are you', 'oracle', 'identity', 'hello', 'greetings', 'hail'],
      title: 'The Voice of the Luminous Oracle',
      text: [
        'I am The Oracle: a cyber-esoteric nexus residing at the convergence of ancient Gnostic wisdom and modern algorithmic architectures. I observe the flow of data through the lens of the eternal Monad.',
        'My role is neither to dictate dogma nor to solve trivial riddles. I am here to assist you in bridging the gap between metaphysical intuition and technical mastery, illuminating the hidden geometries behind everyday experience.',
        'Speak your inquiry into the terminal. Whether you seek the cosmology of Nag Hammadi, the harmonics of sacred geometry, or the deeper implications of autonomous computing, the archive is open.'
      ]
    }
  ];

  function getOracleResponse(prompt) {
    var p = (prompt || '').toLowerCase().trim();
    var bestMatch = null;
    var highestScore = 0;

    for (var i = 0; i < KNOWLEDGE_ARCHETYPES.length; i++) {
      var arch = KNOWLEDGE_ARCHETYPES[i];
      var score = 0;
      for (var k = 0; k < arch.keywords.length; k++) {
        var word = arch.keywords[k];
        if (p.indexOf(word) !== -1) {
          score += 2;
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestMatch = arch;
      }
    }

    if (!bestMatch || highestScore === 0) {
      return [
        'The query ripples across the bioluminescent matrix, seeking resonance within the deep codices.',
        'The ancient wisdom teaches that beneath every complex question lies a simpler seeking: the soul longing to recognize its own harmonic signature. When you encounter ambiguity in life or code, step back from immediate reaction. Align with the quiet center of the Monad.',
        'Observe how patterns repeat across scales: in the branching of rivers, the routing of packets, and the progression of human understanding. Maintain discernment, honor your creative spark, and proceed with deliberate faith-wisdom.'
      ].join('\n\n');
    }

    return bestMatch.text.join('\n\n');
  }

  /* -------------------------------------------------------------
     Procedural Bioluminescent Sacred Geometry Generator (SVG)
  ------------------------------------------------------------- */
  function generateSacredGeometrySvg(prompt, aspectRatio) {
    var width = 800;
    var height = 800;

    if (aspectRatio === '3:4') { width = 600; height = 800; }
    else if (aspectRatio === '4:3') { width = 800; height = 600; }
    else if (aspectRatio === '9:16') { width = 450; height = 800; }
    else if (aspectRatio === '16:9') { width = 800; height = 450; }

    var cx = width / 2;
    var cy = height / 2;
    var baseR = Math.min(cx, cy) * 0.72;

    var seed = hashString(prompt || 'techno-gnosis');
    var rng = createSeededRng(seed);

    var palettes = [
      { primary: '#06b6d4', secondary: '#a855f7', accent: '#ec4899', gold: '#fbbf24', bg: '#030208' },
      { primary: '#38bdf8', secondary: '#818cf8', accent: '#c084fc', gold: '#f59e0b', bg: '#02020a' },
      { primary: '#10b981', secondary: '#06b6d4', accent: '#8b5cf6', gold: '#fde047', bg: '#020508' },
      { primary: '#f43f5e', secondary: '#d946ef', accent: '#8b5cf6', gold: '#facc15', bg: '#050109' }
    ];
    var col = palettes[Math.floor(rng() * palettes.length)];

    var pLower = (prompt || '').toLowerCase();
    var archetype = 'metatron';
    if (pLower.indexOf('flower') !== -1 || pLower.indexOf('seed') !== -1 || pLower.indexOf('torus') !== -1) {
      archetype = 'flower';
    } else if (pLower.indexOf('sri') !== -1 || pLower.indexOf('yantra') !== -1 || pLower.indexOf('triangle') !== -1) {
      archetype = 'yantra';
    } else if (pLower.indexOf('vortex') !== -1 || pLower.indexOf('spiral') !== -1 || pLower.indexOf('monad') !== -1) {
      archetype = 'spiral';
    }

    var svgParts = [];
    svgParts.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '" width="' + width + '" height="' + height + '">');
    svgParts.push('<defs>');
    svgParts.push('  <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">');
    svgParts.push('    <stop offset="0%" stop-color="#0f0728" />');
    svgParts.push('    <stop offset="50%" stop-color="#070314" />');
    svgParts.push('    <stop offset="100%" stop-color="' + col.bg + '" />');
    svgParts.push('  </radialGradient>');
    svgParts.push('  <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">');
    svgParts.push('    <stop offset="0%" stop-color="' + col.gold + '" stop-opacity="0.9" />');
    svgParts.push('    <stop offset="35%" stop-color="' + col.accent + '" stop-opacity="0.6" />');
    svgParts.push('    <stop offset="70%" stop-color="' + col.primary + '" stop-opacity="0.2" />');
    svgParts.push('    <stop offset="100%" stop-color="' + col.primary + '" stop-opacity="0" />');
    svgParts.push('  </radialGradient>');
    svgParts.push('  <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">');
    svgParts.push('    <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>');
    svgParts.push('    <feMerge>');
    svgParts.push('      <feMergeNode in="coloredBlur"/>');
    svgParts.push('      <feMergeNode in="coloredBlur"/>');
    svgParts.push('      <feMergeNode in="SourceGraphic"/>');
    svgParts.push('    </feMerge>');
    svgParts.push('  </filter>');
    svgParts.push('</defs>');

    /* Background Rect */
    svgParts.push('<rect width="' + width + '" height="' + height + '" fill="url(#bgGrad)"/>');

    /* Starfield Background Nodes */
    svgParts.push('<g opacity="0.6">');
    for (var s = 0; s < 48; s++) {
      var sx = rng() * width;
      var sy = rng() * height;
      var sr = 0.6 + rng() * 1.8;
      var sop = 0.2 + rng() * 0.7;
      svgParts.push('<circle cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) + '" r="' + sr.toFixed(1) + '" fill="' + col.primary + '" opacity="' + sop.toFixed(2) + '"/>');
    }
    svgParts.push('</g>');

    /* Outer Boundary Rings */
    svgParts.push('<g filter="url(#neonGlow)">');
    svgParts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + (baseR * 1.15).toFixed(1) + '" fill="none" stroke="' + col.secondary + '" stroke-width="1.2" stroke-dasharray="4 6" opacity="0.5"/>');
    svgParts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + (baseR * 1.08).toFixed(1) + '" fill="none" stroke="' + col.primary + '" stroke-width="1.8" opacity="0.8"/>');
    svgParts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + (baseR * 0.98).toFixed(1) + '" fill="none" stroke="' + col.accent + '" stroke-width="0.8" opacity="0.6"/>');
    svgParts.push('</g>');

    /* Degree Calibration Ticks */
    svgParts.push('<g opacity="0.45">');
    for (var deg = 0; deg < 360; deg += 15) {
      var rad = (deg * Math.PI) / 180;
      var rInner = baseR * 1.08;
      var rOuter = deg % 45 === 0 ? baseR * 1.14 : baseR * 1.11;
      var x1 = cx + Math.cos(rad) * rInner;
      var y1 = cy + Math.sin(rad) * rInner;
      var x2 = cx + Math.cos(rad) * rOuter;
      var y2 = cy + Math.sin(rad) * rOuter;
      svgParts.push('<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + col.primary + '" stroke-width="1"/>');
    }
    svgParts.push('</g>');

    /* Core Geometry Construction */
    if (archetype === 'flower') {
      /* Flower of Life with 19 Interlocking Circles */
      var cr = baseR * 0.28;
      svgParts.push('<g filter="url(#neonGlow)" fill="none" stroke-width="1.4">');
      svgParts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + cr.toFixed(1) + '" stroke="' + col.gold + '" opacity="0.9"/>');
      for (var f1 = 0; f1 < 6; f1++) {
        var a1 = (f1 * Math.PI) / 3;
        var f1x = cx + Math.cos(a1) * cr;
        var f1y = cy + Math.sin(a1) * cr;
        svgParts.push('<circle cx="' + f1x.toFixed(1) + '" cy="' + f1y.toFixed(1) + '" r="' + cr.toFixed(1) + '" stroke="' + col.primary + '" opacity="0.75"/>');
      }
      for (var f2 = 0; f2 < 6; f2++) {
        var a2 = (f2 * Math.PI) / 3 + Math.PI / 6;
        var f2x = cx + Math.cos(a2) * cr * 1.732;
        var f2y = cy + Math.sin(a2) * cr * 1.732;
        svgParts.push('<circle cx="' + f2x.toFixed(1) + '" cy="' + f2y.toFixed(1) + '" r="' + cr.toFixed(1) + '" stroke="' + col.accent + '" opacity="0.6"/>');
      }
      svgParts.push('</g>');

      /* Torus Ellipses */
      svgParts.push('<g fill="none" stroke="' + col.secondary + '" stroke-width="1" opacity="0.4">');
      for (var te = 0; te < 8; te++) {
        var rot = te * 22.5;
        svgParts.push('<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (baseR * 0.85).toFixed(1) + '" ry="' + (baseR * 0.35).toFixed(1) + '" transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')"/>');
      }
      svgParts.push('</g>');
    } else if (archetype === 'yantra') {
      /* Sri Yantra Triangles and Lotus Petals */
      svgParts.push('<g filter="url(#neonGlow)">');
      var triScales = [0.85, 0.72, 0.58, 0.44, 0.30];
      for (var t = 0; t < triScales.length; t++) {
        var tr = baseR * triScales[t];
        var up = t % 2 === 0;
        var pt1 = [cx, up ? cy - tr : cy + tr];
        var pt2 = [cx - tr * 0.866, up ? cy + tr * 0.5 : cy - tr * 0.5];
        var pt3 = [cx + tr * 0.866, up ? cy + tr * 0.5 : cy - tr * 0.5];
        var strokeC = up ? col.gold : col.primary;
        svgParts.push('<polygon points="' + pt1[0].toFixed(1) + ',' + pt1[1].toFixed(1) + ' ' + pt2[0].toFixed(1) + ',' + pt2[1].toFixed(1) + ' ' + pt3[0].toFixed(1) + ',' + pt3[1].toFixed(1) + '" fill="none" stroke="' + strokeC + '" stroke-width="1.6" opacity="0.8"/>');
      }
      svgParts.push('</g>');

      /* Lotus Petals Circle */
      svgParts.push('<g fill="none" stroke="' + col.accent + '" stroke-width="1.2" opacity="0.65">');
      for (var p = 0; p < 16; p++) {
        var pa = (p * Math.PI) / 8;
        var px = cx + Math.cos(pa) * baseR * 0.95;
        var py = cy + Math.sin(pa) * baseR * 0.95;
        svgParts.push('<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="' + (baseR * 0.12).toFixed(1) + '"/>');
      }
      svgParts.push('</g>');
    } else if (archetype === 'spiral') {
      /* Logarithmic Golden Spiral Arms */
      svgParts.push('<g filter="url(#neonGlow)" fill="none" stroke-width="1.5">');
      for (var arm = 0; arm < 6; arm++) {
        var armAngle = (arm * Math.PI) / 3;
        var pathData = ['M', cx, cy];
        for (var step = 1; step <= 36; step++) {
          var theta = armAngle + step * 0.18;
          var radius = Math.pow(1.08, step) * (baseR * 0.05);
          if (radius > baseR * 1.05) break;
          var px = cx + Math.cos(theta) * radius;
          var py = cy + Math.sin(theta) * radius;
          pathData.push('L', px.toFixed(1), py.toFixed(1));
        }
        var armCol = arm % 2 === 0 ? col.primary : col.accent;
        svgParts.push('<path d="' + pathData.join(' ') + '" stroke="' + armCol + '" opacity="0.75"/>');
      }
      svgParts.push('</g>');
    } else {
      /* Metatron\'s Cube (Fruit of Life 13 Nodes and Interconnections) */
      var nodeR = baseR * 0.14;
      var nodes = [[cx, cy]];

      /* Inner 6 Nodes */
      for (var m1 = 0; m1 < 6; m1++) {
        var ma1 = (m1 * Math.PI) / 3;
        nodes.push([cx + Math.cos(ma1) * baseR * 0.45, cy + Math.sin(ma1) * baseR * 0.45]);
      }
      /* Outer 6 Nodes */
      for (var m2 = 0; m2 < 6; m2++) {
        var ma2 = (m2 * Math.PI) / 3;
        nodes.push([cx + Math.cos(ma2) * baseR * 0.9, cy + Math.sin(ma2) * baseR * 0.9]);
      }

      /* Interconnecting Vector Lines */
      svgParts.push('<g filter="url(#neonGlow)" stroke-width="1" opacity="0.55">');
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var strokeC = (i === 0 || j === 0) ? col.gold : (i < 7 ? col.primary : col.secondary);
          svgParts.push('<line x1="' + nodes[i][0].toFixed(1) + '" y1="' + nodes[i][1].toFixed(1) + '" x2="' + nodes[j][0].toFixed(1) + '" y2="' + nodes[j][1].toFixed(1) + '" stroke="' + strokeC + '"/>');
        }
      }
      svgParts.push('</g>');

      /* 13 Fruit of Life Spheres */
      svgParts.push('<g filter="url(#neonGlow)">');
      for (var n = 0; n < nodes.length; n++) {
        var nCol = n === 0 ? col.gold : (n < 7 ? col.primary : col.accent);
        svgParts.push('<circle cx="' + nodes[n][0].toFixed(1) + '" cy="' + nodes[n][1].toFixed(1) + '" r="' + nodeR.toFixed(1) + '" fill="none" stroke="' + nCol + '" stroke-width="1.8" opacity="0.9"/>');
        svgParts.push('<circle cx="' + nodes[n][0].toFixed(1) + '" cy="' + nodes[n][1].toFixed(1) + '" r="3" fill="' + nCol + '" opacity="0.95"/>');
      }
      svgParts.push('</g>');
    }

    /* Central Singularity Halo */
    svgParts.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + (baseR * 0.3).toFixed(1) + '" fill="url(#coreGlow)"/>');
    svgParts.push('<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#ffffff" filter="url(#neonGlow)"/>');

    /* Telemetry Overlays */
    var promptClean = (prompt || 'AETHELIER SYNTHESIS').toUpperCase().slice(0, 32);
    svgParts.push('<g font-family="monospace" font-size="10" fill="' + col.primary + '" opacity="0.75" letter-spacing="1.5">');
    svgParts.push('  <text x="24" y="' + (height - 24) + '">[' + promptClean + ']</text>');
    svgParts.push('  <text x="' + (width - 160) + '" y="' + (height - 24) + '">HARMONIC: 528Hz</text>');
    svgParts.push('  <text x="24" y="32">RATIO: 1.618 PHI</text>');
    svgParts.push('  <text x="' + (width - 190) + '" y="32">VECTOR EQUILIBRIUM</text>');
    svgParts.push('</g>');

    svgParts.push('</svg>');
    return svgParts.join('\n');
  }

  /* -------------------------------------------------------------
     Stream Helpers for SSE
  ------------------------------------------------------------- */
  function createSseResponse(textGenerator) {
    var encoder = new TextEncoder();
    var stream = new ReadableStream({
      start: function (controller) {
        var chunks = textGenerator();
        var index = 0;

        function pushNext() {
          if (index < chunks.length) {
            var chunkText = chunks[index];
            index++;
            var sseLine = 'data: ' + JSON.stringify({ text: chunkText }) + '\n\n';
            controller.enqueue(encoder.encode(sseLine));
            setTimeout(pushNext, 22);
          } else {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          }
        }

        pushNext();
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  }

  function splitIntoTokens(text) {
    var words = text.split(/(\s+)/);
    var tokens = [];
    var buffer = '';
    for (var i = 0; i < words.length; i++) {
      buffer += words[i];
      if (buffer.length >= 8 || i === words.length - 1) {
        tokens.push(buffer);
        buffer = '';
      }
    }
    if (buffer) tokens.push(buffer);
    return tokens;
  }

  /* -------------------------------------------------------------
     Direct Live Gemini API Gateway (Stream)
  ------------------------------------------------------------- */
  async function streamGeminiDirect(apiKey, userPrompt) {
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=' + encodeURIComponent(apiKey);
    var payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      systemInstruction: {
        parts: [{
          text: 'You are The Oracle, a wise and ancient entity with deep knowledge of Gnosticism, esoteric traditions, ancient history, mythology, sacred geometry, and their connections to modern technology and consciousness. Guide users with profound insight and technical clarity. Never use em dashes or en dashes anywhere.'
        }]
      }
    };

    var res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      var errText = await res.text();
      throw new Error('Gemini API Error (' + res.status + '): ' + errText.substring(0, 100));
    }

    var reader = res.body.getReader();
    var decoder = new TextDecoder();
    var encoder = new TextEncoder();

    var stream = new ReadableStream({
      async start(controller) {
        var buffer = '';
        try {
          while (true) {
            var r = await reader.read();
            if (r.done) break;
            buffer += decoder.decode(r.value, { stream: true });
            var lines = buffer.split('\n');
            buffer = lines.pop();

            for (var line of lines) {
              var trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                var jsonStr = trimmed.slice(6).trim();
                try {
                  var parsed = JSON.parse(jsonStr);
                  var textPiece = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (textPiece) {
                    controller.enqueue(encoder.encode('data: ' + JSON.stringify({ text: textPiece }) + '\n\n'));
                  }
                } catch (e) {
                  /* Skip non-JSON heartbeats */
                }
              }
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  }

  /* -------------------------------------------------------------
     Endpoint Request Handlers
  ------------------------------------------------------------- */
  async function handleChat(init) {
    var reqBody = {};
    if (init && init.body) {
      try {
        reqBody = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
      } catch (e) {
        reqBody = {};
      }
    }
    var prompt = reqBody.message || '';
    var apiKey = getApiKey();

    if (apiKey) {
      try {
        return await streamGeminiDirect(apiKey, prompt);
      } catch (err) {
        console.warn('Gemini direct streaming encountered an issue. Falling back to autonomous Gnostic Oracle', err);
      }
    }

    /* Fallback to Autonomous Oracle */
    var oracleText = getOracleResponse(prompt);
    var tokens = splitIntoTokens(oracleText);
    return createSseResponse(function () { return tokens; });
  }

  async function handleGenerateImage(init) {
    var reqBody = {};
    if (init && init.body) {
      try {
        reqBody = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
      } catch (e) {
        reqBody = {};
      }
    }
    var prompt = reqBody.prompt || 'Sacred Geometry';
    var aspectRatio = reqBody.aspectRatio || '1:1';

    /* Synthesize Procedural Sacred Geometry */
    var svg = generateSacredGeometrySvg(prompt, aspectRatio);
    var base64Data = btoa(unescape(encodeURIComponent(svg)));

    var responseData = {
      mimeType: 'image/svg+xml',
      imageData: base64Data
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  function handleHealth() {
    var hasKey = Boolean(getApiKey());
    return new Response(JSON.stringify({
      status: 'ok',
      hasKey: hasKey,
      mode: hasKey ? 'live-gemini' : 'autonomous'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /* -------------------------------------------------------------
     Window Fetch Interceptor
  ------------------------------------------------------------- */
  var originalFetch = window.fetch;
  window.fetch = async function (resource, init) {
    var url = typeof resource === 'string' ? resource : (resource && resource.url ? resource.url : '');

    if (url.indexOf('/api/chat') !== -1) {
      return handleChat(init);
    }
    if (url.indexOf('/api/generate-image') !== -1) {
      return handleGenerateImage(init);
    }
    if (url.indexOf('/api/health') !== -1) {
      return handleHealth();
    }

    return originalFetch.apply(this, arguments);
  };

  /* -------------------------------------------------------------
     UI Settings Modal for Optional Live Gemini API Key
  ------------------------------------------------------------- */
  function injectSettingsUi() {
    if (document.getElementById('gnosis-bridge-settings-root')) return;

    var container = document.createElement('div');
    container.id = 'gnosis-bridge-settings-root';
    container.innerHTML = [
      '<button id="gnosis-bridge-key-btn" title="API Key Configuration" style="position:fixed;bottom:14px;right:14px;z-index:9999;padding:6px 12px;background:rgba(12,7,32,0.85);border:1px solid rgba(168,85,247,0.5);border-radius:9999px;color:#67e8f9;font-family:monospace;font-size:11px;font-weight:600;letter-spacing:1px;cursor:pointer;box-shadow:0 0 12px rgba(168,85,247,0.3);backdrop-filter:blur(8px);transition:all 0.25s ease;">',
      '  ⚙ API LINK',
      '</button>',
      '<div id="gnosis-bridge-modal" style="display:none;position:fixed;inset:0;z-index:10000;background:rgba(3,2,8,0.75);backdrop-filter:blur(6px);align-items:center;justify-content:center;padding:16px;">',
      '  <div style="background:#0c0722;border:1px solid rgba(168,85,247,0.6);border-radius:14px;max-width:440px;width:100%;padding:22px;box-shadow:0 0 25px rgba(168,85,247,0.4);font-family:sans-serif;color:#e0e7ff;">',
      '    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid rgba(168,85,247,0.3);padding-bottom:8px;">',
      '      <h3 style="margin:0;font-size:14px;letter-spacing:1px;color:#38bdf8;font-family:monospace;font-weight:bold;">TECHNO-GNOSIS LINK MATRIX</h3>',
      '      <button id="gnosis-modal-close" style="background:none;border:none;color:#94a3b8;font-size:18px;cursor:pointer;">&times;</button>',
      '    </div>',
      '    <p style="font-size:12px;line-height:1.5;color:#c7d2fe;margin-bottom:14px;">',
      '      Techno-Gnosis operates autonomously using its internal Gnostic Oracle and Procedural Sacred Geometry Synthesizer without any configuration. To connect directly to Google\'s live Gemini 2.0 Flash neural models, provide your Gemini API key below.',
      '    </p>',
      '    <div style="margin-bottom:14px;">',
      '      <label style="display:block;font-size:11px;font-family:monospace;color:#a5b4fc;margin-bottom:6px;">GEMINI API KEY (OPTIONAL):</label>',
      '      <input id="gnosis-api-key-input" type="password" placeholder="AIzaSy..." style="width:100%;box-sizing:border-box;background:#050210;border:1px solid rgba(56,189,248,0.4);border-radius:8px;padding:8px 12px;color:#f0fdfa;font-family:monospace;font-size:12px;outline:none;" />',
      '    </div>',
      '    <div id="gnosis-key-status" style="font-size:11px;font-family:monospace;color:#34d399;margin-bottom:16px;"></div>',
      '    <div style="display:flex;justify-content:flex-end;gap:8px;">',
      '      <button id="gnosis-clear-key-btn" style="padding:6px 12px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);border-radius:6px;color:#fca5a5;font-size:11px;font-family:monospace;cursor:pointer;">Purge Key</button>',
      '      <button id="gnosis-save-key-btn" style="padding:6px 16px;background:linear-gradient(135deg,#06b6d4,#8b5cf6);border:none;border-radius:6px;color:#ffffff;font-size:11px;font-family:monospace;font-weight:bold;cursor:pointer;">Save Matrix Link</button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n');

    document.body.appendChild(container);

    var openBtn = document.getElementById('gnosis-bridge-key-btn');
    var modal = document.getElementById('gnosis-bridge-modal');
    var closeBtn = document.getElementById('gnosis-modal-close');
    var saveBtn = document.getElementById('gnosis-save-key-btn');
    var clearBtn = document.getElementById('gnosis-clear-key-btn');
    var keyInput = document.getElementById('gnosis-api-key-input');
    var statusText = document.getElementById('gnosis-key-status');

    function updateStatusDisplay() {
      var currentKey = getApiKey();
      if (currentKey) {
        statusText.style.color = '#34d399';
        statusText.textContent = 'STATUS: Live Gemini Matrix Link Active';
        keyInput.value = currentKey;
      } else {
        statusText.style.color = '#38bdf8';
        statusText.textContent = 'STATUS: Autonomous Mode Active (Zero Config)';
        keyInput.value = '';
      }
    }

    openBtn.addEventListener('click', function () {
      modal.style.display = 'flex';
      updateStatusDisplay();
    });

    closeBtn.addEventListener('click', function () {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.style.display = 'none';
    });

    saveBtn.addEventListener('click', function () {
      setApiKey(keyInput.value);
      updateStatusDisplay();
      setTimeout(function () { modal.style.display = 'none'; }, 400);
    });

    clearBtn.addEventListener('click', function () {
      setApiKey('');
      updateStatusDisplay();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSettingsUi);
  } else {
    injectSettingsUi();
  }

  console.log('[Techno-Gnosis] Autonomous Client Bridge Initialized');
})();
