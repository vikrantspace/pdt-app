export type UserRole =
  | 'developer'
  | 'team_head'
  | 'pdt_head'
  | 'ceo'
  | 'cfo'
  | 'production'
  | 'marketing'
  | 'academic_support'
  | 'education'
  | 'it'
  | 'accounts'

export type StageStatus = 'locked' | 'in_progress' | 'submitted' | 'approved'

export interface Company {
  id: string
  name: string
  code: string
}

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  company_id: string
  company?: Company
}

export interface Request {
  id: string
  request_code: string
  project_name: string
  description: string
  requestor_id: string
  company_id: string
  status: 'pending' | 'approved' | 'rejected' | 'active'
  created_at: string
  requestor?: Profile
  company?: Company
}

export interface Project {
  id: string
  request_id: string
  program_code: string | null
  current_stage: number
  status: string
  developer_id: string
  created_at: string
  request?: Request
  developer?: Profile
  stages?: ProjectStage[]
}

export interface ProjectStage {
  id: string
  project_id: string
  stage_number: number
  status: StageStatus
  dev_signed_by: string | null
  dev_signed_at: string | null
  teamhead_signed_by: string | null
  teamhead_signed_at: string | null
  pdthead_signed_by: string | null
  pdthead_signed_at: string | null
  pdt_approval_note: string | null
  checklist_items?: ChecklistItem[]
}

export interface ChecklistItem {
  id: string
  stage_id: string
  item_text: string
  notes: string | null
  dev_checked: boolean
  pdt_checked: boolean
  order_num: number
}

// Static stage metadata
export interface StageMeta {
  number: number
  name: string
  description: string
  checklist: { item: string; notes: string; pdt?: boolean }[]
}
