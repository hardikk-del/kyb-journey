/**
 * Fake applications API. List/detail screens read from these Promise-returning
 * functions so loading and error states are real. Latency is simulated and
 * deterministic; instant mode collapses it for rehearsal.
 */
import { sleep } from '@/lib/sleep'
import { APPLICATIONS, APPLICATIONS_BY_ID } from '@/data/fixtures'
import type { Application } from '@/data/types'

export async function listApplications(): Promise<Application[]> {
  await sleep(600)
  return APPLICATIONS
}

export async function getApplication(id: string): Promise<Application> {
  await sleep(450)
  const app = APPLICATIONS_BY_ID[id]
  if (!app) throw new Error(`Application not found: ${id}`)
  return app
}

/** Detect a duplicate/existing profile by anchor identifier (PAN/GSTIN). */
export async function findByAnchor(anchor: string): Promise<Application | undefined> {
  await sleep(500)
  const norm = anchor.replace(/\s+/g, '').toUpperCase()
  return APPLICATIONS.find(
    (a) =>
      a.anchor.toUpperCase() === norm ||
      a.entityPan?.toUpperCase() === norm ||
      a.gstin?.toUpperCase() === norm ||
      a.cin?.toUpperCase() === norm,
  )
}
