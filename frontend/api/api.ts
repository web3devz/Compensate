export async function addEmployeeAPI(name: string, jobTitle: string, walletAddress: string) {
    try {
      const response = await fetch("http://localhost:8081/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode:'cors',
        body: JSON.stringify({
          name: name,
          job_title: jobTitle,
          address: walletAddress,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add employee.");
      }
  
      //const result = await response.json();
      return response;
    } catch (error) {
      console.error("Error adding employee:", error);
      throw new Error("An unexpected error occurred.");
    }
  }

  // services/userService.ts
export async function getUserByAddress(address: string) {
    try {
      const response = await fetch(`http://localhost:8081/user/${address}`, {
        method: "GET",
      });
  
      if (!response.ok) {
        throw new Error(`Failed to get user with address: ${address}`);
      }
  
      const user = await response.json();
      return user;
    } catch (error) {
      console.error("Error fetching user by address:", error);
      throw error;
    }
  }

// services/userService.ts
export async function getAllUsers() {
    try {
      const response = await fetch("http://localhost:8081/users", {
        method: "GET",
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
  
      const users = await response.json();
      return users; // Return array of users
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  }

// services/zkpService.ts
export async function verifyUserCommitment(name: string, jobTitle: string, walletAddress: string) {
    try {
      const response = await fetch(`http://localhost:8081/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode:'cors',
        body: JSON.stringify({
          name: name,
          job_title: jobTitle,
          address: walletAddress,
        }),

      });
  
      if (!response.ok) {
        throw new Error(`Failed to verify user with address: ${walletAddress}`);
      }
  
      let result = await response.text();
      if (result.startsWith('"') && result.endsWith('"')) {
        result = result.slice(1, -1);
      }
      result = result.replace(/\\+/g, '');
      return result; 
    } catch (error) {
      console.error("Error verifying user commitment:", error);
      throw error;
    }
  }
  
  