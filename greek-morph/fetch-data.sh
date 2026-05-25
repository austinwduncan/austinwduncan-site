#!/usr/bin/env bash
# Downloads and processes MorphGNT + Mounce lexicon into the TSV files
# the Rust crate embeds at compile time.
# Run once from the repo root: bash greek-morph/fetch-data.sh

set -e
cd "$(dirname "$0")/data"

echo "→ Fetching MorphGNT (morphgnt/sblgnt)..."

MORPHGNT_BASE="https://raw.githubusercontent.com/morphgnt/sblgnt/master"

# File names in morphgnt/sblgnt repo (note different abbreviations from old repo)
books=(
  "61-Mt" "62-Mk" "63-Lk" "64-Jn" "65-Ac"
  "66-Ro" "67-1Co" "68-2Co" "69-Ga" "70-Eph"
  "71-Php" "72-Col" "73-1Th" "74-2Th" "75-1Ti"
  "76-2Ti" "77-Tit" "78-Phm" "79-Heb" "80-Jas"
  "81-1Pe" "82-2Pe" "83-1Jn" "84-2Jn" "85-3Jn"
  "86-Jud" "87-Re"
)

> morphgnt.tsv

for book in "${books[@]}"; do
  url="${MORPHGNT_BASE}/${book}-morphgnt.txt"
  echo "  Fetching ${book}..."
  # Format: bcv POS parsing word word_clean normalized lemma  (7 space-separated cols)
  # We want: normalized \t lemma \t pos \t parsing
  curl -s "$url" | awk '
    NF==7 {
      normalized=$6; lemma=$7; pos=$2; parsing=$3
      print normalized "\t" lemma "\t" pos "\t" parsing
    }
  ' >> morphgnt.tsv
done

echo "→ MorphGNT: $(wc -l < morphgnt.tsv) word instances"

echo "→ Fetching Mounce lexicon (eliranwong/SBLGNT-add-ons)..."

# Tab-separated: lemma \t xml_definition \t brief_gloss \t empty \t transliteration
# We extract col 0 (lemma) and col 2 (brief gloss), fallback to <gl>...</gl> in col 1
curl -s "https://raw.githubusercontent.com/eliranwong/SBLGNT-add-ons/master/re-shape_Mounce_dictionary/formatted_by_Oleg_for_MyBible.csv" \
  | python3 -c "
import sys, re
for line in sys.stdin:
    parts = line.rstrip('\n').split('\t')
    if len(parts) < 2:
        continue
    lemma = parts[0].strip()
    if not lemma:
        continue
    # prefer brief gloss in col 2
    gloss = parts[2].strip() if len(parts) > 2 else ''
    # fallback: extract from <gl>...</gl> in col 1
    if not gloss and len(parts) > 1:
        m = re.search(r'<gl>(.*?)</gl>', parts[1])
        if m:
            gloss = m.group(1).strip()
    if gloss:
        print(lemma + '\t' + gloss)
" > dodson.tsv

# Supplement: high-frequency NT words missing from Mounce CSV
cat >> dodson.tsv << 'SUPPLEMENT'
δέ	but, and, now
ἐν	in, on, among
εἰμί	to be, exist
ὅς	who, which, that
οὗτος	this, these
τίς	who? what? which?
ἤ	or, than
τέ	and, both
οὕτως	thus, in this way, so
μέν	on the one hand, indeed
ἄλλος	other, another
πρῶτος	first
πορεύομαι	to go, travel, live
ὅλος	whole, all, entire
πῶς	how? in what way?
καλός	good, beautiful, noble
ἕτερος	other, different
δίκαιος	righteous, just
ἔσχατος	last, final
κακός	bad, evil
ἄρα	then, therefore, so
ἔρημος	wilderness, desert; desolate
ὅμοιος	like, similar
μέρος	part, share, region
ἄξιος	worthy, deserving
ὀλίγος	little, few, small
ἔξεστιν	it is lawful, permitted
προσκαλέομαι	to call to oneself, summon
ποτέ	once, formerly, ever
πλούσιος	rich, wealthy
αἱρέομαι	to choose, prefer
βουλεύομαι	to deliberate, plan
γνήσιος	genuine, true, sincere
ὅμοιος	similar, like
ἕτερος	other, another
ἄξιος	worthy, fitting
ποτέ	at some time, once, ever
SUPPLEMENT

echo "→ Mounce lexicon: $(wc -l < dodson.tsv) lemmas"
echo "✓ Data ready. Run: cd greek-morph && ~/.cargo/bin/wasm-pack build --target web --out-dir ../public/greek-morph"
