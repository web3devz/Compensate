pragma circom 2.1.3;


template PasswordVerification() {
   
    signal input employeeHashedCommitment;
    signal input employeerHashedCommitment;
    
    signal output out;

    out <== employeeHashedCommitment - employeerHashedCommitment;
    out ===0 ;
}

component main = PasswordVerification();  