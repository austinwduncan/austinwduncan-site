-- Channels carry real branding.
--
-- Austin made logos for Word for Word, Exegetica, Forum & Pulpit and the
-- teaching series. Nothing referenced them, so every channel was announced by
-- a text heading and a name a visitor has to already understand.
--
-- logo_url is the white-on-transparent mark for the dark ground. blurb is a
-- plain sentence saying what the channel IS, shown under the mark, because a
-- name alone does not tell anyone what Exegetica means.

alter table collections
  add column if not exists logo_url text,
  add column if not exists blurb text;

comment on column collections.logo_url is
  'White on transparent wordmark, for the dark ground. Null falls back to the name set in CMG Sans.';
comment on column collections.blurb is
  'One plain sentence saying what this channel is. Shown beneath the mark.';

update collections set
  logo_url = '/images/Logos/teaching-series-logo-white.png',
  blurb = 'Verse by verse through a book of the Bible, or a doctrine traced from end to end. Each study runs as a series you can follow in order.'
where slug = 'in-the-text';

update collections set
  logo_url = '/images/Logos/Word for Word Logo.webp',
  blurb = 'One honest question an episode. The hard ones people actually ask, answered from Scripture rather than around it.'
where slug = 'word-for-word';

update collections set
  logo_url = '/images/Logos/Exegetica Logo.png',
  blurb = 'Full length academic papers on the biblical text, with the Greek and Hebrew left in and the sources cited.'
where slug = 'exegetica';

update collections set
  logo_url = '/images/Logos/forum-and-pulpit-logo-white.png',
  blurb = 'What Scripture says about what is happening right now. Written in the week the news broke.'
where slug = 'forum-and-pulpit';

update collections set
  blurb = 'Sunday morning preaching from Crosswalk Church in Brentwood, Tennessee.'
where slug = 'sermons';
