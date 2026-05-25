#!/usr/bin/env bash
# Downloads and processes MorphGNT + Dodson lexicon into the TSV files
# the Rust crate embeds at compile time.
# Run once: bash greek-morph/fetch-data.sh

set -e
cd "$(dirname "$0")/data"

echo "→ Fetching MorphGNT..."

# MorphGNT is 27 files (one per NT book), named 01-matthew.txt through 27-revelation.txt
# Each line: BBCCCVVWWW POS parsing word normalized lemma
# We need: word \t normalized \t lemma \t pos \t parsing

MORPHGNT_BASE="https://raw.githubusercontent.com/morphgnt/morphgnt/master/sblgnt"

books=(
  "61-Mt" "62-Mk" "63-Lk" "64-Jn" "65-Ac"
  "66-Ro" "67-1Co" "68-2Co" "69-Ga" "70-Ep"
  "71-Ph" "72-Col" "73-1Th" "74-2Th" "75-1Ti"
  "76-2Ti" "77-Tit" "78-Phm" "79-Heb" "80-Jas"
  "81-1Pe" "82-2Pe" "83-1Jn" "84-2Jn" "85-3Jn"
  "86-Jud" "87-Re"
)

> morphgnt.tsv

for book in "${books[@]}"; do
  url="${MORPHGNT_BASE}/${book}.txt"
  echo "  Fetching ${book}..."
  curl -s "$url" | while IFS=' ' read -r bcv pos parsing word normalized lemma; do
    # Skip empty lines
    [ -z "$word" ] && continue
    printf '%s\t%s\t%s\t%s\t%s\n' "$word" "$normalized" "$lemma" "$pos" "$parsing"
  done >> morphgnt.tsv
done

echo "→ MorphGNT: $(wc -l < morphgnt.tsv) word instances"

echo "→ Fetching Dodson lexicon..."

# Dodson NT Greek lexicon — lemma \t gloss
curl -s "https://raw.githubusercontent.com/morphgnt/morphgnt/master/lexica/dodson/dodson.txt" \
  | awk -F'\t' 'NF>=2 {print $1"\t"$2}' \
  > dodson.tsv

echo "→ Dodson: $(wc -l < dodson.tsv) lemmas"
echo "✓ Data ready. Run: cd greek-morph && wasm-pack build --target web --out-dir ../public/greek-morph"
