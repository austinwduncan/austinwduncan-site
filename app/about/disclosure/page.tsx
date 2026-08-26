import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Affiliation Disclosure — Austin W. Duncan',
  description: 'Disclosure policy for affiliate links and recommendations on austinwduncan.com.',
}

export default function DisclosurePage() {
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
                Affiliation Disclosure
              </h1>
            </div>
            <p
              className="text-[0.92rem] italic max-w-[340px] text-right pb-0.5 leading-relaxed shrink-0"
              style={{
                fontFamily: 'var(--font-source-serif)',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              Last updated: April 12, 2023
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
          <div
            className="space-y-6 text-[0.97rem] leading-[1.8]"
            style={{
              fontFamily: 'var(--font-source-serif)',
              color: '#1A1714',
            }}
          >
            <p>
              Austin W. Duncan's mission is to help others find hope in Jesus Christ. Included in the pursuit of fulfilling this lifelong mission is the recommendation of books, study items, music, and more. This Disclosure Policy provides additional information on how he selects certain products, and how he may be compensated through the content that is produced on this website.
            </p>

            <h3
              className="pt-4 uppercase"
              style={{
                fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                fontSize: '1.4rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                color: '#7A5C1E',
              }}
            >
              Affiliate Links and Recommendations
            </h3>

            <p>
              In many of the articles on this website, Austin may earn a small commission when readers purchase products through using a link to a product.
            </p>
            <p>
              This doesn't affect which products are included in any of the articles, and in most cases products are listed after an article has been written. The products that are highlighted in an article are recommended for their integrity, quality, content, and overall ability to aid in further study or learning regarding a specific topic. Products are selected regardless of any affiliate relationships.
            </p>
            <p>
              In fact, there may be products that are recommended from authors or companies that don't directly offer affiliate relationships, but are still linked due to Austin's personal use of an item or book — and his subsequent recommendation of the product to others. In short, items may be recommended that do not offer any sort of sales commission for Austin's recommendation of the item.
            </p>
            <p>
              Austin strives to recommend the products that would fit best for the readers and audience of the articles on this site. The commissions that are made from articles on this site allow for Austin to keep hosting this site, and to allow him to put as much time and energy into the research and vetting of additional information for future publications.
            </p>
            <p>
              If Austin receives a product to review directly from a specific brand or company, it is noted in the review itself, though the vast majority of recommendations made on this site are items that have been personally purchased by Austin himself. Any brands or products that pay for promotion, advertising, or review on this site is considered and labelled as 'Sponsored.'
            </p>

            <h3
              className="pt-4 uppercase"
              style={{
                fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                fontSize: '1.4rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                color: '#7A5C1E',
              }}
            >
              Amazon Associate &amp; Other Programs
            </h3>

            <p>
              As an Amazon Associate, Austin W. Duncan may earn commissions from qualifying purchases from Amazon.com. He also partners with sites and companies such as Faithlife (Logos.com), The Epoch Times, Christian Book (ChristianBook.com), Church Source (ChurchSource.com), Answers in Genesis (AnswersInGenesis.org), Daily Kairos (DailyKairos.com), Seek Jesus (SeekJesus.co), SYMBIS (SYMBIS.com), as well as other retailers from time to time. Austin's reputation to find biblically and theologically sound, and engaging content and products is extremely important to him, and that helps him to navigate what is recommended to the users of this site.
            </p>
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
