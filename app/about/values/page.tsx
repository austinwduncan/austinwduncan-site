import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Austin's Values — Austin W. Duncan",
  description: 'How I approach ministry.',
}

type Value = {
  number: string
  title: string
  paragraphs: [string, string]
  refs: string
}

const values: Value[] = [
  {
    number: '01',
    title: 'Commitment to Biblical Exposition',
    paragraphs: [
      'I am committed to preaching and teaching the Bible faithfully, clearly, and helpfully. I believe Scripture is God\'s inspired Word, the final authority for faith and practice, and the clearest guide for the life of the church. Because of that, I want my ministry to be shaped by what God has said, not by trends, preference, or pressure.',
      'I also believe the Bible is never outdated. It is timeless in truth and timely in application. God\'s Word speaks to the deepest needs of every human heart and to the real questions people face today. So I want to teach the Bible in a way that is both careful and clear, rooted in sound doctrine and connected to everyday life, so that people are equipped to follow Christ in every sphere of life.',
    ],
    refs: '2 Timothy 3:16–17; 2 Peter 1:20–21; Nehemiah 8:8; Psalm 119:105; Ephesians 4:11–13',
  },
  {
    number: '02',
    title: 'Commitment to Prayerful Dependence',
    paragraphs: [
      'I am committed to a ministry shaped by prayer. I believe God hears prayer, answers prayer, and works through prayer. Prayer is not a formality or a ministry accessory. It is an expression of dependence on God and a confession that apart from Him, I can do nothing of lasting value.',
      'Because of that, I want my preaching, leadership, planning, shepherding, and decision making to be marked by real reliance on the Lord. I want prayer to shape both the public and private parts of my ministry, not just in moments of crisis, but as a daily posture of trust, humility, and need.',
    ],
    refs: 'Matthew 7:7–11; John 15:5; Philippians 4:6–7; Colossians 4:2; James 5:13–18',
  },
  {
    number: '03',
    title: 'Commitment to Equipping People for Ministry',
    paragraphs: [
      'I am committed to equipping believers for the work of ministry. I do not believe ministry belongs only to a few visible leaders. I believe one of my primary responsibilities is to help God\'s people grow in maturity, confidence, and usefulness so that they can serve Christ faithfully where God has placed them.',
      'That means I want to teach in a way that forms people, not just informs them. I want to encourage believers to use their gifts, step into responsibility, and take seriously their calling to serve, lead, disciple, and bear witness to Christ. Healthy ministry is not built on spectators. It is built on believers who are being equipped to live out their faith with courage, wisdom, and love.',
    ],
    refs: 'Ephesians 4:11–12; 2 Timothy 2:2; 2 Timothy 1:6–8; Acts 1:8; 1 Peter 4:10–11',
  },
  {
    number: '04',
    title: 'Commitment to Fellowship and Spiritual Community',
    paragraphs: [
      'I am committed to cultivating real fellowship within the body of Christ. The Christian life was never meant to be lived in isolation. God grows His people in community, through encouragement, accountability, service, friendship, and shared devotion to Christ.',
      'Because of that, I want my ministry to help people move beyond casual connection into meaningful spiritual community. I want to encourage relationships that are rooted in truth, shaped by love, and strong enough to bear one another\'s burdens. I value unity, but not a shallow kind. I want to help build fellowship that is honest, encouraging, and centered on Christ.',
    ],
    refs: 'Acts 2:42–47; Romans 12:4–5; 1 Corinthians 1:9; 1 Thessalonians 5:11; Hebrews 10:24–25; 1 John 1:3',
  },
  {
    number: '05',
    title: 'Commitment to Faithfulness and Care',
    paragraphs: [
      'I am committed to serving the Lord with care, diligence, and integrity. God is worthy of more than half-hearted ministry, careless preparation, or casual obedience. Because He has given His best for us in Christ, I want to offer Him my best in how I preach, lead, serve, and steward what He has entrusted to me.',
      'For me, this is not about performance, image, or perfectionism. It is about faithfulness. I want to handle God\'s Word carefully, serve people sincerely, lead responsibly, and pursue the work of ministry with wholeheartedness. I want what I do to reflect reverence for God, love for people, and gratitude for grace.',
    ],
    refs: 'Romans 12:1; Colossians 3:23–24; 1 Corinthians 10:31; 1 Corinthians 12; 2 Timothy 2:15',
  },
  {
    number: '06',
    title: 'Commitment to Gospel Mission and Growth',
    paragraphs: [
      'I am committed to reaching people with the gospel of Jesus Christ and helping believers grow in grace and truth. I believe the church is called not only to gather, but to go. The gospel is good news for all people, and I want my ministry to reflect a real urgency about evangelism, disciple making, and spiritual growth.',
      'I do not measure faithfulness by numbers alone, and I do not believe numerical growth is enough by itself. But I do believe God desires His people to bear witness to Christ and to make disciples. Because of that, I want to pursue ministry practices that help people hear the gospel clearly, respond to Christ sincerely, and grow into mature followers of Jesus without compromising truth or integrity.',
    ],
    refs: 'Matthew 28:18–20; Acts 1:8; 2 Corinthians 5:18–20; 2 Timothy 4:5; 1 Peter 3:15; Colossians 1:28–29',
  },
  {
    number: '07',
    title: 'Commitment to Servant Leadership',
    paragraphs: [
      'I am committed to serving rather than being served. Jesus did not lead through self-promotion, status, or distance. He led through humility, sacrifice, and love. Because I belong to Him, I want my leadership to reflect the same spirit.',
      'I believe the strongest leadership in the church is servant leadership. It is leadership that seeks the good of others, lifts others up, and points beyond itself to Christ. So I want to lead with humility, to serve with joy, and to remember that greatness in the kingdom of God is never measured by prominence, but by faithfulness and love.',
    ],
    refs: 'Matthew 20:25–28; Mark 10:42–45; John 13:12–17; Acts 13:36; Acts 20:35; Philippians 2:3–8',
  },
  {
    number: '08',
    title: 'Commitment to Christ Above All',
    paragraphs: [
      'Above all, I want my ministry to be centered on Jesus Christ. He is the message, the model, the hope, and the goal. I do not want to build ministry around personality, activity, or appearance. I want to preach Christ, follow Christ, serve Christ, and help others know and follow Him.',
      'Everything else only matters if it is anchored in Him. So my desire is that my ministry would remain biblical in truth, prayerful in spirit, faithful in practice, humble in posture, and focused on making much of Jesus.',
    ],
    refs: 'John 15:1–5; 1 Corinthians 2:1–5; Colossians 1:15–18, 28–29; Colossians 3:17',
  },
]

export default function ValuesPage() {
  return (
    <>
      <div style={{ background: '#141210' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-14">
          <div
            className="flex items-end justify-between gap-8 pb-10 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div>
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
                Austin's Values
              </h1>
            </div>
            <p
              className="text-[0.92rem] italic max-w-[340px] text-right pb-0.5 leading-relaxed shrink-0"
              style={{
                fontFamily: 'var(--font-source-serif)',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              How I approach ministry.
            </p>
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
          <p
            className="text-[0.97rem] leading-[1.8] mb-14"
            style={{
              fontFamily: 'var(--font-source-serif)',
              color: '#5A544C',
            }}
          >
            These values shape the way I approach ministry. They are not listed in order of importance, because different situations require different points of emphasis. But taken together, they reflect the kind of pastor, teacher, and servant I want to be. I revisit them regularly so that my ministry stays grounded, honest, and aligned with what I believe God has called me to do.
          </p>

          <div className="space-y-0">
            {values.map((value, i) => (
              <div key={i}>
                <div className="py-10">
                  <div
                    className="text-[0.72rem] font-medium tracking-[0.14em] mb-4"
                    style={{ color: '#B8892E' }}
                  >
                    {value.number}
                  </div>
                  <h2
                    className="mb-6 leading-[1.2]"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: 'clamp(1.5rem, 2.5vw, 1.9rem)',
                      fontWeight: 400,
                      color: '#1A1714',
                    }}
                  >
                    {value.title}
                  </h2>
                  <div
                    className="space-y-4 text-[0.97rem] leading-[1.8] mb-4"
                    style={{
                      fontFamily: 'var(--font-source-serif)',
                      color: '#1A1714',
                    }}
                  >
                    <p>{value.paragraphs[0]}</p>
                    <p>{value.paragraphs[1]}</p>
                  </div>
                  <p
                    className="text-[0.78rem] leading-relaxed italic"
                    style={{
                      fontFamily: 'var(--font-source-serif)',
                      color: '#9A9189',
                    }}
                  >
                    {value.refs}
                  </p>
                </div>
                {i < values.length - 1 && (
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
