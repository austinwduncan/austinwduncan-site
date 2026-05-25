/// Grammatical significance notes — what the parsing *means* exegetically.
/// These are the notes shown below the inflected gloss in the popover.

pub fn tense_note(tense: char) -> Option<&'static str> {
    match tense {
        'P' => Some("Present — depicts action as ongoing, continuous, or repeated. Not a one-time event but an active, unfolding reality."),
        'I' => Some("Imperfect — ongoing or repeated action in past time. Often captures what was happening in the background, or a habit that was in force."),
        'F' => Some("Future — action anticipated or certain from the speaker's vantage point. Can carry the force of a command when used in the indicative."),
        'A' => Some("Aorist — views the action as a whole, complete event. It makes no comment on duration — only that it happened. Often a decisive, punctiliar act."),
        'X' => Some("Perfect — a completed action whose effects are still present. The strongest tense for conveying ongoing consequence: it happened, and it still stands."),
        'Y' => Some("Pluperfect — a completed action whose effects were present at a past point in time. \"It had happened, and at that moment the results were in force.\""),
        _ => None,
    }
}

pub fn voice_note(voice: char) -> Option<&'static str> {
    match voice {
        'A' => None, // active is unmarked — no note needed
        'M' => Some("Middle voice — the subject acts with a personal stake in the action, often for their own benefit or on their own initiative."),
        'P' => Some("Passive voice — the subject receives the action rather than performing it. Often theologically significant: something is being done *to* the subject."),
        _ => None,
    }
}

pub fn mood_note(mood: char) -> Option<&'static str> {
    match mood {
        'I' => None, // indicative is the baseline — no note
        'D' => Some("Imperative — a direct command. The tense matters: present imperatives often call for ongoing action (or stopping an ongoing one); aorist imperatives issue a sharp, specific call to act."),
        'S' => Some("Subjunctive — the mood of contingency, purpose, and possibility. Used in purpose clauses (\"in order that\"), conditions, and exhortations. Not uncertain — dependent."),
        'O' => Some("Optative — the mood of wish or remote possibility. Rare in the NT. Expresses what the speaker desires or considers possible but not certain."),
        'N' => Some("Infinitive — a verbal noun. Expresses purpose, result, or indirect discourse. The tense still carries aspect: present infinitive = ongoing; aorist infinitive = simple event."),
        'P' => Some("Participle — a verbal adjective. Can be substantival (\"the one who believes\"), adverbial (showing time, cause, means), or predicative. Tense shows relative timing: present = same time as main verb; aorist = prior to main verb."),
        _ => None,
    }
}

pub fn case_note(case: char) -> Option<&'static str> {
    match case {
        'N' => Some("Nominative — the subject of the verb, or a predicate nominative."),
        'G' => Some("Genitive — typically possession, relationship, or source. Often translated \"of.\" One of the richest cases exegetically."),
        'D' => Some("Dative — the indirect object, but also instrument, location, and manner. Translated \"to,\" \"for,\" \"by,\" \"in,\" or \"with\" depending on context."),
        'A' => Some("Accusative — the direct object, or extent of time/space. The most common case for what the verb acts upon."),
        'V' => Some("Vocative — direct address. The speaker is speaking to this person or thing."),
        _ => None,
    }
}

/// Build the human-readable parsing string from MorphGNT parsing codes.
/// MorphGNT format: person tense voice mood case number gender degree
pub fn human_parsing(pos: &str, parsing: &str) -> String {
    let chars: Vec<char> = parsing.chars().collect();
    if chars.len() < 8 {
        return parsing.to_string();
    }

    match pos {
        "V" => {
            let person = chars[0];
            let tense  = chars[1];
            let voice  = chars[2];
            let mood   = chars[3];
            let number = chars[5];
            let case   = chars[4]; // for participles
            let gender = chars[6]; // for participles

            let t = tense_str(tense);
            let v = voice_str(voice);
            let m = mood_str(mood);

            if mood == 'N' {
                // Infinitive
                format!("{} {} Infinitive", t, v)
            } else if mood == 'P' {
                // Participle
                let c = case_str(case);
                let n = number_str(number);
                let g = gender_str(gender);
                format!("{} {} Participle, {} {} {}", t, v, c, n, g)
            } else {
                let p = person_str(person);
                let n = number_str(number);
                format!("Verb · {} {} {} · {} {}", t, v, m, p, n)
            }
        }
        "N" | "RA" | "RD" | "RI" | "RP" | "RR" | "RX" => {
            let case   = chars[4];
            let number = chars[5];
            let gender = chars[6];
            format!("{} · {} {}", case_str(case), number_str(number), gender_str(gender))
        }
        "A" => {
            let case   = chars[4];
            let number = chars[5];
            let gender = chars[6];
            let degree = chars[7];
            let d = if degree == 'C' { " (Comparative)" } else if degree == 'S' { " (Superlative)" } else { "" };
            format!("Adjective · {} · {} {}{}", case_str(case), number_str(number), gender_str(gender), d)
        }
        _ => parsing.to_string(),
    }
}

fn tense_str(t: char) -> &'static str {
    match t {
        'P' => "Present",
        'I' => "Imperfect",
        'F' => "Future",
        'A' => "Aorist",
        'X' => "Perfect",
        'Y' => "Pluperfect",
        _ => "–",
    }
}

fn voice_str(v: char) -> &'static str {
    match v {
        'A' => "Active",
        'M' => "Middle",
        'P' => "Passive",
        _ => "–",
    }
}

fn mood_str(m: char) -> &'static str {
    match m {
        'I' => "Indicative",
        'D' => "Imperative",
        'S' => "Subjunctive",
        'O' => "Optative",
        'N' => "Infinitive",
        'P' => "Participle",
        _ => "–",
    }
}

fn person_str(p: char) -> &'static str {
    match p {
        '1' => "1st Person",
        '2' => "2nd Person",
        '3' => "3rd Person",
        _ => "–",
    }
}

fn number_str(n: char) -> &'static str {
    match n {
        'S' => "Singular",
        'P' => "Plural",
        _ => "–",
    }
}

fn case_str(c: char) -> &'static str {
    match c {
        'N' => "Nominative",
        'G' => "Genitive",
        'D' => "Dative",
        'A' => "Accusative",
        'V' => "Vocative",
        _ => "–",
    }
}

fn gender_str(g: char) -> &'static str {
    match g {
        'M' => "Masculine",
        'F' => "Feminine",
        'N' => "Neuter",
        _ => "–",
    }
}
