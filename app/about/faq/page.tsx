import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — Austin W. Duncan',
  description: 'Common questions about Austin W. Duncan and his ministry.',
}

type FAQ = {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: 'Who is Austin Duncan?',
    answer: "I'm an associate pastor serving at Crosswalk Church in Brentwood, Tennessee. My ministry focuses on preaching, teaching, and helping people know God's Word, grow in their faith, and share the gospel with others.",
  },
  {
    question: 'How often do you publish content?',
    answer: 'I publish content throughout the week across a few different series. My main weekly series are Biblical Teaching Series on Tuesdays and Word for Word on Wednesdays. Exegetica is usually published on the first Friday of each month, and Forum & Pulpit articles are published as major cultural or world events call for biblical reflection.',
  },
  {
    question: 'What Bible translation do you use?',
    answer: 'I use several trusted Bible translations, including the ESV, NIV, NASB, and NLT, depending on the context. That said, the ESV is the translation I use most often.',
  },
  {
    question: 'Can I use your sermon notes or articles in a group?',
    answer: 'Yes. You\'re welcome to use my sermon notes or articles for non-commercial church, ministry, or small group use with attribution to "Austin W. Duncan" and austinwduncan.com. For republication, paid use, or broader distribution, please reach out first.',
  },
  {
    question: 'Do you offer pastoral counseling?',
    answer: "I'm not a licensed counselor, but I do provide biblical guidance, pastoral care, and prayer as I'm able on a case-by-case basis. When a situation calls for ongoing counseling or specialized clinical care, I'm glad to recommend trusted licensed counselors. If you'd like to request a meeting, use the contact form and include a brief summary along with your availability.",
  },
  {
    question: 'Do you perform weddings, funerals, or baptisms?',
    answer: 'Yes, as part of my pastoral ministry in the life of the church I serve. I typically handle those requests within a local church context rather than offering them as general services apart from church relationship and connection.',
  },
  {
    question: 'Do you do guest speaking, teaching, or preaching?',
    answer: "Yes, I consider guest preaching, teaching, and speaking invitations on a case-by-case basis. If you'd like to make a request, please include the date, location, topic, and best contact information in your message.",
  },
]

export default function FAQPage() {
  return (
    <>
      <div style={{ background: '#141210' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-14">
          <div
            className="pb-10 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div
              className="flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.12em] uppercase mb-3"
              style={{ color: '#B8892E' }}
            >
              <span className="inline-block h-px w-[18px]" style={{ background: '#B8892E' }} />
              About
            </div>
            <h1
              className="leading-[1.1] tracking-tight"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(2.2rem, 3.5vw, 3rem)',
                fontWeight: 400,
                color: '#F9F6F0',
              }}
            >
              Frequently Asked Questions
            </h1>
          </div>
        </div>
      </div>

      <div
        className="h-[14px] w-full"
        style={{
          backgroundColor: '#7A5C1E',
          backgroundImage: `
            repeating-linear-gradient(60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px),
            repeating-linear-gradient(-60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px)
          `,
        }}
      />

      <div style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[780px] px-6 lg:px-8 py-16">
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div key={i}>
                <div className="py-9">
                  <h2
                    className="mb-4 leading-[1.25]"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '1.3rem',
                      fontWeight: 400,
                      color: '#1A1714',
                    }}
                  >
                    {faq.question}
                  </h2>
                  <p
                    className="text-[0.95rem] leading-relaxed"
                    style={{
                      fontFamily: 'var(--font-source-serif)',
                      color: '#5A544C',
                    }}
                  >
                    {faq.answer}
                  </p>
                </div>
                {i < faqs.length - 1 && (
                  <div className="h-px w-full" style={{ background: '#E2DACE' }} />
                )}
              </div>
            ))}
          </div>

          <div className="mt-14 pt-8 border-t" style={{ borderColor: '#E2DACE' }}>
            <Link
              href="/about"
              className="text-[0.8rem] transition-colors hover:text-[#7A5C1E]"
              style={{ color: '#9A9189' }}
            >
              ← Back to About
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
