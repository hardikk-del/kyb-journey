/** Bank-side actors used in decisioning, maker-checker and the audit trail. */
export interface Officer {
  id: string
  name: string
  role: 'maker' | 'checker'
  title: string
}

export const OFFICERS: Record<string, Officer> = {
  iyer: { id: 'iyer', name: 'R. Iyer', role: 'maker', title: 'Onboarding officer' },
  desai: { id: 'desai', name: 'Meghna Desai', role: 'checker', title: 'Senior reviewer' },
}

export const MAKER = OFFICERS.iyer
export const CHECKER = OFFICERS.desai
