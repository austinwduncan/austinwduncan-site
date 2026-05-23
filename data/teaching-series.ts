export const TEACHING_LANES = ['Bible Book Studies', 'Biblical Theology', 'Word Studies'] as const
export type TeachingLane = (typeof TEACHING_LANES)[number]

export type SeriesStatus = 'Complete' | 'Ongoing'

export type RoadmapPart = {
  title: string
  description: string
  sessions: number[]   // 1-indexed session numbers belonging to this part
}

export type SeriesMetadata = {
  slug: string             // URL slug for /teaching/series/[slug]
  seriesTag: string        // matches the last tag in session frontmatter
  type: 'expositional' | 'topical'
  title: string
  subtitle: string         // short tagline / promise shown in the hero
  primaryLane: TeachingLane
  filterTags: string[]
  intents: string[]
  status: SeriesStatus
  totalSessions: number
  publishedSessions?: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  testament: 'Old Testament' | 'New Testament' | 'Both' | null
  bestFor: string[]        // audience bullets (was a single string)
  themes: string[]
  whyStudy: string         // hero pitch paragraph
  excerpt: string          // used for SEO meta description
  outcomes: string[]
  roadmap: RoadmapPart[]
  howToUse: string[]
  relatedSeries: string[]  // slugs of recommended related series
  recommendedBooks: string[] // book slugs from library (optional)
  startHere: string
  nextAfter: string
  startHereNote: string
  featured: boolean
  priority: number
  image: string
}

export const TEACHING_SERIES: SeriesMetadata[] = [
  {
    slug: 'hebrews',
    seriesTag: 'The Book of Hebrews',
    type: 'expositional',
    title: 'The Book of Hebrews',
    subtitle: 'Why Jesus is better, final, and worth holding fast to.',
    primaryLane: 'Bible Book Studies',
    filterTags: ['New Testament', 'Bible Book', 'Christology', 'Perseverance'],
    intents: ['see-jesus'],
    status: 'Complete',
    totalSessions: 13,
    difficulty: 'Intermediate',
    testament: 'New Testament',
    bestFor: [
      'Christians who feel spiritually tired, distracted, or tempted to drift',
      'Anyone trying to understand Jesus\' priesthood and the warning passages',
      'Readers who want to see how the Old Testament points to Christ',
    ],
    themes: ['Jesus as better', 'Priesthood', 'Sacrifice', 'Perseverance', 'Faith', 'Covenant'],
    whyStudy:
      "Hebrews was written to tired believers who were tempted to drift backward. This series walks through the book's argument, showing how Jesus is the final priest, sacrifice, mediator, and word from God — and why that makes holding fast worth it.",
    excerpt: "Jesus is better. Better than angels, priests, and sacrifices — and Hebrews shows you exactly why.",
    outcomes: [
      'See how the Old Testament points to Christ',
      'Understand Jesus as the final priest and sacrifice',
      'Make sense of the warning passages in Hebrews',
    ],
    roadmap: [
      {
        title: 'The Son Who Speaks',
        description: 'Hebrews opens by establishing who Jesus is — superior to angels, greater than Moses, and the final word from God.',
        sessions: [1, 2, 3],
      },
      {
        title: 'The Priest Who Represents Us',
        description: 'Jesus is not only the sacrifice. He is the priest who brings us near — better than Aaron, holding an eternal office.',
        sessions: [4, 5, 6, 7],
      },
      {
        title: 'The Sacrifice That Finished the Work',
        description: 'The once-for-all offering of Christ replaces every shadow and type in the Old Testament system.',
        sessions: [8, 9, 10],
      },
      {
        title: 'The Faith That Endures',
        description: "The hall of faith and the call to run with endurance — grounded in what Christ has already accomplished.",
        sessions: [11, 12, 13],
      },
    ],
    howToUse: [
      'Work through one session at a time, then read that chapter of Hebrews',
      "Pay attention to the author's 'Therefore' transitions — they carry the whole argument",
      "Don't rush the warning passages: sit with them rather than explaining them away",
      'After finishing, re-read Hebrews 12:1–3 as a summary of the whole book',
    ],
    relatedSeries: ['the-covenant', 'words-that-change-everything'],
    recommendedBooks: [],
    startHere: 'hebrews-1',
    nextAfter: 'The Covenant',
    startHereNote: 'Start here for a Christ-centered New Testament study.',
    featured: true,
    priority: 1,
    image: '/images/Teaching Series/Expositional/The Book of Hebrews/the-book-of-hebrews-title-slide.jpg',
  },
  {
    slug: 'daniel',
    seriesTag: 'The Book of Daniel',
    type: 'expositional',
    title: 'The Book of Daniel',
    subtitle: 'How to stay faithful when the world around you is hostile to faith.',
    primaryLane: 'Bible Book Studies',
    filterTags: ['Old Testament', 'Bible Book', 'Prophets', 'Sovereignty', 'Exile'],
    intents: ['faith-pressure', 'old-testament'],
    status: 'Complete',
    totalSessions: 12,
    difficulty: 'Intermediate',
    testament: 'Old Testament',
    bestFor: [
      'People walking through seasons of cultural pressure, political upheaval, or doubt',
      'Anyone trying to understand God\'s sovereignty over difficult or frightening circumstances',
      'Readers who want help reading apocalyptic literature without getting lost',
    ],
    themes: ['Faithfulness', 'Exile', 'God\'s sovereignty', 'Kingdoms', 'Courage', 'Apocalyptic vision'],
    whyStudy:
      "Daniel was written for people living under an empire that did not share their convictions. This series walks through all twelve chapters — showing how to hold faith under pressure, and why the rise and fall of kingdoms is never the last word.",
    excerpt: "Faithfulness under pressure, God's sovereignty over kingdoms, and courage in exile.",
    outcomes: [
      'Understand faithfulness in cultural and spiritual exile',
      "Trace the rise and fall of human kingdoms under God's rule",
      "Read Daniel's visions with more care and context",
    ],
    roadmap: [
      {
        title: 'Faithfulness in Babylon',
        description: 'The opening stories: Daniel and his friends face the pressure to conform — and refuse.',
        sessions: [1, 2, 3],
      },
      {
        title: 'Kings and Kingdoms',
        description: "From Nebuchadnezzar's dream to Belshazzar's feast — God's sovereignty over arrogant rulers.",
        sessions: [4, 5, 6],
      },
      {
        title: 'Visions and Beasts',
        description: 'The apocalyptic half of Daniel: four beasts, a ram and a goat, and a seventy-week vision.',
        sessions: [7, 8, 9],
      },
      {
        title: 'Hope Beyond the Empire',
        description: "Daniel's final visions: the great conflict, the resurrection of the dead, and the promise that the end is not the end.",
        sessions: [10, 11, 12],
      },
    ],
    howToUse: [
      'Read each chapter of Daniel before watching or reading the session',
      'Note where Daniel and his friends choose faithfulness over comfort — the pattern repeats',
      'The second half (chs. 7–12) is harder — lean in rather than skipping it',
      'Use the roadmap to track how the visions build on each other',
    ],
    relatedSeries: ['minor-prophets', 'the-covenant'],
    recommendedBooks: [],
    startHere: 'daniel-1-faithfulness-in-exile',
    nextAfter: 'The Minor Prophets',
    startHereNote: 'Start here for faithfulness, exile, kingdoms, and courage.',
    featured: true,
    priority: 2,
    image: '/images/Teaching Series/Expositional/The Book of Daniel/The Book of Daniel - Title.jpg',
  },
  {
    slug: 'minor-prophets',
    seriesTag: 'The Minor Prophets',
    type: 'expositional',
    title: 'The Minor Prophets',
    subtitle: "God's justice, love, and hope through twelve forgotten voices.",
    primaryLane: 'Bible Book Studies',
    filterTags: ['Old Testament', 'Bible Book', 'Prophets', 'Justice', 'Redemption'],
    intents: ['old-testament'],
    status: 'Complete',
    totalSessions: 13,
    difficulty: 'Intermediate',
    testament: 'Old Testament',
    bestFor: [
      'Readers who skip the Minor Prophets because they feel confusing or irrelevant',
      "Anyone who wants to understand God's character through varied prophetic voices",
      'People interested in themes of judgment, restoration, and the Day of the Lord',
    ],
    themes: ['Covenant faithfulness', 'God\'s justice', 'Redemption', 'The Day of the Lord', 'Love', 'Return'],
    whyStudy:
      "These twelve books are called 'minor' only because of their length — not their importance. Each prophet speaks into a real historical moment with God's word about unfaithfulness, judgment, and the hope of return. Together, they form one of the richest portraits of God's character in Scripture.",
    excerpt: "Thirteen studies through all twelve Minor Prophets — God's justice and love in vivid detail.",
    outcomes: [
      'Understand each prophet in their historical context',
      'Recognize recurring themes of judgment and restoration',
      'See why the prophets still expose and challenge us today',
    ],
    roadmap: [
      {
        title: 'Introduction: The Twelve',
        description: 'Who the Minor Prophets are, when they wrote, and why they still matter.',
        sessions: [1],
      },
      {
        title: 'Covenant Broken',
        description: 'Hosea, Joel, Amos, and Obadiah: unfaithfulness, betrayal, and the God who keeps pursuing.',
        sessions: [2, 3, 4, 5],
      },
      {
        title: 'Mercy in the Midst of Judgment',
        description: "Jonah, Micah, Nahum, and Habakkuk: God's justice is never without compassion — or questions.",
        sessions: [6, 7, 8, 9],
      },
      {
        title: 'The Day That Changes Everything',
        description: 'Zephaniah, Haggai, Zechariah, and Malachi: the Day of the Lord and the promise of restoration.',
        sessions: [10, 11, 12, 13],
      },
    ],
    howToUse: [
      'Keep a Bible open to the prophet you\'re studying',
      'Each session is relatively self-contained — you can start with any prophet',
      'Look for the recurring pattern: unfaithfulness → warning → judgment → restoration',
      "Read each prophet's historical footnote (in your Bible's introduction) before the session if possible",
    ],
    relatedSeries: ['daniel', 'the-covenant'],
    recommendedBooks: [],
    startHere: 'the-minor-prophets-1-hosea',
    nextAfter: 'The Covenant',
    startHereNote: 'Start here if you want to understand the prophets as more than scattered judgment speeches.',
    featured: true,
    priority: 3,
    image: '/images/Teaching Series/Expositional/The Minor Prophets/1 - Introduction.jpg',
  },
  {
    slug: 'the-covenant',
    seriesTag: 'The Covenant',
    type: 'topical',
    title: 'The Covenant',
    subtitle: 'The thread that runs through every page of Scripture.',
    primaryLane: 'Biblical Theology',
    filterTags: ['Old Testament', 'New Testament', 'Biblical Theology', 'Storyline', 'Beginner-Friendly'],
    intents: ['whole-bible'],
    status: 'Complete',
    totalSessions: 12,
    difficulty: 'Beginner',
    testament: 'Both',
    bestFor: [
      'People who feel the Bible is disconnected stories with no clear thread',
      'New believers or anyone wanting a foundation for biblical theology',
      'Anyone who wants to understand how the Old and New Testaments fit together',
    ],
    themes: ['Promise', 'Noah', 'Abraham', 'Moses', 'David', 'New Covenant', 'Christ'],
    whyStudy:
      "Covenant is the Bible's primary organizing structure. Understanding how God makes and keeps covenants — from Noah to Abraham to Moses to David to Christ — makes the whole story of Scripture click into place in a way that nothing else quite does.",
    excerpt: "Twelve studies through God's covenants — from Noah to Christ — showing how Scripture tells one unfolding story.",
    outcomes: [
      'Trace covenant from creation to Christ',
      'Understand how promise and fulfillment work across both Testaments',
      'Read the whole Bible as one unified story',
    ],
    roadmap: [
      {
        title: 'What Covenant Means',
        description: 'The concept of covenant — what it is, why it matters, and how it works.',
        sessions: [1, 2],
      },
      {
        title: 'Covenant in the Old Testament',
        description: 'Noah, Abraham, Moses, and David: four covenants that build toward one promise.',
        sessions: [3, 4, 5, 6, 7, 8],
      },
      {
        title: 'Covenant Fulfilled in Christ',
        description: 'The New Covenant arrives — how Jesus fulfills and transforms everything that came before.',
        sessions: [9, 10],
      },
      {
        title: 'Living as Covenant People',
        description: 'What covenant means for life in the church and the world today.',
        sessions: [11, 12],
      },
    ],
    howToUse: [
      'Start at Session 1 — the series builds sequentially',
      'Look for the repeated elements in each covenant: parties, promises, conditions, signs',
      'As you go, keep asking: how does this covenant change or build on what came before?',
      'By the end, read Hebrews 8–10 alongside your notes for a New Testament summary',
    ],
    relatedSeries: ['hebrews', 'old-laws-new-life'],
    recommendedBooks: [],
    startHere: 'the-covenant-1-noahic-covenant',
    nextAfter: 'The Book of Hebrews',
    startHereNote: "Start here if you want the Bible's storyline to make more sense.",
    featured: true,
    priority: 1,
    image: '/images/Teaching Series/Topical/Covenant/The Covenant - Title.jpg',
  },
  {
    slug: 'old-laws-new-life',
    seriesTag: 'Old Laws for a New Life',
    type: 'topical',
    title: 'Old Laws for a New Life',
    subtitle: 'What the Ten Commandments still demand — and promise — for Christians.',
    primaryLane: 'Biblical Theology',
    filterTags: ['Old Testament', 'Law', 'Ethics', 'Christian Living', 'Beginner-Friendly'],
    intents: ['christian-life', 'old-testament'],
    status: 'Complete',
    totalSessions: 10,
    difficulty: 'Beginner',
    testament: 'Old Testament',
    bestFor: [
      "People who aren't sure what to do with Old Testament law as a Christian",
      'Anyone who has questions about the Ten Commandments and Christian ethics',
      'Readers who want to avoid both legalism and easy dismissal of the law',
    ],
    themes: ['The Ten Commandments', 'Law and grace', 'Old Testament ethics', 'Christian living', 'Exodus'],
    whyStudy:
      "The Ten Commandments aren't a checklist for earning God's favor — they're a window into God's character and a guide for human flourishing that still speaks. This series works through each commandment asking: what did it mean then, and what does it demand now?",
    excerpt: "Ten studies through the Ten Commandments — showing how ancient law shapes Christian living.",
    outcomes: [
      'Understand the commandments in their biblical and historical context',
      'Avoid both legalism and easy dismissal of Old Testament law',
      'See how the law forms Christian moral imagination',
    ],
    roadmap: [
      {
        title: 'Who We Worship',
        description: 'The first four commandments concern God — who he is, what he demands, and why it matters.',
        sessions: [1, 2, 3, 4],
      },
      {
        title: 'How We Live Together',
        description: 'The final six commandments concern neighbors — the ethics of life in community under God.',
        sessions: [5, 6, 7, 8, 9, 10],
      },
    ],
    howToUse: [
      'The series follows the Ten Commandments in order, one per session',
      'Read Exodus 20 and Deuteronomy 5 before Session 1 to see the original context',
      'Ask both: what did this command mean in Israel, and what does it mean for Christians?',
      'The first four and the last six commandments have a different focus — notice the shift',
    ],
    relatedSeries: ['the-covenant', 'words-that-change-everything'],
    recommendedBooks: [],
    startHere: 'ten-commandments-1-echad-the-power-of-one',
    nextAfter: 'Words That Change Everything',
    startHereNote: 'Start here if you want to understand what the Ten Commandments still mean for Christians.',
    featured: false,
    priority: 2,
    image: '/images/Teaching Series/Topical/Old Laws for a New Life/Old Laws for a New Life Title.jpg',
  },
  {
    slug: 'words-that-change-everything',
    seriesTag: 'Words That Change Everything',
    type: 'topical',
    title: 'Words That Change Everything',
    subtitle: 'What the Bible actually says, one word at a time.',
    primaryLane: 'Word Studies',
    filterTags: ['Language', 'Greek', 'Hebrew', 'Translation', 'Beginner-Friendly'],
    intents: ['words'],
    status: 'Ongoing',
    totalSessions: 12,
    publishedSessions: 9,
    difficulty: 'Beginner',
    testament: 'Both',
    bestFor: [
      'People who love words, translation, and the details of language',
      'Anyone curious about what a biblical word actually means in Greek or Hebrew',
      'Readers who want fresh insight into familiar passages without needing seminary training',
    ],
    themes: ['Biblical Greek', 'Biblical Hebrew', 'Translation', 'Word study', 'Meaning', 'Scripture'],
    whyStudy:
      "Original language study doesn't require a seminary degree — it requires curiosity and the right tools. Each session in this series takes one key biblical word and shows you what it actually means, how it's been translated, and why that changes the way you read familiar passages.",
    excerpt: "A word-by-word tour of key biblical terms — no seminary required, just curiosity.",
    outcomes: [
      'Understand key biblical words with more precision',
      'See how translation choices shape what we think a passage means',
      'Read familiar passages with fresh attention and new depth',
    ],
    roadmap: [
      {
        title: "Words That Define Who God Is",
        description: 'Key terms that shape our understanding of God\'s character, name, and nature.',
        sessions: [1, 2, 3],
      },
      {
        title: 'Words That Shape Our Identity',
        description: 'Terms that define who we are — as sinners, as the redeemed, as people in community.',
        sessions: [4, 5, 6],
      },
      {
        title: 'Words That Guide How We Live',
        description: 'Ethical and relational language that carries more weight than most translations suggest.',
        sessions: [7, 8, 9],
      },
      {
        title: 'More Sessions Coming',
        description: 'This series is ongoing. Three more sessions are being added.',
        sessions: [10, 11, 12],
      },
    ],
    howToUse: [
      'Each session focuses on a single word — no prior knowledge required',
      'Use a free tool like Blue Letter Bible alongside the sessions if you want to dig further',
      'Take notes on how each word changes your reading of a familiar passage',
      'Sessions are largely independent — start anywhere that interests you',
    ],
    relatedSeries: ['the-covenant', 'hebrews'],
    recommendedBooks: [],
    startHere: 'wtce-1-lost-in-translation',
    nextAfter: 'The Book of Hebrews',
    startHereNote: 'Start here if you like language, translation, and discovering what a word actually means.',
    featured: true,
    priority: 1,
    image: '/images/Teaching Series/Topical/Words That Change Everything/wtce-title.jpg',
  },
]

export function getSeriesBySlug(slug: string): SeriesMetadata | undefined {
  return TEACHING_SERIES.find((s) => s.slug === slug)
}

export function getSeriesByTag(tag: string): SeriesMetadata | undefined {
  return TEACHING_SERIES.find((s) => s.seriesTag === tag)
}

export function getSeriesByLane(lane: TeachingLane): SeriesMetadata[] {
  return TEACHING_SERIES.filter((s) => s.primaryLane === lane).sort((a, b) => a.priority - b.priority)
}

export function getOngoingSeries(): SeriesMetadata[] {
  return TEACHING_SERIES.filter((s) => s.status === 'Ongoing')
}
