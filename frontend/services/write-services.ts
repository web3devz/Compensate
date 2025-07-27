import { InputTransactionData } from '@aptos-labs/wallet-adapter-react'
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk'


export async function createOrgMove(
  org_name: string,
  signAndSubmitTransaction: (transaction: InputTransactionData) => Promise<{ hash: string }>
) {
  const aptosConfig = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(aptosConfig);
  const rawTxn: InputTransactionData = {
    data: {
      function: `${process.env.NEXT_PUBLIC_MODULE_ADDRESS}::simplepayroll::add_organization`,
      functionArguments: [ process.env.NEXT_PUBLIC_CONTRACT_OWNER, org_name],
    }
  }
  const pendingTxn = await signAndSubmitTransaction(rawTxn);
  const response = await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
  return response
}

export async function addEmployeeMove(
  employeeAddress: string,
  employeeCommitment: string,
  salary: number,
  signAndSubmitTransaction: (transaction: InputTransactionData) => Promise<{ hash: string }>
) {
  const aptosConfig = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(aptosConfig);
  const rawTxn: InputTransactionData = {
    data: {
      function: `${process.env.NEXT_PUBLIC_MODULE_ADDRESS}::simplepayroll::add_employee`,
      functionArguments: [employeeAddress ,employeeCommitment, process.env.NEXT_PUBLIC_CONTRACT_OWNER, salary * 10e8,],
    }
  }
  const pendingTxn = await signAndSubmitTransaction(rawTxn);
  const response = await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
  return response
}

export async function verifyEmployee(
  employeeAddress: string,
  inputString: string,
  signAndSubmitTransaction: (transaction: InputTransactionData) => Promise<{ hash: string }>
){
  const aptosConfig = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(aptosConfig);
 
  //const inputString="VerifyingKey { alpha: \"829a235fb924dfd5151f1259a85e6e7b03d2c212ebea5d0e2025ef13c79eadcabcb405e83ca49ee4aab637ac77577054\", beta: \"b71925bba52a3b51afb059345bd411b831f3a40b6b3d34c0c2c35c2abad22a2ebdff9e7998a513450b97bef4fa30bb4f0f5ac8d1446e0bebc33ecb30b6afdbf963267c979b482b5e45d21f3469bfc7fe0c66fd4a89cd86111ab5b42552172b98\", gamma: \"8476b832c8a59ebb772fe98a39ec06a4ad326ad5827df8ab4bc56eb88148f65f477c5987497c2a96bbfd37fd72a4eae30c83c997fa8a4c38763966d3d904ed8282564630d4cd8868749d7e3266653177f68171fb24f56f81751fd0dabb3c9948\", delta: \"b79b65462298f0468e821fb72fdf632f205ce301aee082d8555084bfc280ace76459bebfd2cf7cdcb54f2027342d721b07857ed9bf51929145fa46b42aca26ab171be519115bdb61ff37dfcee0f43688f77a3da6dc4417cb2822baf881626017\", gamma_abc: [\"8902afbb3acfdc00df4898de1165d4e1b41240fe56a2bbb877a53d76cb055139e4822caed5d346650ea41b2efcc505f2\", \"8d7706914a72d4cd7d757b72f5a45e7838ada7e8329b1f71b7c05bd274f781710e94e964bc989d533229e5e111eed655\"] },Proof { a: \"b5d3b7c6f6931026e38721d05204ec17d1e586f2f60ee0c240cfa974f96a45e2f278c030b99f44e609f3dd1ff92e6a5e\", b: \"b6c7bfea525afbc4ac4d9a40caa53afd0965e3cb6a9f3aee0a64b143177c0afaaed610042d094b36d8bda6c327ac881b1599f321ee71ffccb0020c72c9eb4c37aa70b5985c4633a353ee2afec0d3ae94647dec6e20999a4bf7ce3c185e080e95\", c: \"ae271c3c2e228b64d0441789853bbb7f05cf5ddf251005f6ddaa4a37563be2b905a6e4c499f626d1eafb1d02763f1898\" },\"0000000000000000000000000000000000000000000000000000000000000000\""
  const alphaRegex = /alpha: "(.*?)"/;
  const betaRegex = /beta: "(.*?)"/;
  const gammaRegex = /gamma: "(.*?)"/;
  const deltaRegex = /delta: "(.*?)"/;
  const gammaAbcRegex = /gamma_abc: \[(.*?)\]/; 
  const proofARegex = /Proof { a: "(.*?)"/;
  const proofBRegex = /b: "(.*?)"/;
  const proofCRegex = /c: "(.*?)"/;
  const inputArrayRegex = /\[\s*(?:0\s*,\s*)*0\s*\]/;

  const alphaMatch = alphaRegex.exec(inputString);
  const betaMatch = betaRegex.exec(inputString);
  const gammaMatch = gammaRegex.exec(inputString);
  const deltaMatch = deltaRegex.exec(inputString);
  const gammaAbcMatch = gammaAbcRegex.exec(inputString);
  const proofAMatch = proofARegex.exec(inputString);
  const proofBMatch = proofBRegex.exec(inputString);
  const proofCMatch = proofCRegex.exec(inputString);
  const inputArrayMatch = inputArrayRegex.exec(inputString);

  const alpha = alphaMatch ? alphaMatch[1] : null;
  const beta = betaMatch ? betaMatch[1] : null;
  const gamma = gammaMatch ? gammaMatch[1] : null;
  const delta = deltaMatch ? deltaMatch[1] : null;
  const gammaAbc = gammaAbcMatch ? gammaAbcMatch[1].split(',').map(item => item.trim().replace(/"/g, '')) : [];  // Parsing gamma_abc array
  const proofA = proofAMatch ? proofAMatch[1] : null;
  const proofB = proofBMatch ? proofBMatch[1] : null;
  const proofC = proofCMatch ? proofCMatch[1] : null;
  const inputArray = inputArrayMatch ? [JSON.parse(inputArrayMatch[0])] : null;

  console.log(inputString);
  console.log("Alpha:", alpha);
  if (alpha && beta && gamma && delta && gammaAbc && proofA && proofB && proofC) {
      console.log("Alpha Vector", Array.from(Buffer.from(alpha, 'hex')));
      console.log("Beta Vector", Array.from(Buffer.from(beta, 'hex')));
      console.log("Gamma Vector", Array.from(Buffer.from(gamma, 'hex')));
      console.log("Delta Vector", Array.from(Buffer.from(delta, 'hex')));
      console.log("Gamma_abc_1 Vector", Array.from(Buffer.from(gammaAbc[0], 'hex')));
      console.log("Gamma_abc_2 Vector", Array.from(Buffer.from(gammaAbc[1], 'hex')));
      console.log("Proof A Vector", Array.from(Buffer.from(proofA, 'hex')));
      console.log("Proof B Vector", Array.from(Buffer.from(proofB, 'hex')));
      console.log("Proof C Vector", Array.from(Buffer.from(proofC, 'hex')));
      const combinedArray = [
          Array.from(Buffer.from(gammaAbc[0], 'hex')),
          Array.from(Buffer.from(gammaAbc[1], 'hex'))
      ];
      const combinedInputs=[
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
      console.log(combinedInputs)
      console.log(combinedArray)
      console.log(inputArray)
      const rawTxn: InputTransactionData = {
          data: {
          function: `${process.env.NEXT_PUBLIC_MODULE_ADDRESS}::simplepayroll::verify_employee`,
          functionArguments: [
                  process.env.NEXT_PUBLIC_CONTRACT_OWNER,
                  employeeAddress,
                  Array.from(Buffer.from(alpha, 'hex')),
                  Array.from(Buffer.from(beta, 'hex')),
                  Array.from(Buffer.from(gamma, 'hex')),
                  Array.from(Buffer.from(delta, 'hex')),
                  combinedArray,
                  inputArray,
                  Array.from(Buffer.from(proofA, 'hex')),
                  Array.from(Buffer.from(proofB, 'hex')),
                  Array.from(Buffer.from(proofC, 'hex')),
              ],
          }
      }
      const pendingTxn = await signAndSubmitTransaction(rawTxn);
      const response = await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
      return response
  } else {
      console.log("Alpha is null or undefined");
  }
}

export async function paySalaryMove(
  employeeAddress: string,
  signAndSubmitTransaction: (transaction: InputTransactionData) => Promise<{ hash: string }>
){
  const aptosConfig = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(aptosConfig);
  const rawTxn: InputTransactionData = {
    data: {
      function: `${process.env.NEXT_PUBLIC_MODULE_ADDRESS}::simplepayroll::payout`,
      functionArguments: [employeeAddress, process.env.NEXT_PUBLIC_CONTRACT_OWNER],
    }
  }
  const pendingTxn = await signAndSubmitTransaction(rawTxn);
  const response = await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
  return response
}

export async function fundTreasuryMove(
  amount: number,
  signAndSubmitTransaction: (transaction: InputTransactionData) => Promise<{ hash: string }>
) {
  const aptosConfig = new AptosConfig({ network: Network.TESTNET });
  const aptos = new Aptos(aptosConfig);
  const rawTxn: InputTransactionData = {
    data: {
      function: `${process.env.NEXT_PUBLIC_MODULE_ADDRESS}::simplepayroll::fund_organization_treasury`,
      functionArguments: [process.env.NEXT_PUBLIC_CONTRACT_OWNER,amount],
    }
  }
  const pendingTxn = await signAndSubmitTransaction(rawTxn);
  const response = await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
  return response
}
