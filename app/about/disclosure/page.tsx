import type { Metadata } from 'next'
import { BODY_FONT, BackToAbout, H3_SIZE, INK, SubpageHeader, WHITE, display } from '../ui'

export const metadata: Metadata = {
  title: 'Affiliation Disclosure',
  description: 'Disclosure policy for affiliate links and recommendations on austinwduncan.com.',
}

export default function DisclosurePage() {
  return (
    <>
      <SubpageHeader title="Affiliation Disclosure" note="Last updated: April 12, 2023" />

      <section style={{ background: WHITE }}>
        <div className="mx-auto max-w-[780px] px-6 lg:px-8 py-20 lg:py-28">
          <div
            className="space-y-6 text-[0.97rem] leading-[1.8]"
            style={{ fontFamily: BODY_FONT, color: INK }}
          >
            <p>
              Austin W. Duncan&apos;s mission is to help others find hope in Jesus Christ. Included in the pursuit of fulfilling this lifelong mission is the recommendation of books, study items, music, and more. This Disclosure Policy provides additional information on how he selects certain products, and how he may be compensated through the content that is produced on this website.
            </p>

            <h3 className="pt-8" style={display(H3_SIZE, INK)}>
              Affiliate Links and Recommendations
            </h3>

            <p>
              In many of the articles on this website, Austin may earn a small commission when readers purchase products through using a link to a product.
            </p>
            <p>
              This doesn&apos;t affect which products are included in any of the articles, and in most cases products are listed after an article has been written. The products that are highlighted in an article are recommended for their integrity, quality, content, and overall ability to aid in further study or learning regarding a specific topic. Products are selected regardless of any affiliate relationships.
            </p>
            <p>
              In fact, there may be products that are recommended from authors or companies that don&apos;t directly offer affiliate relationships, but are still linked due to Austin&apos;s personal use of an item or book and his subsequent recommendation of the product to others. In short, items may be recommended that do not offer any sort of sales commission for Austin&apos;s recommendation of the item.
            </p>
            <p>
              Austin strives to recommend the products that would fit best for the readers and audience of the articles on this site. The commissions that are made from articles on this site allow for Austin to keep hosting this site, and to allow him to put as much time and energy into the research and vetting of additional information for future publications.
            </p>
            <p>
              If Austin receives a product to review directly from a specific brand or company, it is noted in the review itself, though the vast majority of recommendations made on this site are items that have been personally purchased by Austin himself. Any brands or products that pay for promotion, advertising, or review on this site is considered and labelled as &lsquo;Sponsored.&rsquo;
            </p>

            <h3 className="pt-8" style={display(H3_SIZE, INK)}>
              Amazon Associate &amp; Other Programs
            </h3>

            <p>
              As an Amazon Associate, Austin W. Duncan may earn commissions from qualifying purchases from Amazon.com. He also partners with sites and companies such as Faithlife (Logos.com), The Epoch Times, Christian Book (ChristianBook.com), Church Source (ChurchSource.com), Answers in Genesis (AnswersInGenesis.org), Daily Kairos (DailyKairos.com), Seek Jesus (SeekJesus.co), SYMBIS (SYMBIS.com), as well as other retailers from time to time. Austin&apos;s reputation to find biblically and theologically sound, and engaging content and products is extremely important to him, and that helps him to navigate what is recommended to the users of this site.
            </p>
          </div>

          <BackToAbout />
        </div>
      </section>
    </>
  )
}
