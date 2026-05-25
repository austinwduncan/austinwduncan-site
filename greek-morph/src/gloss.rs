/// Generate an inflected gloss from lemma gloss + parsing.
/// e.g. lemma_gloss="believe, trust" + 3S Present Active Indicative → "he/she/it believes"

pub fn inflected_gloss(lemma_gloss: &str, pos: &str, parsing: &str) -> String {
    let chars: Vec<char> = parsing.chars().collect();
    if chars.len() < 8 {
        return lemma_gloss.to_string();
    }

    // Extract the first gloss word (before comma or semicolon)
    let base = base_gloss(lemma_gloss);
    // TBESG glosses verbs as "to love", "to be" — strip the infinitive marker
    let verb_base = base.strip_prefix("to ").unwrap_or(base);

    match pos {
        "V" => inflect_verb(verb_base, &chars),
        "N" => inflect_noun(lemma_gloss, &chars),
        "A" => inflect_adj(lemma_gloss, &chars),
        _ => lemma_gloss.to_string(),
    }
}

/// Strip to first meaningful gloss word
fn base_gloss(gloss: &str) -> &str {
    gloss
        .split([',', ';', '('])
        .next()
        .unwrap_or(gloss)
        .trim()
}

fn inflect_verb_be(chars: &[char]) -> String {
    let person = chars[0];
    let tense  = chars[1];
    let mood   = chars[3];
    let number = chars[5];
    match (mood, tense, person, number) {
        ('I', 'P', '1', 'S') => "I am".into(),
        ('I', 'P', '2', 'S') => "you are".into(),
        ('I', 'P', '3', 'S') => "he/she/it is".into(),
        ('I', 'P', '1', 'P') => "we are".into(),
        ('I', 'P', '2', 'P') => "you all are".into(),
        ('I', 'P', '3', 'P') => "they are".into(),
        ('I', 'I', '1', 'S') => "I was".into(),
        ('I', 'I', '2', 'S') => "you were".into(),
        ('I', 'I', '3', 'S') => "he/she/it was".into(),
        ('I', 'I', '1', 'P') => "we were".into(),
        ('I', 'I', '2', 'P') => "you all were".into(),
        ('I', 'I', '3', 'P') => "they were".into(),
        ('I', 'F', '1', 'S') => "I will be".into(),
        ('I', 'F', '2', 'S') => "you will be".into(),
        ('I', 'F', '3', 'S') => "he/she/it will be".into(),
        ('I', 'F', '1', 'P') => "we will be".into(),
        ('I', 'F', '2', 'P') => "you all will be".into(),
        ('I', 'F', '3', 'P') => "they will be".into(),
        ('I', 'X', '1', 'S') => "I have been".into(),
        ('I', 'X', '3', 'S') => "he/she/it has been".into(),
        ('I', 'X', '3', 'P') => "they have been".into(),
        ('D', _, '2', 'S')   => "be!".into(),
        ('D', _, '2', 'P')   => "be! (all of you)".into(),
        ('S', _, '1', 'S')   => "I might be".into(),
        ('S', _, '2', 'S')   => "you might be".into(),
        ('S', _, '3', 'S')   => "he/she/it might be".into(),
        ('S', _, '1', 'P')   => "we might be".into(),
        ('S', _, '3', 'P')   => "they might be".into(),
        ('N', _, _, _)       => "to be".into(),
        ('P', 'P', _, _)     => "being".into(),
        ('P', 'A', _, _)     => "having been".into(),
        _                    => "being".into(),
    }
}

fn inflect_verb(base: &str, chars: &[char]) -> String {
    if chars.len() < 8 {
        return base.to_string();
    }
    if base == "be" {
        return inflect_verb_be(chars);
    }
    let person = chars[0];
    let tense  = chars[1];
    let voice  = chars[2];
    let mood   = chars[3];
    let number = chars[5];

    // Build aspect prefix/suffix based on tense + voice
    match mood {
        'N' => {
            // Infinitive
            match tense {
                'P' => format!("to be {}ing / to {}", base, base),
                'A' => format!("to {}", base),
                'X' => format!("to have {}d", base),
                'F' => format!("to be about to {}", base),
                _ => format!("to {}", base),
            }
        }
        'P' => {
            // Participle
            let passive_suffix = if voice == 'P' { "d" } else { "" };
            match tense {
                'P' if voice == 'P' => format!("being {}{}d", base, passive_suffix),
                'P' => format!("{}ing", base),
                'A' if voice == 'P' => format!("having been {}{}d", base, passive_suffix),
                'A' => format!("having {}d", base),
                'X' => format!("having {}d (with ongoing effect)", base),
                _ => format!("{}ing", base),
            }
        }
        'D' => {
            // Imperative
            match (tense, number) {
                ('P', 'S') => format!("keep {}ing! / be {}ing!", base, base),
                ('P', 'P') => format!("keep {}ing! (plural)", base),
                ('A', 'S') => format!("{}!", base),
                ('A', 'P') => format!("{}! (plural)", base),
                _ => format!("{}!", base),
            }
        }
        'S' => {
            // Subjunctive
            match (tense, person, number) {
                ('P', '1', 'S') => format!("I might {}", base),
                ('P', '2', 'S') => format!("you might {}", base),
                ('P', '3', 'S') => format!("he/she/it might {}", base),
                ('P', '1', 'P') => format!("we might {}", base),
                ('P', '2', 'P') => format!("you all might {}", base),
                ('P', '3', 'P') => format!("they might {}", base),
                ('A', '1', 'S') => format!("I should {}", base),
                ('A', '2', 'S') => format!("you should {}", base),
                ('A', '3', 'S') => format!("he/she/it should {}", base),
                ('A', '1', 'P') => format!("we should {}", base),
                ('A', '2', 'P') => format!("you all should {}", base),
                ('A', '3', 'P') => format!("they should {}", base),
                _ => format!("might {}", base),
            }
        }
        'I' => {
            // Indicative — the main case
            let tense_form = match (tense, voice) {
                ('P', 'A') | ('P', 'M') => verb_present_form(base, person, number),
                ('P', 'P') => verb_present_passive_form(base, person, number),
                ('I', 'A') | ('I', 'M') => verb_imperfect_form(base, person, number),
                ('I', 'P') => verb_imperfect_passive_form(base, person, number),
                ('F', 'A') | ('F', 'M') => verb_future_form(base, person, number),
                ('F', 'P') => verb_future_passive_form(base, person, number),
                ('A', 'A') | ('A', 'M') => verb_aorist_form(base, person, number),
                ('A', 'P') => verb_aorist_passive_form(base, person, number),
                ('X', 'A') | ('X', 'M') => verb_perfect_form(base, person, number),
                ('X', 'P') => verb_perfect_passive_form(base, person, number),
                ('Y', 'A') | ('Y', 'M') => verb_pluperfect_form(base, person, number),
                _ => base.to_string(),
            };
            tense_form
        }
        _ => base.to_string(),
    }
}

fn verb_present_form(base: &str, person: char, number: char) -> String {
    match (person, number) {
        ('1', 'S') => format!("I {}", base),
        ('2', 'S') => format!("you {}", base),
        ('3', 'S') => format!("he/she/it {}s", base),
        ('1', 'P') => format!("we {}", base),
        ('2', 'P') => format!("you all {}", base),
        ('3', 'P') => format!("they {}", base),
        _ => base.to_string(),
    }
}

fn verb_present_passive_form(base: &str, person: char, number: char) -> String {
    match (person, number) {
        ('1', 'S') => format!("I am being {}d", base),
        ('2', 'S') => format!("you are being {}d", base),
        ('3', 'S') => format!("he/she/it is being {}d", base),
        ('1', 'P') => format!("we are being {}d", base),
        ('2', 'P') => format!("you all are being {}d", base),
        ('3', 'P') => format!("they are being {}d", base),
        _ => format!("being {}d", base),
    }
}

fn verb_imperfect_form(base: &str, person: char, number: char) -> String {
    match (person, number) {
        ('1', 'S') => format!("I was {}ing", base),
        ('2', 'S') => format!("you were {}ing", base),
        ('3', 'S') => format!("he/she/it was {}ing", base),
        ('1', 'P') => format!("we were {}ing", base),
        ('2', 'P') => format!("you all were {}ing", base),
        ('3', 'P') => format!("they were {}ing", base),
        _ => format!("was {}ing", base),
    }
}

fn verb_imperfect_passive_form(base: &str, person: char, number: char) -> String {
    match (person, number) {
        ('1', 'S') => format!("I was being {}d", base),
        ('2', 'S') => format!("you were being {}d", base),
        ('3', 'S') => format!("he/she/it was being {}d", base),
        ('1', 'P') => format!("we were being {}d", base),
        ('2', 'P') => format!("you all were being {}d", base),
        ('3', 'P') => format!("they were being {}d", base),
        _ => format!("was being {}d", base),
    }
}

fn verb_future_form(base: &str, person: char, number: char) -> String {
    match (person, number) {
        ('1', 'S') => format!("I will {}", base),
        ('2', 'S') => format!("you will {}", base),
        ('3', 'S') => format!("he/she/it will {}", base),
        ('1', 'P') => format!("we will {}", base),
        ('2', 'P') => format!("you all will {}", base),
        ('3', 'P') => format!("they will {}", base),
        _ => format!("will {}", base),
    }
}

fn verb_future_passive_form(base: &str, person: char, number: char) -> String {
    match (person, number) {
        ('1', 'S') => format!("I will be {}d", base),
        ('2', 'S') => format!("you will be {}d", base),
        ('3', 'S') => format!("he/she/it will be {}d", base),
        ('1', 'P') => format!("we will be {}d", base),
        ('2', 'P') => format!("you all will be {}d", base),
        ('3', 'P') => format!("they will be {}d", base),
        _ => format!("will be {}d", base),
    }
}

fn verb_aorist_form(base: &str, person: char, number: char) -> String {
    match (person, number) {
        ('1', 'S') => format!("I {}d", base),
        ('2', 'S') => format!("you {}d", base),
        ('3', 'S') => format!("he/she/it {}d", base),
        ('1', 'P') => format!("we {}d", base),
        ('2', 'P') => format!("you all {}d", base),
        ('3', 'P') => format!("they {}d", base),
        _ => format!("{}d", base),
    }
}

fn verb_aorist_passive_form(base: &str, person: char, number: char) -> String {
    match (person, number) {
        ('1', 'S') => format!("I was {}d", base),
        ('2', 'S') => format!("you were {}d", base),
        ('3', 'S') => format!("he/she/it was {}d", base),
        ('1', 'P') => format!("we were {}d", base),
        ('2', 'P') => format!("you all were {}d", base),
        ('3', 'P') => format!("they were {}d", base),
        _ => format!("was {}d", base),
    }
}

fn verb_perfect_form(base: &str, person: char, number: char) -> String {
    match (person, number) {
        ('1', 'S') => format!("I have {}d", base),
        ('2', 'S') => format!("you have {}d", base),
        ('3', 'S') => format!("he/she/it has {}d", base),
        ('1', 'P') => format!("we have {}d", base),
        ('2', 'P') => format!("you all have {}d", base),
        ('3', 'P') => format!("they have {}d", base),
        _ => format!("has {}d", base),
    }
}

fn verb_perfect_passive_form(base: &str, person: char, number: char) -> String {
    match (person, number) {
        ('1', 'S') => format!("I have been {}d", base),
        ('2', 'S') => format!("you have been {}d", base),
        ('3', 'S') => format!("he/she/it has been {}d", base),
        ('1', 'P') => format!("we have been {}d", base),
        ('2', 'P') => format!("you all have been {}d", base),
        ('3', 'P') => format!("they have been {}d", base),
        _ => format!("has been {}d", base),
    }
}

fn verb_pluperfect_form(base: &str, person: char, number: char) -> String {
    match (person, number) {
        ('1', 'S') => format!("I had {}d", base),
        ('2', 'S') => format!("you had {}d", base),
        ('3', 'S') => format!("he/she/it had {}d", base),
        ('1', 'P') => format!("we had {}d", base),
        ('2', 'P') => format!("you all had {}d", base),
        ('3', 'P') => format!("they had {}d", base),
        _ => format!("had {}d", base),
    }
}

fn inflect_noun(gloss: &str, chars: &[char]) -> String {
    let case = chars[4];
    let number = chars[5];
    let base = base_gloss(gloss);

    let article = match case {
        'N' => if number == 'P' { "the" } else { "the" },
        'G' => "of the",
        'D' => "to/in/for the",
        'A' => "the",
        'V' => "O",
        _ => "the",
    };

    let noun = if number == 'P' {
        format!("{}s", base)
    } else {
        base.to_string()
    };

    format!("{} {}", article, noun)
}

fn inflect_adj(gloss: &str, chars: &[char]) -> String {
    // Adjectives: just return the gloss with degree if comparative/superlative
    let degree = chars[7];
    let base = base_gloss(gloss);
    match degree {
        'C' => format!("more {}", base),
        'S' => format!("most {}", base),
        _ => base.to_string(),
    }
}
