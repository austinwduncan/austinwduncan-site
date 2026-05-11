import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Recommended books, tools, and resources for biblical study and Christian life.',
}

type Book = {
  title: string
  author: string
  description: string
}

type Category = {
  label: string
  books: Book[]
}

const categories: Category[] = [
  {
    label: 'Biblical Theology',
    books: [
      {
        title: 'According to Plan',
        author: 'Graeme Goldsworthy',
        description: 'The clearest introduction to biblical theology as a discipline — tracing the unity of Scripture through the kingdom of God.',
      },
      {
        title: 'God and the Nations',
        author: 'Christopher J. H. Wright',
        description: 'A sweeping survey of Old Testament theology with attention to mission, ethics, and the people of God.',
      },
      {
        title: "The King in His Beauty",
        author: 'Thomas R. Schreiner',
        description: 'A comprehensive biblical theology of the Old and New Testaments — dense, careful, and rewarding.',
      },
    ],
  },
  {
    label: 'Systematic Theology',
    books: [
      {
        title: 'Redemption Accomplished and Applied',
        author: 'John Murray',
        description: 'A short, precise, and beautiful treatment of the atonement and the application of salvation.',
      },
      {
        title: 'The Doctrine of God',
        author: 'John Frame',
        description: 'Thorough and accessible — a cornerstone work in Reformed theology of the divine attributes.',
      },
      {
        title: 'The Christian Faith',
        author: 'Michael Horton',
        description: 'A mature, Reformed systematic theology written for the church. Historically grounded and pastorally alert.',
      },
    ],
  },
  {
    label: 'Exegesis & Greek',
    books: [
      {
        title: 'A Primer of Biblical Greek',
        author: 'N. Clayton Croy',
        description: 'The best entry-level New Testament Greek grammar — clear, pedagogically sound, and not overwhelming.',
      },
      {
        title: 'Exegetical Fallacies',
        author: 'D. A. Carson',
        description: 'A short, essential corrective for anyone who handles the text — demonstrates how interpretation goes wrong.',
      },
      {
        title: 'Biblical Words and Their Meaning',
        author: 'Moisés Silva',
        description: 'The standard introduction to biblical lexical semantics. Essential for responsible word study.',
      },
    ],
  },
  {
    label: 'Preaching',
    books: [
      {
        title: 'Preaching and Preachers',
        author: 'D. Martyn Lloyd-Jones',
        description: 'The most stirring and convicting book about preaching ever written. A theology of the preached Word.',
      },
      {
        title: 'Christ-Centered Preaching',
        author: 'Bryan Chapell',
        description: 'A practical and theologically grounded guide to expository preaching. Standard in many seminaries.',
      },
      {
        title: 'The Supremacy of God in Preaching',
        author: 'John Piper',
        description: 'A short argument for God-centeredness in the pulpit — the right vision for preaching ministry.',
      },
    ],
  },
  {
    label: 'Church History',
    books: [
      {
        title: 'The Story of Christianity (2 vols.)',
        author: 'Justo González',
        description: 'The most readable single-author survey of Christian history from the apostolic era to the present.',
      },
      {
        title: 'Church History in Plain Language',
        author: 'Bruce Shelley',
        description: 'A friendly entry point into church history for those new to the subject.',
      },
      {
        title: 'The Reformation',
        author: 'Diarmaid MacCulloch',
        description: 'The definitive scholarly account of the sixteenth-century Reformation — thorough, balanced, and authoritative.',
      },
    ],
  },
]

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
      <div className="mb-12">
        <span
          className="text-[10px] font-semibold tracking-[0.16em] uppercase"
          style={{ color: '#cdb079' }}
        >
          Resources
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
          Recommended Reading
        </h1>
        <p className="mt-3 text-base text-zinc-500 max-w-xl">
          Books I return to, recommend to others, and keep within reach. Organized by subject.
        </p>
      </div>

      <div className="space-y-14">
        {categories.map((cat) => (
          <section key={cat.label}>
            <div
              className="flex items-center gap-3 mb-8 pb-3"
              style={{ borderBottom: '2px solid #cdb079' }}
            >
              <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-zinc-900">
                {cat.label}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.books.map((book) => (
                <div
                  key={book.title}
                  className="border border-zinc-100 p-6"
                >
                  <p className="text-base font-semibold leading-snug tracking-tight text-zinc-900 mb-1">
                    {book.title}
                  </p>
                  <p
                    className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-3"
                    style={{ color: '#cdb079' }}
                  >
                    {book.author}
                  </p>
                  <p className="text-sm text-zinc-500 leading-relaxed">{book.description}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
