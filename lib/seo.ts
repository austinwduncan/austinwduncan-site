import fs from 'node:fs'
import path from 'node:path'

/*
  Shared URL helpers: the origin is named once here so nothing hand writes
  "https://austinwduncan.com" again.
*/

export const SITE_URL = 'https://austinwduncan.com'

/** Absolute URL for a site relative path. */
export function absolute(pathname: string): string {
  return pathname === '/' ? SITE_URL : `${SITE_URL}${pathname}`
}

/*
  Does a route file exist for this path shape. Runs where the app/ source tree
  is on disk; anywhere else it returns false, which fails in the safe direction.
*/
export function routeExists(appRelativePath: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), 'app', appRelativePath))
  } catch {
    return false
  }
}
