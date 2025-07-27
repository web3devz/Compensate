import type { AppDispatch, RootState } from './store'

export type Role = 'employee' | 'employer' | 'nill'

export type AppState = {
  role?: Role
  organization?: Organization
}

export enum FetchStatus {
  Idle,
  Loading,
  Success,
  Error,
}

export type ThunkConfig = {
  dispatch: AppDispatch
  state: RootState
  extra: any
}

export type Employee = {
  address: string
  employeeName: string
  orgAddress: string
  verified: boolean
  salary: number
  activity: string
  daysWorked: number
}

export type Organization = {
  orgAddress: string
  orgName: string
  orgTreasury: number
  employees?: Employee[]
} | undefined

export type Address = string
