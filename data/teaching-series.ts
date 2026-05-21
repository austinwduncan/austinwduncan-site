export const TEACHING_LANES = ['Bible Book Studies', 'Biblical Theology', 'Word Studies'] as const
export type TeachingLane = (typeof TEACHING_LANES)[number]

export type SeriesStatus = 'Complete' | 'Ongoing'

export type SeriesMetadata = {
  slug: string             // URL slug for /teaching/series/[slug] landing page
  seriesTag: string        // matches the last tag in session frontmatter
  type: 'expositional' | 'topical'
  title: string
  primaryLane: TeachingLane
  filterTags: string[]     // powers legacy "Help Me Choose" matching
  intents: string[]        // chooser intent IDs this series answers
  status: SeriesStatus
  totalSessions: number
  publishedSessions?: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  bestFor: string
  themes: string[]
  whyStudy: string
  excerpt: string
  outcomes: string[]
  startHere: string
  nextAfter: string        // title of recommended series to read next
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
    primaryLane: 'Bible Book Studies',
    filterTags: ['New Testament', 'Bible Book', 'Christology', 'Perseverance'],
    intents: ['see-jesus'],
    status: 'Complete',
    totalSessions: 13,
    difficulty: 'Intermediate',
    bestFor: 'Christians who feel tempted to drift, grow tired, or treat Jesus as familiar rather than final.',
    themes: ['Jesus as better', 'Priesthood', 'Sacrifice', 'Perseverance', 'Faith', 'Covenant'],
    whyStudy:
      "Hebrews helps Christians see why Jesus is better than every shadow, sacrifice, priest, and promise that came before him — and why that matters for how you live right now.",
    excerpt: "Jesus is better. Better than angels, priests, and sacrifices — and Hebrews shows you exactly why.",
    outcomes: [
      'See how the Old Testament points to Christ',
      'Understand Jesus as the final priest and sacrifice',
      'Make sense of the warning passages in Hebrews',
    ],
    startHere: 'hebrews-1',
    nextAfter: 'The Covenant',
    startHereNote: 'Start here for a Christ-centered New Testament study.',
    featured: true,
    priority: 1,
    image: '/images/Teaching Series/Expositional/The Book of Hebrews/1-4.jpg',
  },
  {
    slug: 'daniel',
    seriesTag: 'The Book of Daniel',
    type: 'expositional',
    title: 'The Book of Daniel',
    primaryLane: 'Bible Book Studies',
    filterTags: ['Old Testament', 'Bible Book', 'Prophets', 'Sovereignty', 'Exile'],
    intents: ['faith-pressure', 'old-testament'],
    status: 'Complete',
    totalSessions: 12,
    difficulty: 'Intermediate',
    bestFor: 'People trying to understand courage, compromise, political pressure, and the rule of God over arrogant kingdoms.',
    themes: ['Faithfulness', 'Exile', 'God\'s sovereignty', 'Kingdoms', 'Courage', 'Apocalyptic vision'],
    whyStudy:
      "Daniel shows how to live faithfully when everything around you is working against faith — and how to trust God's sovereignty when his plans look nothing like you expected.",
    excerpt: "Faithfulness under pressure, God's sovereignty over kingdoms, and courage in exile.",
    outcomes: [
      'Understand faithfulness in cultural and spiritual exile',
      'Trace the rise and fall of human kingdoms under God\'s rule',
      'Read Daniel\'s visions with more care and context',
    ],
    startHere: 'daniel-1-faithfulness-in-exile',
    nextAfter: 'The Minor Prophets',
    startHereNote: 'Start here for faithfulness, exile, kingdoms, and courage.',
    featured: true,
    priority: 2,
    image: '/images/Teaching Series/Expositional/The Book of Daniel/The Book of Daniel - Chapter 1.jpg',
  },
  {
    slug: 'minor-prophets',
    seriesTag: 'The Minor Prophets',
    type: 'expositional',
    title: 'The Minor Prophets',
    primaryLane: 'Bible Book Studies',
    filterTags: ['Old Testament', 'Bible Book', 'Prophets', 'Justice', 'Redemption'],
    intents: ['old-testament'],
    status: 'Complete',
    totalSessions: 13,
    difficulty: 'Intermediate',
    bestFor: 'Readers who want to understand the prophets without treating them as disconnected fragments or filler material.',
    themes: ['Covenant faithfulness', 'God\'s justice', 'Redemption', 'The Day of the Lord', 'Love', 'Return'],
    whyStudy:
      "These twelve books are not minor in importance — they're twelve distinct windows into what God wants from his people and what he promises to do in the end.",
    excerpt: "Thirteen studies through all twelve Minor Prophets — God's justice and love in vivid detail.",
    outcomes: [
      'Understand each prophet in their historical context',
      'Recognize recurring themes of judgment and restoration',
      'See why the prophets still expose and challenge us today',
    ],
    startHere: 'the-minor-prophets-1-hosea',
    nextAfter: 'The Covenant',
    startHereNote: 'Start here if you want to understand the prophets as more than scattered judgment speeches.',
    featured: true,
    priority: 3,
    image: '/images/Teaching Series/Expositional/The Minor Prophets/2 - Hosea.jpg',
  },
  {
    slug: 'the-covenant',
    seriesTag: 'The Covenant',
    type: 'topical',
    title: 'The Covenant',
    primaryLane: 'Biblical Theology',
    filterTags: ['Old Testament', 'New Testament', 'Biblical Theology', 'Storyline', 'Beginner-Friendly'],
    intents: ['whole-bible'],
    status: 'Complete',
    totalSessions: 12,
    difficulty: 'Beginner',
    bestFor: 'People who want the Bible to feel less like disconnected stories and more like one unfolding story.',
    themes: ['Promise', 'Noah', 'Abraham', 'Moses', 'David', 'New Covenant', 'Christ'],
    whyStudy:
      "Covenant is one of the Bible's main organizing principles. Understanding it makes the whole story of Scripture click into place.",
    excerpt: "Twelve studies through God's covenants — from Noah to Christ — showing how Scripture tells one unfolding story.",
    outcomes: [
      'Trace covenant from creation to Christ',
      'Understand how promise and fulfillment work across Testaments',
      'Read the whole Bible as one unified story',
    ],
    startHere: 'the-covenant-1-noahic-covenant',
    nextAfter: 'The Book of Hebrews',
    startHereNote: 'Start here if you want the Bible\'s storyline to make more sense.',
    featured: true,
    priority: 1,
    image: '/images/Teaching Series/Topical/Covenant/The Covenant - Week 1.jpg',
  },
  {
    slug: 'old-laws-new-life',
    seriesTag: 'Old Laws for a New Life',
    type: 'topical',
    title: 'Old Laws for a New Life',
    primaryLane: 'Biblical Theology',
    filterTags: ['Old Testament', 'Law', 'Ethics', 'Christian Living', 'Beginner-Friendly'],
    intents: ['christian-life', 'old-testament'],
    status: 'Complete',
    totalSessions: 10,
    difficulty: 'Beginner',
    bestFor: 'People who want to understand Old Testament law without flattening it into legalism or irrelevance.',
    themes: ['The Ten Commandments', 'Law and grace', 'Old Testament ethics', 'Christian living', 'Exodus'],
    whyStudy:
      "The Ten Commandments aren't outdated rules — they're a window into God's character and a practical guide for human flourishing that still speaks today.",
    excerpt: "Ten studies through the Ten Commandments — showing how ancient law shapes Christian living.",
    outcomes: [
      'Understand the commandments in their biblical and historical context',
      'Avoid both legalism and easy dismissal of Old Testament law',
      'See how the law forms Christian moral imagination',
    ],
    startHere: 'ten-commandments-1-echad-the-power-of-one',
    nextAfter: 'Words That Change Everything',
    startHereNote: 'Start here if you want to understand what the Ten Commandments still mean for Christians.',
    featured: false,
    priority: 2,
    image: '/images/Teaching Series/Topical/Old Laws for a New Life/Commandment 1.jpg',
  },
  {
    slug: 'words-that-change-everything',
    seriesTag: 'Words That Change Everything',
    type: 'topical',
    title: 'Words That Change Everything',
    primaryLane: 'Word Studies',
    filterTags: ['Language', 'Greek', 'Hebrew', 'Translation', 'Beginner-Friendly'],
    intents: ['words'],
    status: 'Ongoing',
    totalSessions: 12,
    publishedSessions: 9,
    difficulty: 'Beginner',
    bestFor: 'People who love language, translation questions, and those "wait — that\'s what that means?" moments reading Scripture.',
    themes: ['Biblical Greek', 'Biblical Hebrew', 'Translation', 'Word study', 'Meaning', 'Scripture'],
    whyStudy:
      "Original language study doesn't require a seminary degree. This series shows you how to work with the biblical text using tools anyone can access.",
    excerpt: "A word-by-word tour of key biblical terms — no seminary required, just curiosity.",
    outcomes: [
      'Understand key biblical words with more precision',
      'See how translation choices shape what we think a passage means',
      'Read familiar passages with fresh attention and new depth',
    ],
    startHere: 'wtce-1-lost-in-translation',
    nextAfter: 'The Book of Hebrews',
    startHereNote: 'Start here if you like language, translation, and discovering what a word actually means.',
    featured: true,
    priority: 1,
    image: '/images/Teaching Series/Topical/Words That Change Everything/wtce-w1.jpg',
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
