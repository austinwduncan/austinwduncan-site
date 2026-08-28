-- A colour per channel.
--
-- All five panels run footage of Austin in similar rooms, so they read as one
-- thing seen five times. A wash in the channel's own colour is what separates
-- them at a glance, before a wordmark is even read.
--
-- Values are drawn from the dominant hue of each channel's own artwork and then
-- saturated, because measured straight they sit between 23 and 35 percent
-- brightness and are far too close to tell apart.

alter table collections add column if not exists accent text;

comment on column collections.accent is
  'Hex wash for this channel, derived from its own artwork. Used over video and nowhere as text.';

update collections set accent = '#7A4A2A' where slug = 'sermons';
update collections set accent = '#8A6A2F' where slug = 'in-the-text';
update collections set accent = '#A33B2E' where slug = 'word-for-word';
update collections set accent = '#1F6B72' where slug = 'exegetica';
update collections set accent = '#3A4A5C' where slug = 'forum-and-pulpit';
