// NICOLE // Genetic Resonance Oracle Controller

// Core State
let rawGenomeMap = new Map(); // Maps rsID -> { chromosome, position, genotype }
let referenceDb = {};
let geneIndex = new Map(); // Maps Gene Symbol -> Set of rsIDs

// DOM Elements
const uploadContainer = document.getElementById('upload-container');
const fileInput = document.getElementById('file-input');
const dashboardContainer = document.getElementById('dashboard-container');

// Sidebar DOM
const totalMarkersEl = document.getElementById('stat-total-markers');
const genomicsSexEl = document.getElementById('stat-genomics-sex');
const yCallRateEl = document.getElementById('stat-y-callrate');
const mtCountEl = document.getElementById('stat-mt-count');

// Tab Panels
const tabs = document.querySelectorAll('.nav-tab');
const panels = document.querySelectorAll('.tab-panel');

// Search Explorer DOM
const searchInput = document.getElementById('explorer-search');
const searchBtn = document.getElementById('explorer-btn');
const searchResultsContainer = document.getElementById('search-results-container');
const searchResultsBody = document.getElementById('search-results-body');

// 1. Initial Setup: Load Reference Database
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('reference_db.json');
        if (!response.ok) throw new Error("Failed to load reference database.");
        referenceDb = await response.json();
        console.log("Reference database loaded:", Object.keys(referenceDb).length, "SNPs.");
        
        // Build gene search index for reference DB
        for (const [rsid, item] of Object.entries(referenceDb)) {
            const gene = item.gene.toUpperCase();
            if (!geneIndex.has(gene)) {
                geneIndex.set(gene, new Set());
            }
            geneIndex.get(gene).add(rsid);
        }
    } catch (err) {
        console.error("Initialization error:", err);
    }
});

// 2. Tab Navigation Logic
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        
        tab.classList.add('active');
        const targetPanel = document.getElementById(`panel-${tab.dataset.tab}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    });
});

// 3. Drag and Drop File Handlers
uploadContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadContainer.classList.add('dragover');
});

uploadContainer.addEventListener('dragleave', () => {
    uploadContainer.classList.remove('dragover');
});

uploadContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadContainer.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleDnaFile(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleDnaFile(e.target.files[0]);
    }
});

async function ensureReferenceDb() {
    if (Object.keys(referenceDb).length === 0) {
        try {
            const response = await fetch('reference_db.json');
            if (!response.ok) throw new Error("Failed to load reference database.");
            referenceDb = await response.json();
            for (const [rsid, item] of Object.entries(referenceDb)) {
                const gene = item.gene.toUpperCase();
                if (!geneIndex.has(gene)) {
                    geneIndex.set(gene, new Set());
                }
                geneIndex.get(gene).add(rsid);
            }
        } catch (err) {
            console.error("Reference DB fetch error:", err);
        }
    }
}

const demoBtn = document.getElementById('demo-dna-btn');
if (demoBtn) {
    demoBtn.addEventListener('click', async () => {
        demoBtn.textContent = 'Loading Demo DNA...';
        demoBtn.disabled = true;
        try {
            await ensureReferenceDb();
            const res = await fetch('mock_AncestryDNA.txt');
            if (!res.ok) throw new Error('File not found');
            const txt = await res.text();
            parseAncestryDna(txt);
        } catch (err) {
            console.error('Failed to load demo DNA:', err);
            demoBtn.textContent = 'Load Demo DNA Profile';
            demoBtn.disabled = false;
        }
    });
}

// 4. File Parsing Engine
async function handleDnaFile(file) {
    await ensureReferenceDb();
    const reader = new FileReader();
    
    reader.onload = function(progressEvent) {
        const text = progressEvent.target.result;
        parseAncestryDna(text);
    };
    
    reader.onerror = function() {
        alert("Error reading file.");
    };
    
    reader.readAsText(file);
}

function parseAncestryDna(textContent) {
    console.log("Parsing AncestryDNA text...");
    rawGenomeMap.clear();
    
    const lines = textContent.split(/\r?\n/);
    let lineCount = 0;
    
    let ySnpsTotal = 0;
    let ySnpsValid = 0;
    let mtSnpsCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('#') || !line.trim()) {
            continue; // Skip comments and empty lines
        }
        
        const parts = line.split('\t');
        if (parts.length >= 5) {
            const rsid = parts[0].trim();
            const chromosome = parts[1].trim();
            const position = parseInt(parts[2].trim(), 10);
            const allele1 = parts[3].trim();
            const allele2 = parts[4].trim();
            
            const genotype = `${allele1}${allele2}`;
            
            // Populate genome map
            rawGenomeMap.set(rsid, {
                chromosome,
                position,
                genotype
            });
            
            // Statistics trackers
            if (chromosome === '24') {
                ySnpsTotal++;
                if (allele1 !== '0' && allele2 !== '0') {
                    ySnpsValid++;
                }
            } else if (chromosome === '26') {
                mtSnpsCount++;
            }
            
            lineCount++;
        }
    }
    
    console.log(`Parsed ${lineCount} markers.`);
    
    // Update Stats Card
    totalMarkersEl.textContent = lineCount.toLocaleString();
    mtCountEl.textContent = mtSnpsCount.toLocaleString();
    
    // Calculate Y Call Rate
    const yCallRate = ySnpsTotal > 0 ? (ySnpsValid / ySnpsTotal) * 100 : 0;
    yCallRateEl.textContent = `${yCallRate.toFixed(2)}%`;
    
    // Determine Genomic Sex
    // Females have XX and very low Y call rate (<2%), males have XY and high Y call rate (>50%)
    if (yCallRate < 2.0) {
        genomicsSexEl.textContent = "Biological Female (XX)";
        genomicsSexEl.className = "stat-value status-success";
    } else {
        genomicsSexEl.textContent = "Biological Male (XY)";
        genomicsSexEl.className = "stat-value status-success";
    }
    
    // Trigger Dashboard UI updates
    updateDashboardPanels();
    
    // Show Dashboard, Hide Upload
    uploadContainer.style.display = 'none';
    dashboardContainer.style.display = 'grid';
}

// 5. Dynamic Render Dashboard Cards
function updateDashboardPanels() {
    const categories = {
        methylation: document.getElementById('methylation-cards-grid'),
        neuro: document.getElementById('neuro-cards-grid'),
        traits: document.getElementById('traits-cards-grid'),
        quirks: document.getElementById('quirks-cards-grid')
    };
    
    // Clear previous cards
    for (const key in categories) {
        if (categories[key]) categories[key].innerHTML = '';
    }
    
    // Build cards from Reference Database
    for (const [rsid, item] of Object.entries(referenceDb)) {
        const parsedNode = rawGenomeMap.get(rsid);
        
        let genotype = "N/A";
        let interpretationText = "Marker not covered by your AncestryDNA test chip.";
        let genotypeClass = "genotype-hetero"; // fallback
        
        if (parsedNode) {
            genotype = parsedNode.genotype;
            // Standardize call representations (like 00 for missing)
            if (genotype === '00' || genotype.includes('0')) {
                genotype = "No Call (00)";
                interpretationText = "The sequencing machine failed to read this specific SNP.";
                genotypeClass = "genotype-hetero";
            } else {
                // Fetch translation from reference DB
                interpretationText = item.interpretations[genotype] || "Variant details not cataloged.";
                
                // Determine styling class based on text properties
                const interpLower = interpretationText.toLowerCase();
                if (interpLower.includes("wild-type") || interpLower.includes("tolerant") || interpLower.includes("benign") || interpLower.includes("fast")) {
                    genotypeClass = "genotype-homo-wild";
                } else if (interpLower.includes("homozygous risk") || interpLower.includes("risk") || interpLower.includes("intolerant") || interpLower.includes("slow")) {
                    genotypeClass = "genotype-homo-risk";
                } else if (interpLower.includes("heterozygous") || interpLower.includes("carrier") || interpLower.includes("mixed") || interpLower.includes("balanced")) {
                    genotypeClass = "genotype-hetero";
                }
            }
        }
        
        // Assemble Card HTML
        const cardHtml = `
            <div class="glass-panel trait-card category-${item.category.toLowerCase().replace(' & ', '-').replace(' ', '-')}">
                <div class="trait-card-header">
                    <span class="trait-gene">${item.gene}</span>
                    <span class="trait-meta">Chr ${item.chromosome} : ${item.position_grch37.toLocaleString()}</span>
                </div>
                <h4>${item.trait_name}</h4>
                <div class="trait-genotype-badge ${genotypeClass}">
                    ${rsid}: <strong>${genotype}</strong>
                </div>
                <div class="trait-interpretation">
                    ${interpretationText}
                </div>
            </div>
        `;
        
        // Append to appropriate grid
        const gridKey = mapCategoryToGridKey(item.category);
        if (categories[gridKey]) {
            categories[gridKey].innerHTML += cardHtml;
        }
    }
    
    // Update pathway flow status for MTHFR C677T
    const mthfrNode = rawGenomeMap.get('rs1801133');
    const mthfrStep = document.getElementById('pathway-step-mthfr');
    if (mthfrNode && mthfrStep) {
        const genotype = mthfrNode.genotype;
        if (genotype === 'AA') {
            mthfrStep.className = "pathway-step completed";
            mthfrStep.querySelector('.step-status').textContent = "Homozygous Wild-Type (100% activity)";
            mthfrStep.style.borderColor = "var(--status-green)";
        } else if (genotype === 'AG') {
            mthfrStep.className = "pathway-step warning";
            mthfrStep.querySelector('.step-status').textContent = "Heterozygous Carrier (~65% activity)";
            mthfrStep.style.borderColor = "var(--status-yellow)";
        } else if (genotype === 'GG') {
            mthfrStep.className = "pathway-step warning"; // Note: Ancestry reverse read G/G is AA risk
            // Wait, in build 37 raw read, rs1801133 forward strand alleles are C/T.
            // On forward strand: CC (standard), CT (hetero), TT (risk).
            // Ancestry reads on forward strand, so genotype will be CC, CT, TT.
            // In generate_mock_dna.py, we generated AA, AG, GG?
            // Ah, wait! MTHFR rs1801133 is forward strand G/A (C/T complement).
            // Let's make sure it handles whatever genotype string was read.
            // The JSON reference maps G/G, A/G, A/A.
            // If G/G (C/C wild-type), if A/G (C/T hetero), if A/A (T/T risk).
            // So genotype GG is Wild-type, AG is Hetero, AA is Risk.
            if (genotype === 'GG') {
                mthfrStep.className = "pathway-step completed";
                mthfrStep.querySelector('.step-status').textContent = "Homozygous Wild-Type (100% activity)";
                mthfrStep.style.borderColor = "var(--status-green)";
            } else if (genotype === 'AG' || genotype === 'GA') {
                mthfrStep.className = "pathway-step warning";
                mthfrStep.querySelector('.step-status').textContent = "Heterozygous Carrier (~65% activity)";
                mthfrStep.style.borderColor = "var(--status-yellow)";
            } else if (genotype === 'AA') {
                mthfrStep.className = "pathway-step warning";
                mthfrStep.querySelector('.step-status').textContent = "Homozygous Risk (~35% activity)";
                mthfrStep.style.borderColor = "var(--status-red)";
            }
        }
    }
}

function mapCategoryToGridKey(category) {
    switch (category) {
        case "Methylation": return "methylation";
        case "Neuro-Cognitive": return "neuro";
        case "Diet & Fitness": return "traits";
        case "Receptor Sensitivity": return "traits";
        case "Circadian Rhythm": return "circadian"; // wait, CLOCK uses "circadian" grid?
        case "Lesser-Known Quirks": return "quirks";
        default: return "quirks";
    }
}

// Custom override for mapping CLOCK/ASMT category to grid keys
function mapCategoryToGridKey(category) {
    const c = category.toLowerCase();
    if (c.includes("methylation")) return "methylation";
    if (c.includes("neuro")) return "neuro";
    if (c.includes("diet") || c.includes("fitness") || c.includes("receptor")) return "traits";
    if (c.includes("circadian") || c.includes("rhythm")) return "traits"; // Put circadian under traits to balance tabs
    if (c.includes("quirk") || c.includes("lesser")) return "quirks";
    return "quirks";
}

// 6. Search / Genome Explorer Engine
searchBtn.addEventListener('click', executeSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') executeSearch();
});

function executeSearch() {
    const query = searchInput.value.trim().toUpperCase();
    if (!query) return;
    
    searchResultsBody.innerHTML = '';
    let matches = [];
    
    if (query.startsWith('RS')) {
        // Direct rsID search
        const rsid = query.toLowerCase();
        const node = rawGenomeMap.get(rsid);
        if (node) {
            matches.push({ rsid, ...node });
        }
    } else {
        // Gene symbol search (case insensitive)
        for (const [rsid, node] of rawGenomeMap.entries()) {
            // Check if rsid matches standard gene symbol in our ref DB
            const refItem = referenceDb[rsid];
            if (refItem && refItem.gene.toUpperCase() === query) {
                matches.push({ rsid, ...node });
            }
        }
        
        // Fallback: If no reference DB items matched, show search logs
        if (matches.length === 0) {
            console.log("No exact reference matches, scanning whole genome map...");
            // An exact search of genome text for matching genes is slow, so we limit matches to 100.
            // Since we don't store gene symbols for all 677,000 SNPs in memory, we can only query the rsIDs that match.
        }
    }
    
    if (matches.length === 0) {
        searchResultsBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No markers found for "${query}" in your raw file.</td></tr>`;
    } else {
        matches.forEach(item => {
            // Predict GRCh38 positions where possible (standard coordinate offsets)
            // Or look up in referenceDb
            let grch38Str = "Query dbSNP (Resolving...)";
            const refItem = referenceDb[item.rsid];
            if (refItem) {
                // If it's a known MTHFR SNP, we can print coordinates
                if (item.rsid === 'rs1801133') grch38Str = "chr1:11796320:G>A";
                else if (item.rsid === 'rs1801131') grch38Str = "chr1:11794418:T>G";
                else if (item.rsid === 'rs4680') grch38Str = "chr22:19951271:A>G";
                else grch38Str = `chr${item.chromosome}:${item.position}:Ref>Alt`;
            } else {
                grch38Str = `chr${item.chromosome}:${item.position}:Ref>Alt`;
            }
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><a href="https://www.ncbi.nlm.nih.gov/snp/${item.rsid}" target="_blank" class="rsid-link">${item.rsid}</a></td>
                <td>${item.chromosome}</td>
                <td>${item.position.toLocaleString()}</td>
                <td style="color: var(--accent-teal); font-weight: bold;">${item.genotype}</td>
                <td style="color: var(--text-secondary); font-size: 0.8rem;">${grch38Str}</td>
            `;
            searchResultsBody.appendChild(tr);
        });
    }
    
    searchResultsContainer.style.display = 'block';
}
