import type { Metadata } from 'next'
import Link from 'next/link'
import { AboutHero } from '@/components/about-hero'
import { AboutBioHeadshot } from '@/components/about-bio-headshot'
import {
  ACCENT,
  BODY_FONT,
  Eyebrow,
  H2_SIZE,
  H3_SIZE,
  INK,
  LIGHT_GRAY,
  PRIMARY,
  PRIMARY_DEEP,
  RULE,
  SOFT_BLUE,
  SOFT_BLUE_LIGHT,
  WHITE,
  display,
} from './ui'

export const metadata: Metadata = {
  title: 'About',
  description: 'Pastor, teacher, and student of Holy Scripture.',
}


const MISSION = [
  { n: '01', title: 'Reach the Lost',      body: 'Locally, nationally, and internationally.',   ref: 'Mark 16:15 · Acts 1:8' },
  { n: '02', title: 'Care for the Reached', body: 'With intentionality and faithfulness.',        ref: 'Acts 20:28' },
  { n: '03', title: 'Train Others',         body: 'To be effective in their own ministries.',    ref: 'Eph. 4:12' },
  { n: '04', title: 'Encourage Believers',  body: 'Toward faithful and wholehearted action.',    ref: 'Eph. 6:7' },
]

/*
  Where Austin has served, newest first. Facts as he gave them on 2026-10-01
  ("about nine years on staff, a little over five as a pastor" is as of that
  date and will need updating). Do not add duties, dates or places he did not
  supply.
*/
const EXPERIENCE = [
  {
    when: '2021 to present',
    role: 'Associate Pastor',
    where: 'Crosswalk Church, Brentwood, Tennessee',
    note: 'Preaching, teaching, and helping people know God’s Word, grow in their faith, and share the gospel with others.',
  },
  {
    when: '2018 to 2021',
    role: 'Communications Director',
    where: 'Crosswalk Church, Brentwood, Tennessee',
    note: '',
  },
  {
    when: 'About six months',
    role: 'Intern and Graphic Designer',
    where: 'Central Church',
    note: 'About three months in each role.',
  },
  {
    when: '2013 to 2018',
    role: 'Volunteer',
    where: 'Hillside Christian Church, Lubbock, Texas',
    note: 'Served wherever there was a need while discerning a call to ministry: children’s ministry, youth ministry, the worship team, the tech team, graphics, lighting, and set up and tear down.',
  },
]

/* The four paragraphs below are Austin's own wording (2026-10-01). Do not edit them. */
const DEGREES = [
  {
    school: "Texas Tech University",
    degree: "Bachelor of Fine Arts in Studio Art",
    focus: "Digital Printmaking and Photography",
    serves:
      "Austin’s formation as a pastor began, in part, in the studio. Studying printmaking and photography cultivated habits of close observation, patience, and thoughtful revision. Those habits continue to shape how he approaches Scripture and prepares to preach, giving a passage time to challenge his first impressions and taking care with the words he uses to help others understand it.",
  },
  {
    school: "The Art Institute of Dallas",
    degree: "Master of Arts in Design and Media Management",
    focus: "",
    serves:
      "Austin’s study of design and media management shaped the way he thinks about communication and the people behind it. In ministry, clarity is a way of caring for people: helping them understand, participate, and find their place. This training also informs how he leads creative teams and volunteers, offering direction while making room for the experience and imagination others bring.",
  },
  {
    school: "Villanova University",
    degree: "Advanced Master’s Certification",
    focus: "Strategic Project Management",
    serves:
      "Austin’s training in strategic project management gives practical shape to his sense of stewardship. Ministry depends on people who offer their time, trust, and resources, and honoring those gifts takes preparation and consistent attention. He brings that conviction to planning with ministry teams, setting shared priorities, and helping people understand how their contributions fit into the work they are doing together.",
  },
  {
    school: "Bethel Theological Seminary",
    degree: "Master of Divinity",
    focus: "In progress · St. Paul, Minnesota",
    serves:
      "Austin’s ongoing studies at Bethel Seminary deepen the biblical and theological foundations of his ministry. Coursework in Scripture, theology, biblical languages, and pastoral care informs his preaching and teaching as he learns. Studying with faculty and fellow students also keeps him in the posture of a learner, open to correction, attentive to difficult questions, and accountable for the way he interprets and teaches Scripture.",
  },
]

const QUOTE =
  'It’s my desire that while in service to others, my life reflects a total reliance on God, so that others may find hope in Him.'

const bodyStyle = { fontFamily: BODY_FONT }

export default function AboutPage() {
  return (
    <>
      {/* HERO */}
      <AboutHero />

      {/* BIO */}
      <section style={{ background: WHITE }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-[1fr_300px] gap-14 lg:gap-20 items-start">
            <div>
              <Eyebrow>Biography</Eyebrow>

              <div
                className="mt-10 space-y-6 text-[1rem] leading-[1.9]"
                style={{ ...bodyStyle, color: PRIMARY }}
              >
                <p className="text-[1.15rem] leading-[1.8]" style={{ color: INK }}>
                  Austin is the Associate Pastor of Crosswalk Church in Brentwood, TN, a church
                  dedicated to helping others find hope in Jesus Christ.
                </p>
                <p>
                  Austin, alongside his wife Cassy, resides in Middle Tennessee. Together they share
                  a life enriched by faith, creativity, and a deep commitment to community.
                </p>
                <p>
                  He has served on church staffs for about nine years, a little over five of them
                  as a pastor.
                </p>
                <p>
                  With a heart firmly set on making a meaningful impact, Austin dedicates himself to
                  multiple facets of outreach and ministry: reaching the lost, caring for those
                  reached, equipping others for ministry, and encouraging believers to faithful
                  action.
                </p>
              </div>

              <blockquote
                className="mt-10 pl-5 text-[1rem] leading-[1.85] italic"
                style={{ ...bodyStyle, color: PRIMARY, borderLeft: `2px solid ${SOFT_BLUE}` }}
              >
                &ldquo;{QUOTE}&rdquo;
              </blockquote>
            </div>

            {/* Right column: portrait */}
            <AboutBioHeadshot />
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section style={{ background: PRIMARY_DEEP }}>
        <div className="mx-auto max-w-[900px] px-8 py-24 lg:py-36 text-center">
          <div className="mb-10 inline-block h-px w-12" style={{ background: SOFT_BLUE }} />
          <blockquote
            style={{
              fontFamily: BODY_FONT,
              fontSize: 'clamp(1.6rem, 3.2vw, 2.6rem)',
              fontWeight: 300,
              lineHeight: 1.35,
              color: WHITE,
            }}
          >
            &ldquo;{QUOTE}&rdquo;
          </blockquote>
        </div>
      </section>

      {/* MISSION */}
      <section style={{ background: WHITE }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-24 lg:py-32">
          <Eyebrow>Mission</Eyebrow>
          <h2 className="mt-6 mb-14" style={display(H2_SIZE, INK)}>
            Four Commitments
          </h2>

          <div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden border"
            style={{ background: RULE, borderColor: RULE }}
          >
            {MISSION.map((m) => (
              <div key={m.n} className="flex flex-col p-7 lg:p-8" style={{ background: WHITE }}>
                <div style={display('1.5rem', SOFT_BLUE)}>{m.n}</div>
                <h3 className="mt-5" style={display('1.5rem', INK)}>
                  {m.title}
                </h3>
                <p
                  className="mt-3 flex-1 text-[0.95rem] leading-relaxed"
                  style={{ ...bodyStyle, color: PRIMARY }}
                >
                  {m.body}
                </p>
                <p
                  className="mt-6 text-[0.72rem] font-semibold tracking-[0.14em] uppercase"
                  style={{ ...bodyStyle, color: ACCENT }}
                >
                  {m.ref}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section style={{ background: PRIMARY_DEEP }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-24 lg:py-32">
          <Eyebrow dark>Experience</Eyebrow>
          <h2 className="mt-6 max-w-[760px]" style={display(H2_SIZE, WHITE)}>
            Where Austin has served
          </h2>
          <p
            className="mt-6 mb-12 max-w-[640px] text-[1.05rem] leading-[1.8]"
            style={{ ...bodyStyle, color: 'rgba(255,255,255,0.78)' }}
          >
            About nine years on church staffs, a little over five of them as a pastor, after five
            years of volunteering in nearly every part of a church.
          </p>

          <ol style={{ borderTop: '2px solid rgba(255,255,255,0.5)' }}>
            {EXPERIENCE.map((e) => (
              <li
                key={e.role + e.where}
                className="grid gap-3 py-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,9fr)] lg:gap-12"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.14)' }}
              >
                <p style={display('1.5rem', SOFT_BLUE_LIGHT)}>{e.when}</p>
                <div>
                  <h3 style={display(H3_SIZE, WHITE)}>{e.role}</h3>
                  <p className="mt-2 text-[0.95rem] font-semibold" style={{ ...bodyStyle, color: SOFT_BLUE_LIGHT }}>
                    {e.where}
                  </p>
                  {e.note && (
                    <p
                      className="mt-3 max-w-[62ch] text-[1rem] leading-[1.8]"
                      style={{ ...bodyStyle, color: 'rgba(255,255,255,0.78)' }}
                    >
                      {e.note}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* EDUCATION */}
      <section style={{ background: LIGHT_GRAY }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-24 lg:py-32">
          <Eyebrow>Training</Eyebrow>
          <h2 className="mt-6 max-w-[760px]" style={display(H2_SIZE, INK)}>
            What Austin studied, and why it matters in a church
          </h2>
          <p
            className="mt-6 mb-14 max-w-[640px] text-[1.05rem] leading-[1.8]"
            style={{ ...bodyStyle, color: PRIMARY }}
          >
            Art, design, project management, and now seminary. Each one shapes how he serves a church.
          </p>

          <div className="space-y-4">
            {DEGREES.map((d, i) => (
              <article
                key={d.school}
                className="grid gap-6 border p-7 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:p-10"
                style={{ background: WHITE, borderColor: RULE }}
              >
                <div>
                  <div className="flex items-baseline gap-4">
                    <span style={display('1.5rem', SOFT_BLUE)}>{String(i + 1).padStart(2, '0')}</span>
                    <p
                      className="text-[0.72rem] font-semibold tracking-[0.16em] uppercase"
                      style={{ ...bodyStyle, color: ACCENT }}
                    >
                      {d.school}
                    </p>
                  </div>
                  <h3 className="mt-4" style={display(H3_SIZE, INK)}>
                    {d.degree}
                  </h3>
                  {d.focus && (
                    <p className="mt-3 text-[0.9rem] leading-relaxed" style={{ ...bodyStyle, color: PRIMARY }}>
                      {d.focus}
                    </p>
                  )}
                </div>
                <p className="text-[1rem] leading-[1.8]" style={{ ...bodyStyle, color: INK }}>
                  {d.serves}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* BELIEFS + VALUES */}
      <section style={{ background: PRIMARY_DEEP }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-24 lg:py-32">
          <Eyebrow dark>Doctrine &amp; Practice</Eyebrow>
          <h2 className="mt-6 mb-14 max-w-[760px]" style={display(H2_SIZE, WHITE)}>
            What Austin Believes &amp; How He Serves
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                href: '/about/beliefs',
                tag: 'Statement of Faith',
                title: 'Austin’s Beliefs',
                desc: 'A full statement of faith across Scripture, God, Christ, the Spirit, salvation, the church, and last things.',
              },
              {
                href: '/about/values',
                tag: 'Ministry Values',
                title: 'Austin’s Values',
                desc: 'Eight commitments that shape the way Austin approaches preaching, leadership, and pastoral care.',
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col justify-between p-8 lg:p-10 border transition-colors duration-300 hover:border-[#7B9BB5] hover:bg-[#3D484C]"
                style={{ borderColor: 'rgba(255,255,255,0.14)', minHeight: 240 }}
              >
                <div>
                  <div
                    className="text-[0.72rem] font-semibold tracking-[0.18em] uppercase mb-5"
                    style={{ ...bodyStyle, color: SOFT_BLUE_LIGHT }}
                  >
                    {card.tag}
                  </div>
                  <h3 style={display('clamp(1.7rem, 2.4vw, 2.1rem)', WHITE)}>{card.title}</h3>
                  <p
                    className="mt-4 text-[0.95rem] leading-relaxed"
                    style={{ ...bodyStyle, color: 'rgba(255,255,255,0.78)' }}
                  >
                    {card.desc}
                  </p>
                </div>
                <div
                  className="mt-8 flex items-center gap-2 text-[0.78rem] font-semibold tracking-[0.14em] uppercase"
                  style={{ ...bodyStyle, color: SOFT_BLUE_LIGHT }}
                >
                  Read
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/about/faq"
              className="text-[0.85rem] font-medium tracking-[0.04em] transition-colors hover:text-white"
              style={{ ...bodyStyle, color: SOFT_BLUE_LIGHT }}
            >
              Frequently Asked Questions →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
