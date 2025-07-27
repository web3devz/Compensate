import { getUserByAddress } from "@/api/api";
import { Address, Employee, Organization } from "@/state/types";
import {Aptos, AptosConfig, InputViewFunctionData, Network} from "@aptos-labs/ts-sdk";

export async function fetchEmployeesMove(orgAddress: Address){
    const aptosConfig = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(aptosConfig);
  
    const payload: InputViewFunctionData = {
      function: `${process.env.NEXT_PUBLIC_MODULE_ADDRESS}::simplepayroll::get_org_employees`,
      functionArguments: [orgAddress, process.env.NEXT_PUBLIC_CONTRACT_OWNER],
    }
    const result = await aptos.view({
      payload
    });
  }
  
  export async function fetchEmployeeMove(employeeAddress: Address) {
    const aptosConfig = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(aptosConfig);
  
    const payload: InputViewFunctionData = {
      function: `${process.env.NEXT_PUBLIC_MODULE_ADDRESS}::simplepayroll::get_employee`,
      functionArguments: [employeeAddress, process.env.NEXT_PUBLIC_CONTRACT_OWNER],
    }
    const result = await aptos.view({
      payload
    });
    const employeeDetails = await getUserByAddress(employeeAddress)
    return {
      address: result[0],
      employeeName: employeeDetails.name,
      orgAddress: result[2],
      verified: false,
      salary: Number(result[3]),
      activity: employeeDetails.job_title,
      daysWorked: Number(result[4]),
    } as Employee
  }

  export async function fetchEmployeeIsVerified(employeeAddress: Address){
    const aptosConfig = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(aptosConfig);
  
    const payload: InputViewFunctionData = {
      function: `${process.env.NEXT_PUBLIC_MODULE_ADDRESS}::simplepayroll::get_empl_is_verified`,
      functionArguments: [employeeAddress, process.env.NEXT_PUBLIC_CONTRACT_OWNER],
    }
    const result = await aptos.view({
      payload
    });

    return{
      verified: result[0]
    }
  }

  
  export async function fetchOrganizationMove(orgAddress: Address) {
    const aptosConfig = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(aptosConfig);
  
    let payload: InputViewFunctionData = {
      function: `${process.env.NEXT_PUBLIC_MODULE_ADDRESS}::simplepayroll::get_organization`,
      functionArguments: [orgAddress, process.env.NEXT_PUBLIC_CONTRACT_OWNER],
    }
    const result = await aptos.view({
      payload
    });
  
    payload = {
      function: `${process.env.NEXT_PUBLIC_MODULE_ADDRESS}::simplepayroll::get_org_employees`,
      functionArguments: [orgAddress, process.env.NEXT_PUBLIC_CONTRACT_OWNER],
    }
    const result2=await aptos.view({ 
      payload
    });
  
    let employees 
  
    if(Array.isArray(result2[0])){
      employees = await Promise.all(result2[0]?.map(async value =>{
        return await fetchEmployeeMove(value)
      }))
    }
    return {
      orgAddress: result[0],
      orgName: result[1],
      orgTreasury: Number(result[2]),
      employees: employees,
    } as Organization
  }
  