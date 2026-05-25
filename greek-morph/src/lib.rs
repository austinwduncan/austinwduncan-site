mod grammar;
mod gloss;

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use unicode_normalization::UnicodeNormalization;

// MorphGNT data is embedded at compile time
static MORPHGNT_DATA: &str = include_str!("../data/morphgnt.tsv");
static DODSON_DATA: &str = include_str!("../data/dodson.tsv");

#[derive(Serialize, Deserialize, Clone)]
pub struct ParseEntry {
    pub lemma: String,
    pub pos: String,
    pub parsing: String,
    pub parsing_human: String,
    pub gloss: String,        // brief gloss (TBESG col 6)
    pub short_def: Option<String>, // short Abbott-Smith definition (TBESG col 7)
    pub inflected_gloss: String,
    pub tense_note: Option<String>,
    pub voice_note: Option<String>,
    pub mood_note: Option<String>,
    pub case_note: Option<String>,
}

// Global lookup table, initialized once
static LOOKUP: std::sync::OnceLock<HashMap<String, Vec<ParseEntry>>> = std::sync::OnceLock::new();
static LEMMA_GLOSSES: std::sync::OnceLock<HashMap<String, (String, Option<String>)>> = std::sync::OnceLock::new();

fn normalize(word: &str) -> String {
    // Decompose to NFD, convert grave accent (U+0300) → acute (U+0301) so that
    // running-text forms like καὶ/πρὸς/θεὸς match the MorphGNT normalized column
    // which always restores acute. Then recompose to NFC and lowercase.
    let acute: String = word.nfd()
        .map(|c| if c == '\u{0300}' { '\u{0301}' } else { c })
        .collect();
    acute.nfc().collect::<String>().to_lowercase()
}

fn init() {
    LEMMA_GLOSSES.get_or_init(|| {
        let mut map = HashMap::new();
        for line in DODSON_DATA.lines() {
            let parts: Vec<&str> = line.splitn(3, '\t').collect();
            if parts.len() >= 2 {
                let gloss = parts[1].trim().to_string();
                let short_def = if parts.len() >= 3 && !parts[2].trim().is_empty() {
                    Some(parts[2].trim().to_string())
                } else {
                    None
                };
                map.insert(normalize(parts[0]), (gloss, short_def));
            }
        }
        map
    });

    LOOKUP.get_or_init(|| {
        let glosses = LEMMA_GLOSSES.get().unwrap();
        let mut map: HashMap<String, Vec<ParseEntry>> = HashMap::new();

        for line in MORPHGNT_DATA.lines() {
            let parts: Vec<&str> = line.split('\t').collect();
            // Format: normalized \t lemma \t pos \t parsing
            if parts.len() < 4 {
                continue;
            }
            let word_norm = normalize(parts[0]);
            let lemma = parts[1].trim();
            let pos = parts[2].trim();
            let parsing = parts[3].trim();

            let lex_entry = glosses.get(&normalize(lemma));
            let lemma_gloss = lex_entry.map(|(g, _)| g.as_str()).unwrap_or("(see lexicon)");
            let short_def = lex_entry.and_then(|(_, d)| d.clone());

            let parsing_chars: Vec<char> = parsing.chars().collect();
            let tense = if parsing_chars.len() > 1 { parsing_chars[1] } else { '-' };
            let voice = if parsing_chars.len() > 2 { parsing_chars[2] } else { '-' };
            let mood  = if parsing_chars.len() > 3 { parsing_chars[3] } else { '-' };
            let case  = if parsing_chars.len() > 4 { parsing_chars[4] } else { '-' };

            let entry = ParseEntry {
                lemma: lemma.to_string(),
                pos: pos.to_string(),
                parsing: parsing.to_string(),
                parsing_human: grammar::human_parsing(pos, parsing),
                gloss: lemma_gloss.to_string(),
                short_def,
                inflected_gloss: gloss::inflected_gloss(lemma_gloss, pos, parsing),
                tense_note: grammar::tense_note(tense).map(str::to_string),
                voice_note: grammar::voice_note(voice).map(str::to_string),
                mood_note:  grammar::mood_note(mood).map(str::to_string),
                case_note:  grammar::case_note(case).map(str::to_string),
            };

            map.entry(word_norm).or_default().push(entry);
        }

        map
    });
}

#[wasm_bindgen]
pub fn lookup(word: &str) -> JsValue {
    init();
    let key = normalize(word);
    let results = LOOKUP
        .get()
        .and_then(|m| m.get(&key))
        .cloned()
        .unwrap_or_default();

    serde_wasm_bindgen::to_value(&results).unwrap_or(JsValue::NULL)
}

#[wasm_bindgen]
pub fn is_greek(word: &str) -> bool {
    word.chars().any(|c| {
        matches!(c,
            '\u{0370}'..='\u{03FF}' | // Greek and Coptic
            '\u{1F00}'..='\u{1FFF}'   // Greek Extended (polytonic diacritics)
        )
    })
}
