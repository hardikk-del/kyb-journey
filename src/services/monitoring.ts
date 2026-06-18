/** Fake monitoring API for the live-portfolio surface. */
import { sleep } from '@/lib/sleep'
import { MONITORED } from '@/data/fixtures'
import type { MonitoredMerchant } from '@/data/types'

export async function listMonitored(): Promise<MonitoredMerchant[]> {
  await sleep(550)
  return MONITORED
}
