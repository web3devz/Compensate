import { createHash } from 'crypto';

export const getColorClass = (type:string) => {
    switch (type) {
      case 'order1':
        return 'text-green-500';
      case 'order2':
        return 'text-yellow-500';
      case 'order3':
        return 'text-blue-500';
      case 'order4':
        return 'text-red-500';
      default:
        return 'text-purple'; 
    }
};


function generateSha256Hash(input: string): string {
    const hash = createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
}

export function generateCommitment(name: string, jobTitle: string, address: string): string {
    const inputCommitment = `${name}${jobTitle}${address}`;
    return generateSha256Hash(inputCommitment);
}

export function formatAddress(address: string, prefixLength = 6, suffixLength = 4): string {
  if (address.length <= prefixLength + suffixLength) {
      return address;
  }
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}