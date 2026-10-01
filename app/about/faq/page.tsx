import type { Metadata } from 'next'
import { BODY_FONT, BackToAbout, H3_SIZE, INK, PRIMARY, RULE, SubpageHeader, WHITE, display } from '../ui'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
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
      <SubpageHeader title="Frequently Asked Questions" />

      <section style={{ background: WHITE }}>
        <div className="mx-auto max-w-[780px] px-6 lg:px-8 py-20 lg:py-28">
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div key={i}>
                <div className="py-10 lg:py-12">
                  <h2 className="mb-4" style={display(H3_SIZE, INK)}>
                    {faq.question}
                  </h2>
                  <p
                    className="text-[1rem] leading-[1.8]"
                    style={{ fontFamily: BODY_FONT, color: PRIMARY }}
                  >
                    {faq.answer}
                  </p>
                </div>
                {i < faqs.length - 1 && (
                  <div className="h-px w-full" style={{ background: RULE }} />
                )}
              </div>
            ))}
          </div>

          <BackToAbout />
        </div>
      </section>
    </>
  )
}
