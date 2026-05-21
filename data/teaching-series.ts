export const TEACHING_LANES = ['Bible Book Studies', 'Biblical Theology', 'Word Studies'] as const
export type TeachingLane = (typeof TEACHING_LANES)[number]

export type SeriesStatus = 'Complete' | 'Ongoing'

export type SeriesMetadata = {
  seriesTag: string        // matches the last tag in session frontmatter
  type: 'expositional' | 'topical'
  title: string
  primaryLane: TeachingLane
  filterTags: string[]     // powers "Help Me Choose" matching
  status: SeriesStatus
  totalSessions: number
  publishedSessions?: number // for Ongoing series
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  bestFor: string[]
  themes: string[]
  whyStudy: string
  excerpt: string          // one-sentence pitch
  startHere: string        // first session slug
  featured: boolean
  priority: number         // lower = higher priority within lane
  image: string
  startHereNote: string    // "Start here if..." recommendation text
}

export const TEACHING_SERIES: SeriesMetadata[] = [
  {
    seriesTag: 'The Book of Hebrews',
    type: 'expositional',
    title: 'The Book of Hebrews',
    primaryLane: 'Bible Book Studies',
    filterTags: ['New Testament', 'Bible Book', 'Christology', 'Perseverance'],
    status: 'Complete',
    totalSessions: 13,
    difficulty: 'Intermediate',
    bestFor: [
      'Christians who feel spiritually tired or discouraged',
      'Anyone wanting to understand Jesus as high priest',
      'People confused by the warning passages',
    ],
    themes: ['Jesus as better', 'Priesthood', 'Sacrifice', 'Perseverance', 'Faith', 'Covenant'],
    whyStudy:
      "Hebrews helps Christians see why Jesus is better than every shadow, sacrifice, priest, and promise that came before him — and why that matters for how you live right now.",
    excerpt: "Jesus is better. Better than angels, priests, and sacrifices — and Hebrews shows you exactly why.",
    startHere: 'hebrews-1',
    startHereNote: 'Start here for a Christ-centered New Testament study.',
    featured: true,
    priority: 1,
    image: '/images/Teaching Series/Expositional/The Book of Hebrews/1-4.jpg',
  },
  {
    seriesTag: 'The Book of Daniel',
    type: 'expositional',
    title: 'The Book of Daniel',
    primaryLane: 'Bible Book Studies',
    filterTags: ['Old Testament', 'Bible Book', 'Prophets', 'Sovereignty', 'Exile'],
    status: 'Complete',
    totalSessions: 12,
    difficulty: 'Intermediate',
    bestFor: [
      'Christians navigating a hostile or indifferent culture',
      'Anyone wrestling with whether God is still in control',
      'Readers who want to understand biblical apocalyptic',
    ],
    themes: ['Faithfulness', 'Exile', 'God\'s sovereignty', 'Kingdoms', 'Courage', 'Apocalyptic vision'],
    whyStudy:
      "Daniel shows how to live faithfully when everything around you is working against faith — and how to trust God's sovereignty when his plans look nothing like you expected.",
    excerpt: "Faithfulness under pressure, God's sovereignty over kingdoms, and courage in exile.",
    startHere: 'daniel-1-faithfulness-in-exile',
    startHereNote: 'Start here for faithfulness, exile, kingdoms, and courage.',
    featured: true,
    priority: 2,
    image: '/images/Teaching Series/Expositional/The Book of Daniel/The Book of Daniel - Chapter 1.jpg',
  },
  {
    seriesTag: 'The Minor Prophets',
    type: 'expositional',
    title: 'The Minor Prophets',
    primaryLane: 'Bible Book Studies',
    filterTags: ['Old Testament', 'Bible Book', 'Prophets', 'Justice', 'Redemption'],
    status: 'Complete',
    totalSessions: 13,
    difficulty: 'Intermediate',
    bestFor: [
      'Anyone who finds the prophets confusing or hard to apply',
      'Christians wanting to understand God\'s justice and love together',
      'Readers ready to work through a whole section of the Old Testament',
    ],
    themes: ['Covenant faithfulness', 'God\'s justice', 'Redemption', 'The Day of the Lord', 'Love', 'Return'],
    whyStudy:
      "These twelve books are not minor in importance — they're twelve distinct windows into what God wants from his people and what he promises to do in the end.",
    excerpt: "Thirteen studies through all twelve Minor Prophets — God's justice and love in vivid detail.",
    startHere: 'the-minor-prophets-1-hosea',
    startHereNote: 'Start here if you want to understand the prophets as more than scattered judgment speeches.',
    featured: true,
    priority: 3,
    image: '/images/Teaching Series/Expositional/The Minor Prophets/2 - Hosea.jpg',
  },
  {
    seriesTag: 'The Covenant',
    type: 'topical',
    title: 'The Covenant',
    primaryLane: 'Biblical Theology',
    filterTags: ['Old Testament', 'New Testament', 'Biblical Theology', 'Storyline', 'Beginner-Friendly'],
    status: 'Complete',
    totalSessions: 12,
    difficulty: 'Beginner',
    bestFor: [
      'People who want the Bible to feel like one connected story',
      'Anyone confused by how the Old and New Testaments relate',
      'Christians new to biblical theology',
    ],
    themes: ['Promise', 'Noah', 'Abraham', 'Moses', 'David', 'New Covenant', 'Christ'],
    whyStudy:
      "Covenant is one of the Bible's main organizing principles. Understanding it makes the whole story of Scripture click into place.",
    excerpt: "Twelve studies through God's covenants — from Noah to Christ — showing how Scripture tells one unfolding story.",
    startHere: 'the-covenant-1-noahic-covenant',
    startHereNote: 'Start here if you want the Bible\'s storyline to make more sense.',
    featured: true,
    priority: 1,
    image: '/images/Teaching Series/Topical/Covenant/The Covenant - Week 1.jpg',
  },
  {
    seriesTag: 'Old Laws for a New Life',
    type: 'topical',
    title: 'Old Laws for a New Life',
    primaryLane: 'Biblical Theology',
    filterTags: ['Old Testament', 'Law', 'Ethics', 'Christian Living', 'Beginner-Friendly'],
    status: 'Complete',
    totalSessions: 10,
    difficulty: 'Beginner',
    bestFor: [
      'Christians wondering what the Ten Commandments have to do with them',
      'Anyone who thinks the Law is just for Israel',
      'People wanting a grounded biblical ethic for everyday life',
    ],
    themes: ['The Ten Commandments', 'Law and grace', 'Old Testament ethics', 'Christian living', 'Exodus'],
    whyStudy:
      "The Ten Commandments aren't outdated rules — they're a window into God's character and a practical guide for human flourishing that still speaks today.",
    excerpt: "Ten studies through the Ten Commandments — showing how ancient law shapes Christian living.",
    startHere: 'ten-commandments-1-echad-the-power-of-one',
    startHereNote: 'Start here if you want to understand the Ten Commandments and what they still mean for Christians.',
    featured: false,
    priority: 2,
    image: '/images/Teaching Series/Topical/Old Laws for a New Life/Commandment 1.jpg',
  },
  {
    seriesTag: 'Words That Change Everything',
    type: 'topical',
    title: 'Words That Change Everything',
    primaryLane: 'Word Studies',
    filterTags: ['Language', 'Greek', 'Hebrew', 'Translation', 'Beginner-Friendly'],
    status: 'Ongoing',
    totalSessions: 12,
    publishedSessions: 9,
    difficulty: 'Beginner',
    bestFor: [
      'People who love language, translation, and "wait, that\'s what that means?" moments',
      'Christians who want to understand what words actually mean in the original languages',
      'Anyone who wants to work with the biblical text without a seminary degree',
    ],
    themes: ['Biblical Greek', 'Biblical Hebrew', 'Translation', 'Word study', 'Meaning', 'Scripture'],
    whyStudy:
      "Original language study doesn't require a seminary degree. This series shows you how to work with the biblical text using tools anyone can access.",
    excerpt: "A word-by-word tour of key biblical terms — no seminary required, just curiosity.",
    startHere: 'wtce-1-lost-in-translation',
    startHereNote: 'Start here if you like language, translation, and discovering what a word actually means.',
    featured: true,
    priority: 1,
    image: '/images/Teaching Series/Topical/Words That Change Everything/wtce-w1.jpg',
  },
]

export function getSeriesByTag(tag: string): SeriesMetadata | undefined {
  return TEACHING_SERIES.find((s) => s.seriesTag === tag)
}

export function getSeriesByLane(lane: TeachingLane): SeriesMetadata[] {
  return TEACHING_SERIES.filter((s) => s.primaryLane === lane).sort((a, b) => a.priority - b.priority)
}

export function getOngoingSeries(): SeriesMetadata[] {
  return TEACHING_SERIES.filter((s) => s.status === 'Ongoing')
}

export function getFeaturedSeries(): SeriesMetadata[] {
  return TEACHING_SERIES.filter((s) => s.featured).sort((a, b) => a.priority - b.priority)
}
