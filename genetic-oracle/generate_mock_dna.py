import os
import random

# Target mock DNA path
MOCK_FILE_PATH = "mock_AncestryDNA.txt"

# Curated SNPs with fixed genotypes for UI verification
FIXED_SNPS = {
    # rsid: (chromosome, position, allele1, allele2)
    "rs1801133": ("1", "11856378", "A", "G"),    # MTHFR C677T - Heterozygous (Carrier)
    "rs1801131": ("1", "11854476", "T", "G"),    # MTHFR A1298C - Heterozygous (Carrier)
    "rs4680": ("22", "19951271", "A", "G"),       # COMT Val158Met - Heterozygous (Val/Met)
    "rs1815739": ("11", "66328095", "T", "C"),    # ACTN3 R577X - Heterozygous (Mixed Fiber)
    "rs4988235": ("2", "136608646", "A", "G"),    # LCT Lactose - Heterozygous (Tolerant)
    "rs53576": ("3", "8804371", "A", "G"),        # OXTR Oxytocin - Heterozygous (Balanced Empathy)
    "rs1801260": ("4", "56301369", "A", "G"),     # CLOCK Sleep - Heterozygous (Intermediate)
    "rs1799971": ("6", "154360797", "A", "G"),    # OPRM1 Pain - Heterozygous (Moderate)
    "rs1800497": ("11", "113270828", "G", "G"),   # DRD2 Receptor - Homozygous Wild-Type (Standard)
    "rs671": ("12", "112241766", "G", "G"),       # ALDH2 Alcohol - Homozygous Wild-Type (Normal)
    "rs6265": ("11", "27679922", "A", "G"),       # BDNF Neuro - Heterozygous (Val/Met)
    "rs7205": ("25", "1458324", "A", "G"),        # ASMT Sleep (PAR1) - Heterozygous (Moderate)
    "rs174537": ("11", "61552650", "A", "G"),     # FADS1 Omega-3 - Heterozygous (Intermediate)
    "rs6564851": ("16", "81232822", "G", "T"),    # BCMO1 Vit A - Heterozygous (Intermediate)
    "rs17822931": ("16", "48258198", "A", "A"),   # ABCC11 Odor - Homozygous Mutation (Dry Earwax/No Odor)
    "rs713598": ("7", "141672618", "C", "G"),     # TAS2R38 Taste - Heterozygous (Medium Taster)
    "rs762551": ("15", "75042285", "A", "C"),     # CYP1A2 Coffee - Heterozygous (Slow)
    "rs1805007": ("16", "89985386", "C", "T")     # MC1R Red Hair - Heterozygous (Carrier)
}

# The 36 exact SNPs on Chromosome 25 (PAR2 / Custom)
CHROM_25_POSITIONS = [
    ("rs28736870", 170770), ("rs2738344", 260897), ("rs199946685", 535124), ("rs113313554", 535258),
    ("rs137852558", 545379), ("rs193922466", 545422), ("rs137852555", 545533), ("rs137852557", 551571),
    ("rs397514461", 551577), ("rs397514462", 551578), ("rs137852556", 551586), ("rs137852553", 551786),
    ("rs4129148", 940180), ("rs138899368", 1271349), ("rs28838006", 1341345), ("rs137852353", 1359342),
    ("rs28416357", 1377181), ("rs17879123", 1410554), ("rs7205", 1458324), ("rs200795444", 1496664),
    ("rs5948932", 1587450), ("rs6588800", 1664859), ("rs6588807", 1698581), ("rs121918828", 1711741),
    ("rs3934928", 2107423), ("rs185393788", 2168320), ("rs5983086", 2350657), ("rs17842875", 2354855),
    ("rs5939179", 2359488), ("rs311043", 2569654), ("rs28371882", 2580381), ("rs312191", 2594516),
    ("rs28729587", 59112954), ("rs700455", 59114338), ("rs192817973", 59274708), ("rs3093457", 59330613)
]

def generate_mock_dna():
    print(f"Generating synthetic mock DNA file at {MOCK_FILE_PATH}...")
    
    header = (
        "#AncestryDNA raw data download\n"
        "#This file is a synthetic mock generated for offline web application development and testing.\n"
        "#It does not contain real human genomic data.\n"
        "rsid\tchromosome\tposition\tallele1\tallele2\n"
    )
    
    # Track which rsIDs are written to avoid duplicates
    written_rsids = set()
    
    with open(MOCK_FILE_PATH, "w", encoding="utf-8") as f:
        f.write(header)
        
        # 1. Write the fixed interest SNPs
        for rsid, (chrom, pos, a1, a2) in FIXED_SNPS.items():
            f.write(f"{rsid}\t{chrom}\t{pos}\t{a1}\t{a2}\n")
            written_rsids.add(rsid)
            
        # 2. Write Chromosome 25 PAR SNPs (ensure mock has all 36)
        for rsid, pos in CHROM_25_POSITIONS:
            if rsid in written_rsids:
                continue
            # Pick standard random heterozygous or homozygous alleles
            allele1, allele2 = random.choice([("A", "A"), ("G", "G"), ("A", "G"), ("C", "C"), ("T", "T")])
            f.write(f"{rsid}\t25\t{pos}\t{allele1}\t{allele2}\n")
            written_rsids.add(rsid)
            
        # 3. Generate random autosomes (Chromosomes 1 to 22) - ~5,000 SNPs
        nucleotides = ["A", "C", "T", "G"]
        for chrom in range(1, 23):
            # Write a small cluster of random SNPs per chromosome
            num_snps = random.randint(150, 250)
            base_pos = random.randint(500000, 2000000)
            for i in range(num_snps):
                rsid = f"rs{random.randint(1000000, 99999999)}"
                if rsid in written_rsids:
                    continue
                pos = base_pos + (i * random.randint(100, 1000))
                # Autosomes are diploid, pick random alleles
                a1 = random.choice(nucleotides)
                a2 = random.choice(nucleotides)
                f.write(f"{rsid}\t{str(chrom)}\t{str(pos)}\t{a1}\t{a2}\n")
                written_rsids.add(rsid)
                
        # 4. Generate Chromosome 23 (X Chromosome) - ~500 SNPs
        # Females have two X chromosomes (diploid calls)
        base_pos = 100000
        for i in range(300):
            rsid = f"rs_x_{random.randint(10000, 99999)}"
            pos = base_pos + (i * 200)
            a1 = random.choice(nucleotides)
            a2 = random.choice(nucleotides)
            f.write(f"{rsid}\t23\t{str(pos)}\t{a1}\t{a2}\n")
            
        # 5. Generate Chromosome 24 (Y Chromosome) - 1,665 SNPs
        # To simulate a female genome, 99.7% of Y-chromosome lines must be "0 0" (no calls).
        # We will add exactly 4 valid calls as cross-reactivity noise, and 1,661 blank "0 0" calls.
        base_pos = 100000
        noise_positions = random.sample(range(1665), 4)
        for i in range(1665):
            rsid = f"rs_y_{random.randint(10000, 99999)}"
            pos = base_pos + (i * 150)
            if i in noise_positions:
                a1 = random.choice(nucleotides)
                a2 = a1  # Typically homozygous read noise
            else:
                a1 = "0"
                a2 = "0"
            f.write(f"{rsid}\t24\t{str(pos)}\t{a1}\t{a2}\n")
            
        # 6. Generate Chromosome 26 (Mitochondrial Genome) - 263 SNPs
        # Mitochondrial DNA is haploid (maternal line).
        # To test compliance with biological rules, ALL calls on chromosome 26 MUST be homozygous (allele1 == allele2).
        base_pos = 500
        for i in range(263):
            rsid = f"rs_mt_{random.randint(10000, 99999)}"
            pos = base_pos + (i * 50)
            # Must be homozygous
            allele = random.choice(nucleotides)
            f.write(f"{rsid}\t26\t{str(pos)}\t{allele}\t{allele}\n")

    print(f"Success. Mock DNA file generated at {MOCK_FILE_PATH}")

if __name__ == "__main__":
    generate_mock_dna()
