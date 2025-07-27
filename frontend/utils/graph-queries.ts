import { gql } from '@apollo/client'

export const EMPLOYEE_ADDED_MOVE = gql`
  query EmployeeAddedMove($companyAccount: String!, $accountAddress: String!) {
    events(
      where: {
        account_address: {_eq: $accountAddress},
        indexed_type: {_ilike: "${process.env.NEXT_PUBLIC_MODULE_ADDRESS}%EmployeeAddedEvent%"},
        data: {_contains: {company_account: $companyAccount}}
      }
    ) {
      id: sequence_number
      activity: data(path: "activity")
      company_account: data(path: "company_account")
      daily_salary: data(path: "daily_salary")
      employee_account: data(path: "employee_account")
      timestamp: data(path: "timestamp")
      transaction_version: transaction_version
    }
  }
`
export const GET_EMPLOYEE_MOVE = gql`
  query GetEmployeeMove($companyAccount: String!, $accountAddress: String!) {
    events(
      where: {
        account_address: {_eq: $accountAddress},
        indexed_type: {_ilike: "${process.env.NEXT_PUBLIC_MODULE_ADDRESS}%EmployeeAddedEvent%"},
        data: {_contains: {company_account: $companyAccount}}
      }
    ) {
      id: sequence_number
      company_account: data(path: "company_account")
      daily_salary: data(path: "daily_salary")
      employee_account: data(path: "employee_account")
      timestamp: data(path: "timestamp")
      transaction_version: transaction_version
    }
  }
`

export const ORG_ADDED_MOVE= gql`
  query OrgAddedMove($companyAccount: String!, $accountAddress: String!) {
    events(
      where: {
        account_address: {_eq: $accountAddress},
        indexed_type: {_ilike: "${process.env.NEXT_PUBLIC_MODULE_ADDRESS}%OrganizationAddedEvent%"},
        data: {_contains: {org_address: $companyAccount}}
      }
    ) {
      id: sequence_number
      companyName: data(path: "org_name")
      companyAddress: data(path: "org_address")
      timestamp: data(path: "timestamp")
      transaction_version: transaction_version
    }
  }
`

export const ORG_FUNDED_MOVE = gql`
    query OrgFundedMove($companyAccount: String!, $accountAddress: String!) {
    events(
      where: {
        account_address: {_eq: $accountAddress},
        indexed_type: {_ilike: "${process.env.NEXT_PUBLIC_MODULE_ADDRESS}%TreasuryFundedEvent%"},
        data: {_contains: {org_address: $companyAccount}}
      }
    ) {
      id: sequence_number
      companyAddress: data(path: "org_address")
      amount: data(path: "amount")
      timestamp: data(path: "timestamp")
      transaction_version: transaction_version
    }
  }
`

export const PAYOUT_RECEIVED = gql`
    query PayoutReceived($companyAccount: String!, $accountAddress: String!) {
    events(
      where: {
        account_address: {_eq: $companyAccount},
        indexed_type: {_ilike: "${process.env.NEXT_PUBLIC_MODULE_ADDRESS}%PayoutMadeEvent%"},
        data: {_contains: {employee_account: $accountAddress}}
      }
    ) {
      id: sequence_number
      salary: data(path: "amount")
      employee: data(path: "employee_account")
      timestamp: data(path: "timestamp")
      transaction_version: transaction_version
    }
  }
`
