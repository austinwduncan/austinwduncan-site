import { createClient, type SanityClient } from 'next-sanity'
import { projectId, dataset, apiVersion } from '../env'

let _client: SanityClient | null = null

export function getClient(): SanityClient | null {
  if (!projectId) return null
  if (!_client) {
    _client = createClient({ projectId, dataset, apiVersion, useCdn: true })
  }
  return _client
}
