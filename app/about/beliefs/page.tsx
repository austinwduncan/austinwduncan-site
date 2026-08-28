import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Austin's Beliefs — Austin W. Duncan",
  description: 'A statement of faith rooted in Scripture.',
}

type BeliefSection = {
  category: string
  heading: string
  body: string
  refs: string
}

const sections: BeliefSection[] = [
  {
    category: 'Scripture',
    heading: 'God Has Spoken in His Word',
    body: 'I believe the Bible, in both the Old and New Testaments, is the written Word of God, breathed out by Him and given through human authors who were carried along by the Holy Spirit. Because Scripture comes from God, I believe it is true, trustworthy, authoritative, and sufficient for faith and life. It is not merely a record of religious experience, but God\'s self-revelation to His people. Therefore, Scripture stands as the final authority for doctrine, discipleship, preaching, counsel, worship, and the life of the church.',
    refs: 'Psalm 19:7–11; Psalm 119:89, 105, 160; Isaiah 40:8; Matthew 5:17–18; John 10:35; John 17:17; 2 Timothy 3:16–17; Hebrews 4:12; 2 Peter 1:20–21',
  },
  {
    category: 'God',
    heading: 'One God, Eternally Father, Son, and Holy Spirit',
    body: 'I believe there is one true and living God, the Creator and ruler of all things, who has eternally existed as Father, Son, and Holy Spirit. These three are not three gods, but one God, having the same nature, glory, majesty, attributes, and perfection, and are therefore worthy of the same worship, trust, obedience, and honor. I believe the doctrine of the Trinity is essential to the Christian faith because it is the Bible\'s own witness to who God is.',
    refs: 'Genesis 1:1, 26–27; Deuteronomy 6:4; Psalm 90:2; Isaiah 43:10–11; Isaiah 45:5–6; Matthew 28:19–20; John 1:1–3; Acts 5:3–4; 2 Corinthians 13:14',
  },
  {
    category: "God's Character",
    heading: 'The Character of God',
    body: 'I believe God is holy, righteous, just, loving, merciful, gracious, faithful, wise, and unchanging. He is sovereign over all things, perfect in all His ways, and worthy of all praise. He does not change with time or circumstance, and all His works are consistent with His character.',
    refs: 'Exodus 34:6–7; Deuteronomy 32:4; Psalm 145:8–9, 17; Malachi 3:6; James 1:17; Revelation 4:8, 11',
  },
  {
    category: 'Jesus Christ',
    heading: 'The Eternal Son of God',
    body: 'I believe Jesus Christ is the eternal Son of God, coequal with the Father and the Holy Spirit. He is not a created being, nor merely a prophet, teacher, or moral example. He is fully God and worthy of the same worship, trust, and obedience as the Father. In Him the fullness of God dwells bodily.',
    refs: 'Isaiah 9:6; Micah 5:2; John 1:1–5, 14; John 5:18, 23; John 8:58; John 10:30; Colossians 1:15–20; Colossians 2:9; Hebrews 1:1–3, 8',
  },
  {
    category: 'Jesus Christ',
    heading: 'The Incarnation and Virgin Birth',
    body: 'I believe that the eternal Son of God became man without ceasing to be God. He was conceived by the Holy Spirit and born of the virgin Mary so that He might fully enter human history, reveal the Father, and redeem sinners. I believe He is fully God and fully man, one person in two natures, and that this truth is essential to the gospel.',
    refs: 'Isaiah 7:14; Matthew 1:18–23; Luke 1:34–35; John 1:14, 18; Galatians 4:4–5; Philippians 2:5–8; 1 Timothy 3:16; Hebrews 2:14–17',
  },
  {
    category: 'Jesus Christ',
    heading: 'His Sinless Life and Saving Work',
    body: 'I believe Jesus lived a sinless life, fulfilled the will of the Father perfectly, and revealed God truly and completely. He obeyed where Adam failed and where all humanity has failed. He came not only to teach truth, but to accomplish redemption.',
    refs: 'Matthew 5:17; John 6:38; John 14:9; 2 Corinthians 5:21; Hebrews 4:15; Hebrews 7:26; 1 Peter 2:22; 1 John 3:5',
  },
  {
    category: 'Jesus Christ',
    heading: 'His Death, Resurrection, Ascension, and Present Ministry',
    body: 'I believe the Lord Jesus Christ accomplished our redemption through His death on the cross as a representative, vicarious, substitutionary sacrifice for sinners. I believe He was crucified, buried, and rose again bodily on the third day. His resurrection was literal, physical, and historical, and it secures our justification, hope, and future resurrection. I also believe He ascended into heaven and is now exalted at the right hand of the Father, where He serves as our High Priest, Intercessor, Advocate, and reigning Lord.',
    refs: 'Isaiah 53:4–6, 10–12; Matthew 20:28; John 1:29; Romans 3:24–26; Romans 4:25; Romans 5:8; 1 Corinthians 15:3–8, 20–22; 2 Corinthians 5:21; Galatians 3:13; Ephesians 1:20–23; Philippians 2:9–11; Colossians 3:1; Hebrews 4:14–16; Hebrews 7:25; 1 Peter 2:24; 1 John 2:1–2',
  },
  {
    category: 'The Holy Spirit',
    heading: 'His Person and Work',
    body: 'I believe the Holy Spirit is fully God, coequal with the Father and the Son. He is not an impersonal force, but a person who convicts the world of sin, righteousness, and judgment, gives new birth, indwells believers, seals them for the day of redemption, illumines the truth of Scripture, and forms Christ in His people.',
    refs: 'John 14:16–17, 26; John 15:26; John 16:7–15; Acts 5:3–4; Romans 8:9–11, 14–16; 1 Corinthians 2:10–14; 1 Corinthians 3:16; 2 Corinthians 3:17–18; Ephesians 1:13–14; Ephesians 4:30; Titus 3:5',
  },
  {
    category: 'The Holy Spirit',
    heading: 'His Indwelling, Fullness, and Empowering Presence',
    body: 'I believe the Holy Spirit lives in every Christian from the moment of salvation. He empowers believers for witness, service, obedience, and growth in holiness. He gives spiritual gifts to every believer for the building up of the church, and He calls us to live daily under His control. I believe the clearest evidence of His work is not self-exaltation, but Christlikeness, truth, love, and the fruit of a life being shaped by grace.',
    refs: 'Acts 1:8; Romans 12:3–8; 1 Corinthians 12:4–11; Galatians 5:16–25; Ephesians 5:18; 1 Peter 4:10–11',
  },
  {
    category: 'Humanity and Sin',
    heading: 'Created in God\'s Image',
    body: 'I believe human beings are created by God and in the image of God. Because of that, every person possesses dignity, value, and accountability before God. Men and women were made for God, to reflect His rule and character in the world, and to live in fellowship with Him.',
    refs: 'Genesis 1:26–27; Genesis 2:7; Psalm 8:3–6; Psalm 139:13–16; Acts 17:24–28; James 3:9',
  },
  {
    category: 'Humanity and Sin',
    heading: 'Fallen and Unable to Save Ourselves',
    body: 'I believe that in Adam\'s sin the human race fell, inherited a sinful nature, and became alienated from God. Sin is both a condition and a practice. It corrupts the heart, distorts the mind, enslaves the will, and brings guilt, death, and judgment. Apart from the grace of God, we are spiritually dead and unable to remedy our fallen condition by morality, religion, effort, or good works.',
    refs: 'Genesis 3:1–24; Psalm 51:5; Jeremiah 17:9; Isaiah 53:6; Isaiah 59:1–2; Romans 3:10–23; Romans 5:12, 18–19; Romans 6:23; Ephesians 2:1–3; Colossians 2:13',
  },
  {
    category: 'Salvation',
    heading: 'By Grace Alone Through Faith Alone in Christ Alone',
    body: 'I believe salvation is the free gift of God, given by grace alone and received through faith alone in Jesus Christ alone. No one can earn forgiveness or reconciliation with God through self-improvement, religious activity, or good works. Christ alone is the ground of salvation, and all who repent of sin and trust in Him as Lord and Savior are forgiven and made right with God.',
    refs: 'John 1:12–13; John 3:16–18; John 14:6; Acts 4:12; Acts 16:30–31; Romans 3:28; Romans 5:1; Romans 6:23; Romans 10:9–10, 13; Ephesians 2:8–9; Titus 3:4–7',
  },
  {
    category: 'Salvation',
    heading: 'Repentance, Justification, and New Life',
    body: 'I believe saving faith includes repentance, which is a real turning from sin and a real turning to God. In salvation, God forgives sin, declares the sinner righteous through Christ, adopts the believer into His family, gives new life by the Spirit, and begins the work of sanctification. Eternal life begins now for those who belong to Christ and will be brought to completion in His presence.',
    refs: 'Ezekiel 36:25–27; Mark 1:15; John 5:24; Romans 4:4–8; Romans 8:15–17; 2 Corinthians 5:17; Galatians 4:4–7; Ephesians 1:7; Colossians 1:13–14; 1 Peter 1:3–5',
  },
  {
    category: 'Salvation',
    heading: 'Faith That Bears Fruit',
    body: 'I believe good works do not save, but genuine faith is never barren. The faith that justifies is the faith that lives, obeys, and bears fruit. Therefore, I reject both legalism, which tries to earn God\'s favor, and empty profession, which claims faith without repentance or evidence of changed life. Grace not only pardons, but also produces holiness.',
    refs: 'Matthew 7:16–20; John 15:1–8; Romans 6:1–14; Galatians 5:6; Ephesians 2:10; Philippians 2:12–13; James 2:14–26; Titus 2:11–14',
  },
  {
    category: 'The Christian Life',
    heading: 'Sanctification and Obedience',
    body: 'I believe the Christian life is one of ongoing sanctification. Believers are called to grow in holiness, love, obedience, prayer, worship, fellowship, service, and endurance. This growth is not the basis of our acceptance with God, but the fruit of union with Christ and the work of the Holy Spirit in us. God calls His people not merely to profess faith, but to walk in a manner worthy of the gospel.',
    refs: 'Luke 9:23; John 17:17; Romans 8:29; Romans 12:1–2; 1 Corinthians 6:19–20; Galatians 5:22–25; Philippians 1:6; Philippians 2:12–13; Colossians 3:1–17; 1 Thessalonians 4:3–7; Hebrews 12:14',
  },
  {
    category: 'The Christian Life',
    heading: 'Assurance and Perseverance',
    body: 'I believe true believers are kept by the power and faithfulness of God. Christians still struggle with sin, weakness, temptation, and suffering, yet their standing before God rests on Christ\'s finished work and not on their personal performance. Assurance is grounded in the promises of God, the sufficiency of Christ, and the Spirit\'s work in the believer. This assurance does not lead to carelessness, but to gratitude, endurance, and deeper devotion to Christ.',
    refs: 'John 6:37–40; John 10:27–30; Romans 8:1, 31–39; Philippians 1:6; 2 Timothy 1:12; Hebrews 7:25; 1 Peter 1:3–5; 1 John 5:11–13; Jude 24–25',
  },
  {
    category: 'The Church',
    heading: 'The Body of Christ',
    body: 'I believe the church is the body of Christ, made up of all who belong to Him by faith. I also believe local churches are essential to God\'s design for the Christian life. Believers are called into a life of worship, discipleship, fellowship, prayer, mutual care, accountability, service, and mission within the local church. The church is not built around personalities, trends, or consumer preference, but around Christ and His Word.',
    refs: 'Matthew 16:18; Acts 2:41–47; Romans 12:4–5; 1 Corinthians 12:12–27; Ephesians 1:22–23; Ephesians 2:19–22; Ephesians 4:11–16; Hebrews 10:24–25',
  },
  {
    category: 'The Church',
    heading: 'The Mission of the Church',
    body: 'I believe the church exists to glorify God by making disciples of Jesus Christ, proclaiming the gospel, teaching the Scriptures, building up believers in truth and love, and bearing witness to Christ in the world. The church is called to both speak the gospel clearly and live it visibly. Faithful ministry includes preaching, prayer, evangelism, discipleship, compassion, service, and the use of spiritual gifts for the common good.',
    refs: 'Matthew 5:14–16; Matthew 28:18–20; Acts 1:8; Acts 6:1–7; Acts 13:1–3; Romans 10:14–17; 1 Corinthians 14:12; Ephesians 3:10–11; Ephesians 4:11–16; Colossians 1:28–29; 1 Peter 4:10–11',
  },
  {
    category: 'Baptism',
    heading: 'A Public Declaration of Union with Christ',
    body: 'I believe Christian baptism is an act of obedience for those who have repented of sin and trusted in Jesus Christ. Baptism does not save, but it publicly identifies the believer with the death, burial, and resurrection of Christ and serves as a visible confession of new life in Him. I believe it is both a testimony of grace received and a step of obedience to Christ\'s command.',
    refs: 'Matthew 3:13–17; Matthew 28:19–20; Acts 2:38–41; Acts 8:12, 36–38; Acts 10:47–48; Romans 6:3–4; Colossians 2:12',
  },
  {
    category: 'Last Things',
    heading: 'Resurrection, Judgment, Heaven, and Hell',
    body: 'I believe people were created to exist forever and that there will be a bodily resurrection of both the saved and the lost. Those who belong to Christ will dwell forever with God in the joy of eternal life, while those who remain in their sin will face eternal judgment apart from His saving presence. Heaven and hell are real, and final judgment is certain.',
    refs: 'Daniel 12:2; Matthew 25:31–46; John 5:28–29; John 11:25–26; Romans 2:5–8; Philippians 3:20–21; 2 Thessalonians 1:7–10; Revelation 20:11–15; Revelation 21:1–8',
  },
  {
    category: 'Last Things',
    heading: 'The Return of Christ',
    body: 'I believe Jesus Christ will return personally, visibly, and bodily to judge the living and the dead, to raise His people, and to bring the fullness of His kingdom. The certainty of His return calls the church to faithfulness, watchfulness, holiness, hope, and perseverance.',
    refs: 'Matthew 24:30–31, 42–44; Acts 1:9–11; 1 Corinthians 15:51–58; Philippians 3:20–21; 1 Thessalonians 4:13–18; Titus 2:11–13; 2 Peter 3:10–13; 1 John 3:2–3',
  },
  {
    category: 'Final Conviction',
    heading: 'Christ at the Center',
    body: 'At the center of all I believe stands Jesus Christ, crucified, risen, ascended, reigning, and coming again. I believe the Christian faith rises or falls on who He is and what He has done. Therefore, I want my doctrine, preaching, writing, ministry, and life to remain anchored in Scripture, centered on Christ, dependent on the Holy Spirit, shaped by grace, and aimed at the glory of God.',
    refs: 'Luke 24:27; John 14:6; Acts 17:2–3; 1 Corinthians 2:1–5; 1 Corinthians 15:1–4, 17–20; Colossians 1:17–18; Colossians 3:16–17',
  },
]

export default function BeliefsPage() {
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
                style={{ color: '#CDB079' }}
              >
                <span className="inline-block h-px w-[18px]" style={{ background: '#CDB079' }} />
                About
              </div>
              <h1
                className="uppercase"
                style={{
                  fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                  fontSize: 'clamp(2.2rem, 3.5vw, 3rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  lineHeight: 0.95,
                  color: '#F9F6F0',
                }}
              >
                Austin's Beliefs
              </h1>
            </div>
            <p
              className="text-[0.92rem] italic max-w-[340px] text-right pb-0.5 leading-relaxed shrink-0"
              style={{
                fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              A statement of faith rooted in Scripture.
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
              fontFamily: 'var(--font-cmg), system-ui, sans-serif',
              color: '#5A544C',
            }}
          >
            These are the beliefs I hold as a Christian and as a minister of the gospel. Each statement is grounded in Scripture, and the passages listed are the primary texts that shape each conviction.
          </p>

          <div className="space-y-0">
            {sections.map((section, i) => (
              <div key={i}>
                <div className="py-10">
                  <div
                    className="flex items-center gap-2 text-[0.68rem] font-medium tracking-[0.12em] uppercase mb-3"
                    style={{ color: '#6E5A2E' }}
                  >
                    <span className="inline-block h-px w-[14px]" style={{ background: '#CDB079' }} />
                    {section.category}
                  </div>
                  <h2
                    className="mb-5 uppercase"
                    style={{
                      fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                      fontSize: 'clamp(1.5rem, 2.5vw, 1.9rem)',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.15,
                      color: '#1A1714',
                    }}
                  >
                    {section.heading}
                  </h2>
                  <p
                    className="text-[0.97rem] leading-[1.8] mb-4"
                    style={{
                      fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                      color: '#1A1714',
                    }}
                  >
                    {section.body}
                  </p>
                  <p
                    className="text-[0.78rem] leading-relaxed italic"
                    style={{
                      fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                      color: '#9A9189',
                    }}
                  >
                    {section.refs}
                  </p>
                </div>
                {i < sections.length - 1 && (
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
