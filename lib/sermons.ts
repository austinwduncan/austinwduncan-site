import { isCategory, type Category } from "./categories";
/*
  Sermon content model for the sermon-article system.

  Each sermon is video + a formatted article (the article is the source of
  truth). The body is stored as lightly-marked text:
    - lines beginning "## " are section headings (drive the table of contents)
    - a block that starts with a quote mark and ends with "…ESV" is rendered as
      a set-apart Scripture block
    - everything else is a paragraph
  Optional per-section timestamps (see SermonSection.t) let the article sync to
  the video once the timestamped transcript is available.

  Austin's sermons are published on austinwduncan.com a day or two before they
  land here, so those carry a cross-domain canonical back to his site.
*/

import { supabaseAnon, supabaseService } from "./supabase";

export type SermonStatus = "published" | "draft" | "scheduled";

export type Sermon = {
  slug: string;
  title: string;
  subtitle?: string;
  /** Legacy free-text series name; superseded by seriesId but kept for display. */
  series?: string;
  seriesId?: number;
  /** Resolved from the linked series (title + artwork) for display/fallback. */
  seriesTitle?: string;
  seriesSlug?: string;
  seriesArtworkUrl?: string;
  /** Series "hero background" — composited behind the speaker on heroes and cards. */
  seriesBackgroundUrl?: string;
  speaker: string; // primary speaker (back-compat); speakers[0]
  speakers?: string[];
  passage: string; // primary reference (page hero + JSON-LD); scripture[0]
  scripture?: string[];
  topics?: string[];
  /** ISO date (YYYY-MM-DD). Optional until set from the real preached date. */
  date?: string;
  /** YouTube id for the video (the full-service recording); article timestamps map to it. */
  youtubeId?: string;
  youtubeIdFull?: string;
  /** Cross-domain canonical (e.g. the austinwduncan.com URL for Austin's sermons). */
  canonicalUrl?: string;
  documentUrl?: string;
  documentName?: string;
  webLink1Url?: string;
  webLink1Label?: string;
  webLink2Url?: string;
  webLink2Label?: string;
  /** Sermon-specific graphic; the page falls back to the series artwork. */
  artworkUrl?: string;
  /** Uploaded still of the speaker + its background-removed cutout (color);
      the hero composites the cutout over a soft blurred B&W version of the still. */
  heroStillUrl?: string;
  heroCutoutUrl?: string;
  /** Alternate hero-still candidates (e.g. bulk-extracted midpoint frames) the
   *  manager can swap to with one tap. */
  heroStillCandidates?: string[];
  /** Focus point (% of the photo) where the speaker's face is, for consistent framing. */
  heroFocalX?: number;
  heroFocalY?: number;
  /** Where the face should land in the thumbnail (percent) + how far to zoom. */
  heroTargetX?: number;
  heroTargetY?: number;
  heroZoom?: number;
  /** Week / episode number within its series. */
  week?: number;
  summary: string;
  description?: string;
  body: string;
  /** What the piece is. See lib/categories.ts. */
  category: Category;
  status?: SermonStatus;
  scheduledAt?: string;
};

export type Block =
  | { type: "heading"; id: string; text: string; t?: number }
  | { type: "subheading"; text: string }
  | { type: "scripture"; text: string; reference?: string }
  | { type: "image"; src: string; alt: string; href?: string }
  | { type: "paragraph"; text: string };

/** "[mm:ss]" or "[h:mm:ss]" at the start of a heading -> seconds. */
function parseTimestamp(text: string): { t?: number; rest: string } {
  const m = /^\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]\s*/.exec(text);
  if (!m) return { rest: text };
  const a = Number(m[1]);
  const b = Number(m[2]);
  const c = m[3] !== undefined ? Number(m[3]) : undefined;
  const t = c !== undefined ? a * 3600 + b * 60 + c : a * 60 + b;
  return { t, rest: text.slice(m[0].length).trim() };
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Parse the lightly-marked body into typed blocks. */
export function parseSermonBody(body: string): Block[] {
  const raw = body.trim().split(/\n\s*\n/);
  return raw.map((b) => {
    const block = b.trim();
    if (block.startsWith("## ")) {
      const { t, rest } = parseTimestamp(block.slice(3).trim());
      return { type: "heading", id: slugify(rest), text: rest, t };
    }
    // "### " is a subhead inside a section: rendered, but not in the contents.
    if (/^#{3,6} /.test(block) && !block.includes("\n")) {
      return { type: "subheading", text: block.replace(/^#{3,6} /, "").trim() };
    }
    // A lone image, optionally wrapped in a link: ![alt](src) or [ ![alt](src) ](href)
    const img = /^\[?\s*!\[([^\]]*)\]\(([^)\s]+)\)\s*\]?(?:\(([^)\s]+)\))?$/.exec(block);
    if (img) {
      return { type: "image", alt: img[1] ?? "", src: img[2], href: img[3] || undefined };
    }
    // Scripture: opens with a quote and ends with an ESV citation. The citation
    // is set off by an em/en dash (never a hyphen, so "moth-eaten" is safe).
    if (/^["“]/.test(block) && /ESV\.?$/i.test(block)) {
      const m = /^(.*?)\s*[—–]\s*([^—–]+?),?\s*ESV\.?$/i.exec(block);
      if (m) {
        const quote = m[1].trim().replace(/^["“]|["”]$/g, "");
        const reference = m[2].trim().replace(/[–—]/g, "-");
        return { type: "scripture", text: quote, reference };
      }
    }
    return { type: "paragraph", text: block };
  });
}

/** Section headings only (with optional timestamps), for the TOC and sync. */
export function sermonSections(body: string): { id: string; text: string; t?: number }[] {
  return parseSermonBody(body)
    .filter((b): b is Extract<Block, { type: "heading" }> => b.type === "heading")
    .map(({ id, text, t }) => ({ id, text, t }));
}

/** Reading time in minutes from the article word count (~200 wpm). */
export function readingTime(body: string): number {
  const words = body.replace(/^##\s+/gm, "").trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const WHEN_WEALTH_BODY = `If you've been with us through this series, you already know James is not a guy who eases into things. He doesn't open with a warm story about his weekend. He doesn't crack a joke to get the room comfortable. He doesn't even clear his throat. He just walks in and goes. He just starts swinging.

And we keep saying this every week, but it just keeps being true. Week after week, James is asking the same uncomfortable question from another angle. Does your faith actually match your life? Does it show up in how you talk? In how you treat people? In what you trust? In how you spend?

Last week we got to the end of chapter 4, where James turned to the merchant planners. The people with the spreadsheets and the projections. And he basically said, "You're leaving God out of your own calendar. That's not wisdom. That's arrogance."

This week, he turns the corner. And I'll be honest with you upfront. The language is going to get harder.

If last week was a correction, this week is closer to an indictment.

I want to say something before we read it. James 5:1-6 is probably the most intense stretch of writing in this whole letter. It reads like an Old Testament prophet. It sounds like Amos in the marketplace, or Isaiah in the temple courtyard, not gently nudging people toward better behavior, but standing up and naming what's happening.

But here's what I want to keep in mind before we read it. James isn't writing this because he enjoys the conflict. Or because he enjoys turning up the heat. He's writing it because the people who first received this letter were being economically crushed by other people. And speaking truth, even hard truth, is one of the most caring things you can do for somebody. It's the same instinct that makes a doctor tell you something you don't want to hear, because the alternative is so much worse.

So let's read it. James 5:1-6.

"Come now, you rich, weep and howl for the miseries that are coming upon you. Your riches have rotted and your garments are moth-eaten. Your gold and silver have corroded, and their corrosion will be evidence against you and will eat your flesh like fire. You have laid up treasure in the last days. Behold, the wages of the laborers who mowed your fields, which you kept back by fraud, are crying out against you, and the cries of the harvesters have reached the ears of the Lord of hosts. You have lived on the earth in luxury and in self-indulgence. You have fattened your hearts in a day of slaughter. You have condemned and murdered the righteous person. He does not resist you." — James 5:1-6, ESV

That's hard, right?

That's not a budgeting sermon. That's not a financial planning workshop. That's a courtroom.

And in the courtroom James is building, your wealth doesn't just sit quietly in the corner waiting to find out what's going on. It gets called to the stand. It testifies. It speaks. It's a witness.

And that's the central image of this passage. Wealth as evidence.

So this morning we're going to walk through the courtroom together. We're going to look at the exhibits James calls forward. We're going to hear what's on the record. And then we're going to ask, on a Sunday morning in Brentwood, Tennessee, what any of this has to do with us.

I think you're going to be surprised. Read with me again the first three verses here.

## Your Wealth Is Already Testifying

"Come now, you rich, weep and howl for the miseries that are coming upon you. Your riches have rotted and your garments are moth-eaten. Your gold and silver have corroded, and their corrosion will be evidence against you and will eat your flesh like fire. You have laid up treasure in the last days." — James 5:1-3, ESV

James opens with two words. "Come now."

You might recognize that phrase. He used it just one paragraph earlier, in 4:13, when he turned to the merchant planners. Same opener.

But it's not what you might think it is. "Come now" isn't a polite invitation. It's not "Hey, glad you're here, can I get you a coffee?" In the original language, it's much more abrupt than that. It's almost like grabbing somebody by the collar. Pay attention. Look up. We need to talk.

And the very first thing he tells these wealthy people to do is jarring. He doesn't say, "Come now, you rich, let me suggest some adjustments to your portfolio." He says, "Weep and howl for the miseries that are coming upon you."

"Weep…and howl…" Geez.

That word "howl" is striking. You know, it's a prophet's word. When you find that word in Isaiah or Ezekiel or Amos, something terrible is on the horizon and the people aren't ready. It's not composed weeping. It's not a single tear running down your cheek. It's loss-of-words grief. The kind of wailing that doesn't even know what to say anymore.

James is essentially saying, "If you could see what I see, that's what you'd be doing right now."

So what does he see?

Well, he looks at the wealth these people have stockpiled, and he calls three exhibits to the stand.

## Exhibit A: Rotting Riches

"Your riches have rotted."

In the original language, and ours, notice that's not a future warning. It's not "these things will rot eventually." It's already happened. "Have rotted." Spiritually speaking, the decay is done. James sees what they can't see yet. The grain in the storehouse, the food piled up for safekeeping, the abundance they've been congratulating themselves over, James says it's already rotting. They just don't know it.

## Exhibit B: Moth-Eaten Garments

"Your garments are moth-eaten."

If that sounds familiar, good! Because it connects directly to Jesus' words in the Sermon on the Mount: "Do not lay up for yourselves treasures on earth, where moth and rust destroy."

Now, for us, clothes are pretty common. Even nice clothes are mostly replaceable. If you're like me and you're wearing a white shirt anywhere and you're eating, you're going to spill on it. And usually it's something that's not going to come out, at least with my luck. So then I have to replace the shirt. But in the ancient world, it was different. Fine garments were a real form of wealth. They took time, skill, dye, fabric, labor. A wealthy person could store robes the way we'd store assets. It was a savings account in fabric form.

That's why Scripture so often uses clothing as a symbol of status. Joseph's robe set him apart from his brothers. Naaman traveled with changes of garments alongside silver and gold. The rich man in Luke 16 is described as dressed in purple and fine linen. Kings, priests, nobles, people of status, often wore their wealth on their backs.

So when James says, "Your garments are moth-eaten," he's not picturing some guy losing a couple of sweaters in the attic. He's saying, "The very symbols of your status are rotting in storage."

The robes you were saving for the right occasion. The garments you wore so people knew exactly who you were when you walked into the room. The pieces that made you look important. James says they're being eaten in the dark.

And here's the thing about moths. Moths don't make any noise. They don't kick the door down. They don't slam dishes around in the kitchen when you're trying to sleep but your significant other has decided that it's cleaning time. Moths just eat. Quietly. Slowly. Thread by thread.

That's a terrifying picture of hoarded wealth when you stop to think about it.

Because the wealthy person looks at the closet and thinks, "I'm preserving this." James says, "No, it's already being consumed." The owner thinks, "This proves my status." James says, "No, this is becoming evidence."

And don't miss what's sitting just under that image. The garments are in storage being eaten by moths, while the workers in verse 4 are crying out for wages. That's what makes this more than decay. It's not just that the rich man's closet is ruined. It's that his closet was full while somebody else's table was empty.

He stored up what he didn't need, while withholding what someone else did.

There's a gospel image here too.

The rich men in James store robes to display their honor. But Jesus, the true King, was wearing a robe to be mocked. They threw it on him to humiliate him. Then they stripped it off him. Then they divided his garments at the cross.

So James shows us people clinging to garments for status. The Gospels show us Jesus losing even his garments in shame.

One stores up robes to make himself look glorious. The other wears the robe of mockery so that sinners, you and me, could be clothed in mercy.

## Exhibit C: Corroded Gold and Silver

"Your gold and silver have corroded, and their corrosion will be evidence against you and will eat your flesh like fire. You have laid up treasure in the last days." — James 5:3, ESV

What a strange image. Do you notice anything weird about this?

Gold doesn't really corrode. That's kind of the whole point of gold. It lasts. It holds its shine. It survives what other things don't survive. Empires rise and fall. Currencies change. Markets crash. Buildings collapse. And people still dig coins out of the ground from two thousand years ago and they're still gold. Egyptian sarcophagus get exhumed, still gold.

That's why gold has always felt safe.

When people don't trust paper money, they buy gold. When the economy feels shaky, they buy gold. When everything feels fragile, gold feels permanent.

James knows that. But he's not making a mistake when he says it's corroded. He's making a point. He's saying, "The thing you thought was untouchable is already ruined in the eyes of God."

That's unsettling.

Because with the food, you can imagine it. Food rots. Sure. I'm scared to look at some of the condiment dates in my fridge. With the garments, you can imagine it. Moths eat fabric. But gold? The thing that's literally supposed to outlast decay?

James says even that has corroded.

And I'll put it this way. The problem isn't with the metal. The problem is with what the metal has become in the heart of the person holding it. Gold can sit in a vault and still be spiritually rotten. Silver can shine in your hand and still be evidence against you.

And that's exactly where James takes it next. He says the corrosion "will be evidence against you."

So picture the courtroom again. A lawyer brings a safety deposit box forward. The coins get poured out on the table. And the thing this man thought would defend him stands up and starts testifying against him.

He thought it would say, "He was wise." It says, "He hoarded."

He thought it would say, "He was secure." It says, "He trusted me more than God."

He thought it would say, "He was successful." It says, "He had enough to help, and he kept it anyway."

That's the horror of this image. The gold doesn't save him. It takes the stand.

And then James pushes it even further. He says the corrosion "will eat your flesh like fire."

That's a horrifying picture, and it's supposed to be. James wants us to feel it. Hoarded wealth isn't neutral. Money that should have moved toward mercy but stayed locked in a safe doesn't just sit there harmlessly. It begins to burn. It becomes evidence, and worse, it becomes fire.

I want to say this clearly because I want us to hear James right. The issue is not that gold and silver are evil. The issue is not that having money makes you a bad person.

You've probably heard the verse, "Money is the root of all evil." Right? That verse, exactly that way, isn't in the Bible. Doesn't exist. The actual verse, 1 Timothy 6:10, says, "The love of money is a root of all kinds of evils." Money itself is a tool. The problem is what happens when our love starts to bend toward it. When the dollars in the account start to function like a throne in the heart.

So when James says these things have corroded, he's not condemning gold and silver. He's diagnosing what happens when they become the place we run for safety. When they become the thing we keep for ourselves while our neighbor cries out. When the number in the account starts to feel like the foundation of our peace.

## Laying Up Treasure in the Last Days

And then James lands the line that flips the whole passage.

"You have laid up treasure in the last days."

Now, when we hear "the last days," a lot of us picture something specific. Charts. Color-coded timelines. A guy with a laser pointer and very strong opinions about end-times prophecy. We've all seen it.

But James doesn't use the phrase that way. For James, "the last days" isn't a calendar marker. It's moral weight. It's pressure. It means we're already in the age of fulfillment. The Messiah has come. History is moving toward its conclusion.

And in that context, hoarding is insane! It's not just selfish. It's delusional. You're building bigger and bigger barns on a fault line.

Jesus told a parable about that exact thing in Luke 12. Remember the rich fool? The man wasn't unintelligent. He was actually a pretty sharp businessman. He looked at his surplus, ran the numbers, assessed his storage capacity, and made what looked like a perfectly rational decision. Build bigger barns. Store more. Take it easy.

And God looked at him and said, "Fool. This night your soul is required of you."

The problem wasn't his business sense. The problem was that all of his intelligence was aimed at the wrong horizon. He was calculating for the next forty years and forgetting about the next forty minutes.

James is pressing the same nerve. You're laying up treasure in the last days. You're stockpiling in a world that's moving toward judgment.

That's like standing in a house that's on fire and saying, "Hold on, before we get out, this pantry is nowhere near organized."

My wife would probably say, "Finally."

But there's a point where the issue isn't that you're bad at planning. The issue is that you don't understand what time it is.

That's what James is saying. The Messiah has come! The Judge is near! The last days have arrived. History isn't wandering in circles. It's moving toward a courtroom.

So when we hoard, when we grip, when we organize our entire lives around accumulation, we're treating temporary things like they're permanent and treating eternal things like they can wait.

They can't. James says they can't.

## A Word About Us

Now, I can already feel half of you thinking, "Well that's clearly not about me. I'm not Jeff Bezos. I'm not Warren Buffett. I'm just trying to keep up."

So let's be honest with each other for a second.

We're in Brentwood. By any global and historical measure, many of us in this room are among the wealthiest human beings who have ever lived.

But most of us don't feel rich. That's part of the problem. We compare sideways. We compare ourselves to the people in our neighborhood, our industry, our tax bracket, our social media feed. And when we compare that way, we can always find someone with more. There's always somebody with a bigger house. A newer car. A better retirement account. A vacation we wish we were on.

But if we zoom out, the picture changes really fast.

Global income data from the World Bank's Poverty and Inequality Platform suggests that a single adult making $50,000 a year is above roughly 98 percent of the world by per-person income. The same data set says that nearly half the world lives on less than $8.30 per person per day. That's per day. Total.

And that's only comparing us globally.

If we compare historically, it gets even stranger.

Now, I'm not saying you have the power of an ancient king. A king could command armies. You and I can barely make it through to a customer service rep without losing some sanctification. Just me?

But think about daily life. A king could have robes and servants and gold, but he couldn't walk into his kitchen and pull ice out of a machine. He couldn't take an antibiotic when an infection started. He couldn't flip a switch and make the room cold in July. He couldn't take a hot shower whenever he wanted. He couldn't pick up a phone and look his daughter in the eye while she was on the other side of the country. He couldn't get in a car and travel in an hour what used to take a day.

And here's the irony. We can live surrounded by comforts that most of human history could hardly imagine, and still say with a straight face, "I don't really have much."

Hah. Okay.

I'm not saying that to shame anyone. I know some of you are carrying real financial pressure. Bills are real. Debt is real. The cost of living is real. Some of you hear this and think, "I don't feel wealthy. I feel stretched."

I get that. I really do.

But James won't let us hide behind, "I don't feel rich." Because James is talking to people with enough to store. Enough to protect. Enough to build security around. Enough that their possessions can start shaping their hearts.

So the question isn't simply, "Do I have a lot?"

The question is, "What is what I have doing to me?"

Is it making me more generous or more guarded? More attentive or more insulated? More grateful or more entitled? More open-handed or more afraid?

## God Hears the Cry

"Behold, the wages of the laborers who mowed your fields, which you kept back by fraud, are crying out against you, and the cries of the harvesters have reached the ears of the Lord of hosts." — James 5:4, ESV

This is a specific accusation. These aren't evil people in some cartoon villain way. These aren't guys twirling their mustaches over a candle. These are landowners. Respectable people. People who had property, ran operations, hired workers for the harvest. And when the harvest was done and the wages were due, they… kept the money.

We need to understand what that meant in that world.

Day laborers in the first century didn't have employment contracts. They didn't have HR. They didn't have direct deposit. They worked for a day, and they were paid at the end of that day, because that was the only way they could eat that night.

Deuteronomy 24 was explicit about this:

"You shall give him his wages on the same day, before the sun sets (for he is poor and counts on it), lest he cry against you to the Lord, and you be guilty of sin." — Deuteronomy 24:15, ESV

Daily pay, before sundown. Why? Because if you delayed even one day, the laborer went home with nothing. No food. No bread. No way to feed his kids that night. It wasn't an inconvenience. It was the difference between eating and not eating.

And what does James say these withheld wages do?

They cry out.

He's actually personifying the wages themselves. The coins are sitting in the landowner's treasury, and they're raising their voice to heaven. They don't belong there. They know it. And they're screaming about it.

This is Exodus language. This is exactly the language used in Exodus 2 when Israel was enslaved in Egypt. Their cry rose to God.

"The people of Israel groaned because of their slavery and cried out for help. Their cry for rescue from slavery came up to God. And God heard their groaning…" — Exodus 2:23-24, ESV

The cry of the oppressed isn't a sound that drifts past heaven unnoticed. It lands. It arrives. It demands a response.

## The Lord of Hosts

And then James names the God who hears it. The Lord of hosts.

That title shows up hundreds of times in the Old Testament. And I want to slow us down here, because I think we can hear "the Lord" and let it land soft. Like a reassurance. God noticed. God's paying attention. He's keeping notes. We're fine.

But that is not what this title means.

The Lord of hosts is a military title. Hosts means armies. It's saying God is the commander of heaven's armies. The title shows up in contexts of warfare. Of judgment. Of God mobilizing his power against injustice.

When Isaiah saw God in the temple in chapter 6, the seraphim cried, "Holy, holy, holy is the Lord of hosts," because they were overwhelmed by his power. When David walked out toward Goliath, he said, "I come to you in the name of the Lord of hosts, the God of the armies of Israel." This is the name you use when you want to say, God is not passive. God is not distant. God is mobilized.

So James isn't just saying God noticed the injustice. He's saying the Lord of armies received the cry, and the Lord of armies is mobilized.

The loudest sound in this passage is not the landowner's laughter at his own dinner party. It's the worker's cry. And it went straight into the ear of the Commander of heaven's armies.

## A Word for Those Who Have Been on This Side of It

The community that would actually read this letter aloud was mostly the workers, not the landowners. These were scattered Jewish Christians, many of them poor, many of them subject to exactly this kind of exploitation. The wealthy landowners in James 5 weren't sitting in the assembly hearing this letter read out loud. The day laborers were.

So James is telling them: your cries reached his ears. The wages they kept from you, the nights you went to bed wondering how you'd feed your family, the times you had no recourse because they had the courts and you had nothing, those cries did not evaporate into the air. They reached the Lord of hosts.

If that's your story, if you've been on the powerless end of an injustice you couldn't fight, if somebody with leverage used it against you and you had no way to push back, hear this. God heard. That's not a platitude. That's a theological claim about who God is.

## A Word for the Comfortable

And then on the other side of this. If you have people who work for you, with you, or who depend on you financially in some way, this verse asks a pointed question.

Is anyone's cry attached to your comfort?

James isn't primarily after criminals here. The people he's describing are respectable landowners. They probably gave to the temple. They said their prayers. They had every appearance of being devout. And yet there was a trail of unpaid wages running from their fields straight up to heaven's courtroom.

So the question isn't whether you're doing something obviously illegal. The question is whether there are people carrying a cost for the way you do business, manage your money, or organize your life. Whether there's anyone in your employment, your household, your orbit, whose cry is connected to your accumulation.

And that's a hard question. James means for it to be.

## Luxury Without Mercy Is Fattening for Judgment

"You have lived on the earth in luxury and in self-indulgence. You have fattened your hearts in a day of slaughter." — James 5:5, ESV

James uses two different words there, and they're doing different work. The first, luxury, simply describes luxurious living. The soft and pampered life. The life built around personal ease. The second one goes further, for self-indulgence. It suggests wantonness. Reckless self-indulgence. A life given over to pleasure with no restraint and no real concern for what it costs anyone else.

Together, they paint a picture of a life that's totally oriented toward itself. Not necessarily depraved in some obvious way. Not necessarily breaking laws. Just deeply, completely inward. Everything angled toward personal comfort, personal pleasure, personal security.

And then James lands on one of the darkest images in the New Testament.

"You have fattened your hearts in a day of slaughter."

Jeremiah 12:3 describes the wicked as being prepared "for the day of slaughter," set apart like livestock. The "day of slaughter" is a phrase the prophets used for the day of God's judgment. The day when accounts are finally settled.

And the image of fattening is deliberate. The fatted animal doesn't know what's coming. It experiences the extra feed, the rich pasture, the special care, as blessing. It's comfortable. It's well-fed. From its point of view, things are great. It has no idea that every extra pound is just one more mark toward its end.

James is saying that luxury without mercy looks like that from God's angle. You're fattening yourself. You're insulating yourself from anything that might disturb you. You're piling up comfort. And from heaven's perspective, it looks like a creature being readied for slaughter.

That's brutal. It's supposed to be.

And I want to be clear here. James isn't condemning enjoyment. He's not saying a good meal is sin. He's not saying a beach trip is a moral failure. Thank God. He's not anti-comfort. The problem is the word "self." Self-indulgence. Luxury that's entirely turned inward. Comfort that's been so carefully insulated from the cries in verse 4 that it can't even hear the wages screaming.

When comfort is built on someone else's deprivation, when we live well by ensuring others don't, when we fatten ourselves on resources that should have gone to the workers who earned them, that's what James is after.

James doesn't condemn being rich. He condemns being rich at the expense of others while calling yourself godly.

## The Sharpest Line

"You have condemned and murdered the righteous person. He does not resist you." — James 5:6, ESV

That word "condemned" is a legal term. A judicial verdict. These are people who used courts and contracts and legal mechanisms to strip others of their income and their means of living. Legally. With every form filled out correctly. In ways that wouldn't draw a second glance from the system.

And James calls it murder.

Because to deprive someone of their wages, to use institutional power to take away the thing that keeps their family alive, is to commit violence against them. Even if there's no blood on your hands.

There's an ancient Jewish wisdom book called Sirach that says it plainly: "To take away a neighbor's living is to murder him; to deprive an employee of wages is to shed blood."

And then the last line of the passage:

"He does not resist you."

The righteous person, the one who's been condemned and crushed, doesn't fight back. He can't. He doesn't have the money, or the lawyers, or the influence to contest it. So he doesn't. He takes it.

Some scholars read that line as a question. "Does he not resist you?" meaning God himself will be the one resisting on their behalf. There's something to that. But the plain reading has a different kind of weight. The victim is silent. The injustice goes uncontested from below.

But that silence is not the end of the story. That silence is the silence before the verdict.

And look, it's tempting to hear "condemned and murdered" and think, "Well that's clearly not me. I haven't sued anyone. I haven't literally starved anyone."

But James is writing to a community embedded in economic systems, not just to obvious bad actors. The person he's describing isn't a movie villain. He's a landowner. A businessperson. A respectable member of the community who has just quietly organized his life for maximum personal benefit and never asked the hard questions about who's carrying the cost.

"He does not resist you." That's the most dangerous kind of injustice. The kind nobody is fighting against. The kind that's become so normal we don't even feel the weight of it anymore.

## The Gospel Turn

But more than anything this morning, here's what I don't want us to miss, and it's easy to miss when the language is this intense.

James writes this passage knowing two kinds of people are going to read it. The people who've done the crushing, and the people who've been crushed. And he speaks to both.

To the landowners, to the accumulators, to the comfortable, there's still time.

Notice the verb tense. The miseries are "coming," not yet arrived. The cries have entered God's ears, but the verdict hasn't fully fallen yet. James is writing like the Old Testament prophets he's clearly drawing from, and the prophets didn't pronounce doom because they wanted the doom to happen. They pronounced doom because they wanted it to be avoidable. The woe was a mercy spoken before the gavel came down.

It's a warning given because there's still time to respond.

And right after this passage, in verse 7, James turns immediately to the suffering community and says, "Be patient therefore, brothers." That word "therefore" is doing a lot. The pastoral comfort for the oppressed is inseparable from the judgment warning for the oppressor. If God will judge the one, the other can endure. The same God who hears the cry is the God who will right the wrong.

The danger for most of us isn't that we'll become obvious tyrants. The danger is more subtle than that. The danger is that we'll drift toward a version of Christianity that never really asks hard questions about money. That replaces the cry of the workers with the hum of our own contentment. That calls hoarding "stewardship" and calls self-indulgence "enjoying God's blessings."

So what does repentance actually look like here? I think James keeps it concrete, and we should too.

One: It looks like paying promptly and fairly. Whoever works for you, with you, or near you. Whether that's a contractor, an employee, your kid's babysitter, the person who cleans your house, anyone who does something and needs to be paid for it. Pay them. Don't make them chase their money. Don't drag it out. Don't use the leverage you have. Pay what you owe, on time, without games.

Two: It looks like examining your generosity not as a percentage but as an orientation. Is money moving through you toward others, or is it piling up around you? Are you a riverbed, or are you a reservoir? You can give 10 percent and still be a reservoir. You can have very little and still be a riverbed. The question isn't just the percentage. The question is the direction of the flow.

Three: It looks like holding your wealth loosely enough that you could actually let it go if God asked you to. That's what "the last days" pressure is about. We're already in the last days. The Judge is near. The things you're gripping don't belong to you permanently. And the grip itself may be the thing costing you.

James 4:6, just one chapter back, says, "God opposes the proud but gives grace to the humble." The same God who is mobilized against injustice is the God who receives repentance. The same Lord of hosts who heard the cry of the workers can hear the confession of the wealthy.

He'll receive both. He's that kind of God.

## Closing

So back to the courtroom.

James builds it in six verses, and he calls his exhibits.

Exhibit A: rotting grain, moth-eaten garments, corroded gold. Your accumulation, testifying against you.

Exhibit B: crying wages, rising up out of the treasury where they don't belong, calling out to the Lord of armies.

Exhibit C: the fattened heart, comfortable and content, completely oblivious to what's coming.

And then the righteous person. Silent. Unable to fight back. Letting God do the fighting for him.

The verdict isn't delivered in this passage. The verdict comes later. But James writes the opening argument so that we'll know which side of the case we want to be on.

And, you know, evidence doesn't change in the courtroom. Whatever happened, happened. What can change is whether there's more evidence to come. Evidence of a different kind. Evidence of repentance. Evidence of restitution. Evidence of a life that started moving in a different direction because it took the warning seriously.

The God who hears the cries of the workers is also the God who gives grace to the humble. The same God who's mobilized by injustice is the God who receives repentance.

So here's where I want to land this morning.

If you've been on the receiving end. If you know what it's like to be on the powerless side of an injustice you couldn't fight. If somebody used leverage against you and you had no way to push back. If you've watched somebody with more money or more power do something to you that the system wasn't going to address. Hear this.

God heard it.

You may not have seen justice yet. You may never see it in this lifetime. It may feel like the silence has just swallowed it. But it reached His ears. And the Lord of hosts is not a passive observer. The Judge is standing at the door. He's not far away. He's not asleep. Justice is coming.

And if you're in the other category. If something in this passage pressed on the right nerve, the response isn't despair. The response is repentance. Practical, specific, costly repentance. Not just a feeling on Sunday sitting in a pew. An actual action this week. A payment you make. A habit you change. A hand you open. A conversation you have. A check you write.

The Judge is standing at the door. That's James 5:9, just a few verses from where we are. The courtroom is already in session.

The question is what the evidence is going to say.

## Closing Prayer

Lord, we've sat with hard words this morning. Words that were meant to be hard. Words that come from a God who actually cares about justice. Who hears the cry of the worker. Who sees through our accumulation to the heart underneath it.

We don't want to leave this room unchanged.

Where we've hoarded, give us open hands. Where we've ignored the cry, give us ears that hear. Where we've used what we have to protect ourselves at someone else's expense, give us courage to make it right.

And for those who've been the righteous person who just endured. Who brought their cry to you without seeing the answer yet. Remind them today that you heard. That the Lord of hosts is not indifferent. That the Judge is near.

We pray in the name of Jesus, who was himself the righteous one who did not resist. Who let injustice fall on him so that we could have a case for acquittal.

Amen.`;

// Code fallback so the site keeps working before/without the sermons table.
// DB rows (managed at /staff/sermons) take precedence by slug.
/* Sermons that live in code rather than Postgres. Empty on this site: every
   sermon is a row managed at /staff/sermons. Kept so the ported reader code
   needs no changes. */
export const FALLBACK_SERMONS: Sermon[] = [];
/** A stored sermon row (staff view carries id + published). */
export type SermonRecord = Sermon & { id: number | null; published: boolean };

// Select all columns so reads survive schema drift (e.g. youtube_id_full before
// migration 0014 runs — a named-column select would error on the missing column).
const COLS = "*";

type SeriesEmbed = { title: string | null; slug: string | null; artwork_url: string | null; background_url?: string | null };
type Row = {
  category?: string | null;
  id: number;
  slug: string;
  title: string;
  subtitle?: string | null;
  series: string | null;
  series_id?: number | null;
  sermon_series?: SeriesEmbed | SeriesEmbed[] | null;
  speaker: string | null;
  speakers?: string[] | null;
  passage: string | null;
  scripture?: string[] | null;
  topics?: string[] | null;
  date: string | null;
  youtube_id: string | null;
  youtube_id_full: string | null;
  canonical_url: string | null;
  document_url?: string | null;
  document_name?: string | null;
  web_link_1_url?: string | null;
  web_link_1_label?: string | null;
  web_link_2_url?: string | null;
  web_link_2_label?: string | null;
  artwork_url?: string | null;
  hero_still_url?: string | null;
  hero_still_candidates?: string[] | null;
  hero_cutout_url?: string | null;
  hero_focal_x?: number | null;
  hero_focal_y?: number | null;
  hero_target_x?: number | null;
  hero_target_y?: number | null;
  hero_zoom?: number | null;
  week?: number | null;
  summary: string | null;
  description?: string | null;
  body: string | null;
  status?: string | null;
  scheduled_at?: string | null;
  published: boolean;
};

function rowToSermon(r: Row): Sermon {
  const emb = Array.isArray(r.sermon_series) ? r.sermon_series[0] : r.sermon_series;
  const speakers = (r.speakers ?? []).filter(Boolean);
  const scripture = (r.scripture ?? []).filter(Boolean);
  return {
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle ?? undefined,
    series: r.series ?? emb?.title ?? undefined,
    seriesId: r.series_id ?? undefined,
    seriesTitle: emb?.title ?? undefined,
    seriesSlug: emb?.slug ?? undefined,
    seriesArtworkUrl: emb?.artwork_url ?? undefined,
    seriesBackgroundUrl: emb?.background_url ?? undefined,
    speaker: speakers[0] ?? r.speaker ?? "Austin W. Duncan",
    speakers: speakers.length ? speakers : r.speaker ? [r.speaker] : undefined,
    passage: scripture[0] ?? r.passage ?? "",
    scripture: scripture.length ? scripture : r.passage ? [r.passage] : undefined,
    topics: (r.topics ?? []).filter(Boolean),
    date: r.date ?? undefined,
    youtubeId: r.youtube_id ?? undefined,
    youtubeIdFull: r.youtube_id_full ?? undefined,
    canonicalUrl: r.canonical_url ?? undefined,
    documentUrl: r.document_url ?? undefined,
    documentName: r.document_name ?? undefined,
    webLink1Url: r.web_link_1_url ?? undefined,
    webLink1Label: r.web_link_1_label ?? undefined,
    webLink2Url: r.web_link_2_url ?? undefined,
    webLink2Label: r.web_link_2_label ?? undefined,
    artworkUrl: r.artwork_url ?? undefined,
    heroStillUrl: r.hero_still_url ?? undefined,
    heroCutoutUrl: r.hero_cutout_url ?? undefined,
    heroStillCandidates: r.hero_still_candidates ?? undefined,
    heroFocalX: r.hero_focal_x ?? undefined,
    heroFocalY: r.hero_focal_y ?? undefined,
    heroTargetX: r.hero_target_x ?? undefined,
    heroTargetY: r.hero_target_y ?? undefined,
    heroZoom: r.hero_zoom ?? undefined,
    week: r.week ?? undefined,
    category: isCategory(r.category) ? r.category : "sermon",
    summary: r.summary ?? r.description ?? "",
    description: r.description ?? undefined,
    body: r.body ?? "",
    status: (r.status as SermonStatus) ?? (r.published ? "published" : "draft"),
    scheduledAt: r.scheduled_at ?? undefined,
  };
}

// Embed the linked series so the page can fall back to series artwork.
const SELECT_FULL = "*, sermon_series(title,slug,artwork_url,background_url)";

// Visible = published, or scheduled whose time has passed (no cron needed).
function visibleOr(): string {
  const now = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  return `status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`;
}

/** Public: a single visible sermon, or the code fallback. */
export async function getSermon(slug: string): Promise<Sermon | null> {
  const db = supabaseAnon();
  if (db) {
    try {
      const withStatus = await db
        .from("sermons")
        .select(SELECT_FULL)
        .eq("slug", slug)
        .or(visibleOr())
        .maybeSingle();
      if (!withStatus.error) {
        if (withStatus.data) return rowToSermon(withStatus.data as Row);
      } else {
        // Pre-migration (no status/series_id columns): fall back to the boolean.
        const legacy = await db
          .from("sermons")
          .select(COLS)
          .eq("slug", slug)
          .eq("published", true)
          .maybeSingle();
        if (legacy.data) return rowToSermon(legacy.data as Row);
      }
    } catch {
      /* table missing / offline — fall through */
    }
  }
  return FALLBACK_SERMONS.find((s) => s.slug === slug) ?? null;
}

/** Public: all visible sermons (DB), merged with any fallback not in the DB. */
/** Published pieces of one category, newest first. */
export async function getPublishedByCategory(category: Category): Promise<Sermon[]> {
  const all = await getPublishedSermons();
  return all.filter((s) => s.category === category);
}

export async function getPublishedSermons(): Promise<Sermon[]> {
  const db = supabaseAnon();
  let rows: Sermon[] = [];
  if (db) {
    try {
      const withStatus = await db
        .from("sermons")
        .select(SELECT_FULL)
        .or(visibleOr())
        .order("date", { ascending: false })
        .order("sort_order");
      if (!withStatus.error) {
        rows = (withStatus.data as Row[] | null)?.map(rowToSermon) ?? [];
      } else {
        const legacy = await db
          .from("sermons")
          .select(COLS)
          .eq("published", true)
          .order("date", { ascending: false })
          .order("sort_order");
        rows = (legacy.data as Row[] | null)?.map(rowToSermon) ?? [];
      }
    } catch {
      /* ignore */
    }
  }
  const have = new Set(rows.map((s) => s.slug));
  return [...rows, ...FALLBACK_SERMONS.filter((s) => !have.has(s.slug))];
}

/** Staff: every sermon incl. drafts (service role). */
export async function getAllSermons(): Promise<SermonRecord[]> {
  const db = supabaseService();
  if (!db) {
    return FALLBACK_SERMONS.map((s) => ({ ...s, id: null, published: false }));
  }
  try {
    let res = await db
      .from("sermons")
      .select(SELECT_FULL)
      .order("date", { ascending: false })
      .order("sort_order");
    if (res.error) {
      res = await db
        .from("sermons")
        .select(COLS)
        .order("date", { ascending: false })
        .order("sort_order");
    }
    const rows = (res.data as Row[] | null) ?? [];
    const records: SermonRecord[] = rows.map((r) => ({
      ...rowToSermon(r),
      id: r.id,
      published: r.published,
    }));
    const have = new Set(records.map((s) => s.slug));
    // Surface fallback sermons not yet in the DB so staff can import them.
    for (const s of FALLBACK_SERMONS) {
      if (!have.has(s.slug)) records.push({ ...s, id: null, published: false });
    }
    return records;
  } catch {
    return FALLBACK_SERMONS.map((s) => ({ ...s, id: null, published: false }));
  }
}
