/*
  Row shapes for the tables the Library reads.

  Hand-maintained rather than checked in from `supabase gen types`, because the
  read layer touches sixteen of the twenty tables and the generated file also
  carries Insert, Update and Relationship shapes that nothing here uses. If the
  schema drifts, regenerate with:

    npx supabase gen types typescript --project-id <ref> > /tmp/db.ts

  and reconcile. The columns below match migrations 0001 through 0007.
*/

export type ContentRow = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  summary: string | null
  body: unknown | null
  body_text: string | null
  format_id: number | null
  level_id: number | null
  collection_id: number | null
  series_id: number | null
  series_position: number | null
  status: string
  published_at: string | null
  reading_minutes: number | null
  featured_image: string | null
  seo_title: string | null
  seo_description: string | null
  legacy_source: string | null
  legacy_id: string | null
  created_at: string
  updated_at: string
}

export type CollectionRow = {
  id: number
  slug: string
  name: string
  tagline: string | null
  description: string | null
  artwork_url: string | null
  logo_url: string | null
  blurb: string | null
  position: number
}

export type SeriesRow = {
  id: number
  slug: string
  name: string
  subtitle: string | null
  description: string | null
  artwork_url: string | null
  collection_id: number | null
  is_complete: boolean
  position: number
}

export type TopicRow = {
  id: number
  slug: string
  name: string
  description: string | null
  parent_id: number | null
}

export type DoctrineRow = { id: number; slug: string; name: string; description: string | null }
export type FormatRow = { id: number; slug: string; name: string; position: number }
export type ApproachRow = { id: number; slug: string; name: string; position: number }
export type LevelRow = { id: number; slug: string; name: string; depth: number }

export type BibleBookRow = {
  id: number
  slug: string
  name: string
  abbreviation: string | null
  testament: string
  position: number
  chapter_count: number
}

export type ScriptureReferenceRow = {
  id: number
  content_id: string
  book_id: number
  chapter_start: number
  verse_start: number | null
  chapter_end: number | null
  verse_end: number | null
  is_primary: boolean
  is_sweep: boolean
  start_ref: number
  end_ref: number
  source: string
  confidence: number | null
}

export type MediaRow = {
  id: number
  content_id: string
  kind: string
  provider: string | null
  url: string
  external_id: string | null
  duration_secs: number | null
  position: number
}

export type ContentTopicRow = {
  content_id: string
  topic_id: number
  is_primary: boolean
  source: string
  confidence: number | null
}

export type ContentDoctrineRow = { content_id: string; doctrine_id: number; source: string }
export type ContentApproachRow = { content_id: string; approach_id: number; source: string }
export type SlugHistoryRow = { id: number; content_id: string; old_path: string }
export type ContentRelationRow = {
  id: number
  source_id: string
  target_id: string
  relation: string
  confidence: number | null
}

/*
  supabase-js needs Insert and Update shapes alongside Row to infer query
  results. The Library only reads, so both are derived from Row rather than
  hand-written twice.
*/
type Table<R> = { Row: R; Insert: Partial<R>; Update: Partial<R>; Relationships: [] }

export type Database = {
  public: {
    Tables: {
      content: Table<ContentRow>
      collections: Table<CollectionRow>
      series: Table<SeriesRow>
      topics: Table<TopicRow>
      doctrines: Table<DoctrineRow>
      formats: Table<FormatRow>
      approaches: Table<ApproachRow>
      levels: Table<LevelRow>
      bible_books: Table<BibleBookRow>
      scripture_references: Table<ScriptureReferenceRow>
      media: Table<MediaRow>
      content_topics: Table<ContentTopicRow>
      content_doctrines: Table<ContentDoctrineRow>
      content_approaches: Table<ContentApproachRow>
      content_slug_history: Table<SlugHistoryRow>
      content_relations: Table<ContentRelationRow>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
