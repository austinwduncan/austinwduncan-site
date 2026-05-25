#!/usr/bin/env bash
# Downloads MorphGNT + STEPBible TBESG (Abbott-Smith/Tyndale) lexicon data.
# Data created by STEPBible.org, CC BY 4.0 — credit: Tyndale House Cambridge.
# Run once from the repo root: bash greek-morph/fetch-data.sh

set -e
cd "$(dirname "$0")/data"

echo "→ Fetching MorphGNT (morphgnt/sblgnt)..."

MORPHGNT_BASE="https://raw.githubusercontent.com/morphgnt/sblgnt/master"

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
  curl -s "$url" | awk '
    NF==7 {
      normalized=$6; lemma=$7; pos=$2; parsing=$3
      print normalized "\t" lemma "\t" pos "\t" parsing
    }
  ' >> morphgnt.tsv
done

echo "→ MorphGNT: $(wc -l < morphgnt.tsv) word instances"

echo "→ Fetching STEPBible TBESG (Abbott-Smith, CC BY)..."

TBESG_URL="https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Lexicons/TBESG%20-%20Translators%20Brief%20lexicon%20of%20Extended%20Strongs%20for%20Greek%20-%20STEPBible.org%20CC%20BY.txt"

curl -s "$TBESG_URL" | python3 -c "
import sys, re, unicodedata

def normalize(w):
    # Match Rust: NFD grave->acute, then NFC lowercase
    nfd = unicodedata.normalize('NFD', w)
    nfd = nfd.replace('̀', '́')
    return unicodedata.normalize('NFC', nfd).lower()

def extract_short_def(html):
    # Remove the entry header (everything up to first <BR />)
    html = re.sub(r'^.*?<BR\s*/?>', '', html, count=1, flags=re.DOTALL)
    # Remove LXX/OT references in square brackets
    html = re.sub(r'\[.*?\]', '', html, flags=re.DOTALL)
    # Strip HTML tags
    text = re.sub(r'<[^>]+>', ' ', html)
    # Remove subsection markers but keep their text
    text = re.sub(r'__[IVX]+\.?\s*', '', text)
    text = re.sub(r'__\d+\.?\s*', '', text)
    text = re.sub(r'__\([a-z]\)\s*', '', text)
    # Clean whitespace
    text = ' '.join(text.split()).strip()
    # Fix space before punctuation artifacts
    text = re.sub(r'\s+([.,;])', r'\1', text)
    text = text.lstrip('.,;: ')
    # Truncate at first sentence boundary
    m = re.search(r'(?<=[a-z])\.\s+[A-Z]|(?<=[a-z])\.\s*$', text)
    if m and m.start() > 10:
        text = text[:m.start()+1]
    if len(text) > 200:
        text = text[:200].rsplit(' ', 1)[0]
    return text.strip()

seen = set()
for line in sys.stdin:
    parts = line.rstrip('\n').split('\t')
    if len(parts) < 7:
        continue
    estrong = parts[0].strip()
    # Only process actual lexicon entries (G-number lines)
    if not re.match(r'^G\d+$', estrong):
        continue

    greek_col = parts[3].strip() if len(parts) > 3 else ''
    if not greek_col:
        continue

    # Primary lemma: first token before comma or space
    primary = re.split(r'[\s,]', greek_col)[0].strip()
    if not primary:
        continue

    key = normalize(primary)
    if key in seen:
        continue
    seen.add(key)

    gloss = parts[6].strip() if len(parts) > 6 else ''
    if not gloss:
        continue

    full_def = parts[7].strip() if len(parts) > 7 else ''
    short_def = extract_short_def(full_def) if full_def else ''

    print(primary + '\t' + gloss + '\t' + short_def)
" > dodson.tsv

echo "→ TBESG lexicon: $(wc -l < dodson.tsv) lemmas"

# Supplement: high-frequency NT words not in TBESG
python3 -c "
import unicodedata

def normalize(w):
    nfd = unicodedata.normalize('NFD', w)
    nfd = nfd.replace('̀', '́')
    return unicodedata.normalize('NFC', nfd).lower()

covered = set()
with open('dodson.tsv') as f:
    for line in f:
        parts = line.strip().split('\t')
        if parts:
            covered.add(normalize(parts[0]))

supplement = [
    ('δέ',   'but, and',   'conjunction connecting clauses; marks contrast, continuation, or transition'),
    ('ἐν',   'in',         'preposition of location, sphere, or means; used with dative'),
    ('εἰμί', 'to be',      'copulative verb linking subject to predicate; also verb of existence'),
    ('ὅς',   'who, which', 'relative pronoun introducing subordinate clauses'),
    ('οὗτος','this',       'demonstrative pronoun pointing to what is near or just mentioned'),
    ('τίς',  'who? what?', 'interrogative pronoun asking for identity or nature'),
    ('ἤ',    'or, than',   'disjunctive particle offering alternatives or making comparisons'),
    ('τέ',   'and',        'enclitic particle closely joining two elements'),
    ('οὕτως','thus, so',   'adverb of manner; in this way, as follows'),
    ('μέν',  'indeed',     'particle often paired with δέ to contrast two clauses'),
    ('ἄλλος','other',      'other of the same kind, another; contrast with ἕτερος (different kind)'),
    ('πρῶτος','first',     'first in time, order, or rank'),
    ('πορεύομαι','to go',  'to travel, journey; in ethical contexts, to conduct oneself'),
    ('ὅλος', 'whole',      'whole, entire, all; used of undivided totality'),
    ('πῶς',  'how',        'interrogative or indirect adverb of manner'),
    ('καλός','good',       'good in the sense of admirable, noble, beautiful; outward excellence'),
    ('ἕτερος','another',   'other of a different kind; contrast with ἄλλος'),
    ('δίκαιος','righteous','conforming to the divine standard; just, upright'),
    ('ἔσχατος','last',     'last in position, time, or rank; the final state'),
    ('κακός','evil',       'bad, evil, harmful; moral or practical badness'),
    ('ἄρα',  'therefore',  'inferential particle: so then, consequently'),
    ('ἔρημος','wilderness','desert, uninhabited region; also desolate, abandoned'),
    ('ὅμοιος','like',      'like, similar, resembling; used in comparisons'),
    ('μέρος','part',       'a part, share, or portion; also region or side'),
    ('ἄξιος','worthy',     'worthy, deserving, of equal weight; used of persons and things'),
    ('ὀλίγος','few',       'little, small, few; often contrasted with πολύς'),
    ('ἔξεστιν','it is lawful','it is permitted, allowed; impersonal verb'),
    ('προσκαλέομαι','to call','to call to oneself, summon; used of Jesus calling disciples'),
    ('ποτέ', 'once',       'at some time, once, formerly; also ever'),
    ('πλούσιος','rich',    'wealthy, rich; used literally and of spiritual abundance'),
    ('αἱρέομαι','to choose','to take, choose, prefer; middle voice of αἱρέω'),
    ('βουλεύομαι','to plan','to deliberate, plan, resolve'),
    ('γνήσιος','genuine',  'genuine, true, born in wedlock; used of sincere faith or affection'),
]

for lemma, gloss, short_def in supplement:
    key = normalize(lemma)
    if key not in covered:
        print(lemma + '\t' + gloss + '\t' + short_def)
        covered.add(key)
" >> dodson.tsv

echo "→ Final lexicon: $(wc -l < dodson.tsv) lemmas"
echo "✓ Data ready. Run: cd greek-morph && ~/.cargo/bin/wasm-pack build --target web --out-dir ../public/greek-morph"
echo "  Attribution: Lexicon data © STEPBible.org / Tyndale House Cambridge, CC BY 4.0"
