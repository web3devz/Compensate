module simple_salary_addr::simplepayroll{
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::{Self,AptosCoin};
    use aptos_std::table::{Self, Table};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use std::string::{String, utf8};
    use std::vector;
    use std::debug;

    use aptos_std::crypto_algebra::{Element, from_u64, multi_scalar_mul, eq, multi_pairing, upcast, pairing, add, zero, deserialize};
    use aptos_std::bls12381_algebra::{Fr, FormatFrLsb, FormatG1Compr, FormatG2Compr, FormatFq12LscLsb, G1, G2, Gt, Fq12, FormatGt};

    use simple_salary_addr::Verifier;

    /// Errors
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_NOT_ORGANIZATION: u64 = 3;
    const E_NOT_ENOUGH_BALANCE: u64 = 4;
    const E_EMPLOYEE_NOT_FOUND: u64 = 5;
    const E_ORGANIZATION_NOT_FOUND: u64 = 6;

    struct Organization has key, store {
        org_address: address,
        org_name: String,
        org_treasury: Coin<AptosCoin>,
        employees: vector<address>,
    }

    struct Employee has store, drop, copy {
        employee_account: address,
        employee_commitment: String,
        company_account: address,
        daily_salary: u64,
        last_payed: u64,
        verified: bool
    }

    struct PayrollStorage has key {
        organizations: Table<address, Organization>,
        employees: Table<address, Employee>,
        org_added_event: EventHandle<OrganizationAddedEvent>,
        treasury_funded_event: EventHandle<TreasuryFundedEvent>,
        empl_added_event: EventHandle<EmployeeAddedEvent>,
        empl_verified_event: EventHandle<EmployeeVerifiedEvent>,
        payout_made_event: EventHandle<PayoutMadeEvent>,
    }

    //#[event]
    struct OrganizationAddedEvent has drop, store {
        org_address: address,
        org_name: String,
        timestamp: u64,
    }

    //#[event]
    struct TreasuryFundedEvent has drop, store {
        org_address: address,
        amount: u64,
        timestamp: u64
    }

    //#[event]
    struct EmployeeAddedEvent has drop, store {
        employee_account: address,
        employee_commitment: String,
        company_account: address,
        daily_salary: u64,
        last_payed: u64,
        timestamp: u64
    }

    //#[event]
    struct EmployeeVerifiedEvent has drop, store {
        employee_account: address,
        timestamp:u64
    }


   // #[event]
    struct PayoutMadeEvent has drop, store {
        employee_account: address,
        amount: u64,
        timestamp: u64
    }

    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        assert!(!exists<PayrollStorage>(account_addr), E_ALREADY_INITIALIZED);
        
        move_to(account, PayrollStorage {
            organizations: table::new(),
            employees: table::new(),
            org_added_event: account::new_event_handle<OrganizationAddedEvent>(account),
            treasury_funded_event: account::new_event_handle<TreasuryFundedEvent>(account),
            empl_added_event: account::new_event_handle<EmployeeAddedEvent>(account),
            empl_verified_event: account::new_event_handle<EmployeeVerifiedEvent>(account),
            payout_made_event: account::new_event_handle<PayoutMadeEvent>(account),
        });
    }

    public entry fun add_organization(org_address: &signer,owner: address, org_name: String) acquires PayrollStorage {
        let account_addr = signer::address_of(org_address);
        let storage = borrow_global_mut<PayrollStorage>(owner);
        
        let organization = Organization {
            org_address: account_addr,
            org_name: org_name,
            org_treasury: coin::zero<AptosCoin>(),
            employees: vector::empty<address>(),
        };
        table::add(&mut storage.organizations, account_addr, organization);

        let event = OrganizationAddedEvent{
            org_address: account_addr,
            org_name: org_name,
            timestamp: timestamp::now_seconds()
        };
        event::emit_event<OrganizationAddedEvent>(
                &mut storage.org_added_event,
                event,
        );
    }

    public entry fun fund_organization_treasury(account: &signer, owner: address, amount: u64) acquires PayrollStorage {
        let account_addr = signer::address_of(account);
        let storage = borrow_global_mut<PayrollStorage>(owner);
        assert!(table::contains(&storage.organizations, account_addr), E_NOT_ORGANIZATION);
        
        let org = table::borrow_mut(&mut storage.organizations, account_addr);
        let coins = coin::withdraw<AptosCoin>(account, amount);
        coin::merge(&mut org.org_treasury, coins);

        let event = TreasuryFundedEvent{
            org_address: account_addr,
            amount: amount,
            timestamp: timestamp::now_seconds()
        };
        event::emit_event<TreasuryFundedEvent>(
                &mut storage.treasury_funded_event,
                event,
        );
    }

     public entry fun add_employee(
        company_account: &signer,
        employee_account: address,
        employee_commitment: String,
        owner: address,
        daily_salary: u64,
    ) acquires PayrollStorage {
        let company_addr = signer::address_of(company_account);
        let storage = borrow_global_mut<PayrollStorage>(owner);
        assert!(table::contains(&storage.organizations,company_addr), E_NOT_ORGANIZATION);
        
        let employee = Employee {
            employee_account: employee_account,
            employee_commitment: employee_commitment,
            company_account: company_addr,
            daily_salary: daily_salary,
            last_payed: timestamp::now_seconds(),
            verified: false
        };
        table::add(&mut storage.employees, employee_account, employee);
        let org = table::borrow_mut(&mut storage.organizations, company_addr);
        vector::push_back(&mut org.employees, employee_account);

        let event = EmployeeAddedEvent{
            employee_account: employee_account,
            company_account: company_addr,
            employee_commitment: employee_commitment,
            daily_salary: daily_salary,
            last_payed: timestamp::now_seconds(),
            timestamp: timestamp::now_seconds()
        };
        event::emit_event<EmployeeAddedEvent>(
                &mut storage.empl_added_event,
                event,
        );
    }

    public entry fun payout(employee_address: address, owner: address) acquires PayrollStorage{
        let storage = borrow_global_mut<PayrollStorage>(owner);
        assert!(table::contains(&storage.employees,employee_address), E_EMPLOYEE_NOT_FOUND);
        let employee = table::borrow_mut(&mut storage.employees, employee_address);
        assert!(table::contains(&storage.organizations,employee.company_account), E_ORGANIZATION_NOT_FOUND);
        let organization = table::borrow_mut(&mut storage.organizations, employee.company_account);
        let days_worked = (timestamp::now_seconds()-employee.last_payed)/(24*60*60);
        let payout_amount=days_worked*employee.daily_salary;
        
        assert!(coin::value(&organization.org_treasury) >= payout_amount, E_NOT_ENOUGH_BALANCE); // Error code 1: Insufficient funds in company treasury
        
        let payment = coin::extract(&mut organization.org_treasury, payout_amount);
        coin::deposit(employee.employee_account, payment);

        employee.last_payed = timestamp::now_seconds();
        

        let event = PayoutMadeEvent {
            employee_account:employee_address,
            amount:payout_amount,
            timestamp: timestamp::now_seconds()
        };

        event::emit_event<PayoutMadeEvent>(
                &mut storage.payout_made_event,
                event,
        );
    }

    public entry fun verify_employee(
        owner: address,
        employee_address: address,
        vk_alpha_g1_in: vector<u8>,
        vk_beta_g2_in: vector<u8>,
        vk_gamma_g2_in: vector<u8>,
        vk_delta_g2_in: vector<u8>,
        vk_uvw_gamma_g1_in: vector<vector<u8>>,
        public_inputs_in: vector<vector<u8>>,
        proof_a_in: vector<u8>,
        proof_b_in: vector<u8>,
        proof_c_in: vector<u8>,
    )acquires PayrollStorage {
        let vk_alpha_g1 = std::option::extract(&mut deserialize<G1, FormatG1Compr>(&vk_alpha_g1_in));
        let vk_beta_g2 = std::option::extract(&mut deserialize<G2, FormatG2Compr>(&vk_beta_g2_in));
        let vk_gamma_g2 = std::option::extract(&mut deserialize<G2, FormatG2Compr>(&vk_gamma_g2_in));
        let vk_delta_g2 = std::option::extract(&mut deserialize<G2, FormatG2Compr>(&vk_delta_g2_in));
        let vk_gamma_abc_g1: vector<Element<G1>> = vector[
            std::option::extract(&mut deserialize<G1, FormatG1Compr>(vector::borrow(&vk_uvw_gamma_g1_in, 0))),
            std::option::extract(&mut deserialize<G1, FormatG1Compr>(vector::borrow(&vk_uvw_gamma_g1_in, 1))),
        ];
        let public_inputs: vector<Element<Fr>> =vector[
            std::option::extract(&mut deserialize<Fr, FormatFrLsb>(vector::borrow(&public_inputs_in, 0))),
        ];
        let proof_a = std::option::extract(&mut deserialize<G1, FormatG1Compr>(&proof_a_in));
        let proof_b = std::option::extract(&mut deserialize<G2, FormatG2Compr>(&proof_b_in));
        let proof_c = std::option::extract(&mut deserialize<G1, FormatG1Compr>(&proof_c_in));

        
        assert!(Verifier::verify_proof<G1, G2, Gt, Fr>(
            &vk_alpha_g1,
            &vk_beta_g2,
            &vk_gamma_g2,
            &vk_delta_g2,
            &vk_gamma_abc_g1,
            &public_inputs,
            &proof_a,
            &proof_b,
            &proof_c,
        ),1);

        let storage = borrow_global_mut<PayrollStorage>(owner);
        assert!(table::contains(&storage.employees,employee_address), E_EMPLOYEE_NOT_FOUND);
        let employee = table::borrow_mut(&mut storage.employees, employee_address);
        assert!(table::contains(&storage.organizations,employee.company_account), E_ORGANIZATION_NOT_FOUND);
        employee.verified = true;
    }

    #[view]
    public fun get_organization(org_address: address, owner:address):(address, String, u64) acquires PayrollStorage {
        let storage = borrow_global<PayrollStorage>(owner);
        assert!(table::contains(&storage.organizations, org_address), E_ORGANIZATION_NOT_FOUND);
        let org = table::borrow(&storage.organizations, org_address);
        
        (org.org_address,org.org_name,coin::value(&org.org_treasury))
    }

    #[view]
    public fun get_employee(employee_address: address, owner: address): (address,String,address,u64,u64) acquires PayrollStorage {
        let storage = borrow_global<PayrollStorage>(owner);
        assert!(table::contains(&storage.employees, employee_address), E_EMPLOYEE_NOT_FOUND);
        let employee = table::borrow(&storage.employees, employee_address);
        
        (employee.employee_account,employee.employee_commitment,employee.company_account,employee.daily_salary,employee.last_payed)
    }

    #[view]
    public fun get_empl_is_verified(employee_address: address,owner: address):(bool) acquires PayrollStorage {
        let storage = borrow_global<PayrollStorage>(owner);
        assert!(table::contains(&storage.employees, employee_address), E_EMPLOYEE_NOT_FOUND);
        let employee = table::borrow(&storage.employees, employee_address);
        (employee.verified)
    }
    
    #[view]
    public fun get_org_employees(org_address: address, owner:address):vector<address> acquires PayrollStorage {
        let storage = borrow_global<PayrollStorage>(owner);
        assert!(table::contains(&storage.organizations, org_address), E_ORGANIZATION_NOT_FOUND);
        let org = table::borrow(&storage.organizations, org_address);

        org.employees
    }

    // #[test]
    // fun test_verify(){
    //     let vk_alpha_g1 = vector[130, 154, 35, 95, 185, 36, 223, 213, 21, 31, 18, 89, 168, 94, 110, 123, 3, 210, 194, 18, 235, 234, 93, 14, 32, 37, 239, 19, 199, 158, 173, 202, 188, 180, 5, 232, 60, 164, 158, 228, 170, 182, 55, 172, 119, 87, 112, 84];
    //     let vk_beta_g2 = vector[183, 25, 37, 187, 165, 42, 59, 81, 175, 176, 89, 52, 91, 212, 17, 184, 49, 243, 164, 11, 107, 61, 52, 192, 194, 195, 92, 42, 186, 210, 42, 46, 189, 255, 158, 121, 152, 165, 19, 69, 11, 151, 190, 244, 250, 48, 187, 79, 15, 90, 200, 209, 68, 110, 11, 235, 195, 62, 203, 48, 182, 175, 219, 249, 99, 38, 124, 151, 155, 72, 43, 94, 69, 210, 31, 52, 105, 191, 199, 254, 12, 102, 253, 74, 137, 205, 134, 17, 26, 181, 180, 37, 82, 23, 43, 152];
    //     let vk_gamma_g2 = vector[132, 118, 184, 50, 200, 165, 158, 187, 119, 47, 233, 138, 57, 236, 6, 164, 173, 50, 106, 213, 130, 125, 248, 171, 75, 197, 110, 184, 129, 72, 246, 95, 71, 124, 89, 135, 73, 124, 42, 150, 187, 253, 55, 253, 114, 164, 234, 227, 12, 131, 201, 151, 250, 138, 76, 56, 118, 57, 102, 211, 217, 4, 237, 130, 130, 86, 70, 48, 212, 205, 136, 104, 116, 157, 126, 50, 102, 101, 49, 119, 246, 129, 113, 251, 36, 245, 111, 129, 117, 31, 208, 218, 187, 60, 153, 72];
    //     let vk_delta_g2 = vector[183, 155, 101, 70, 34, 152, 240, 70, 142, 130, 31, 183, 47, 223, 99, 47, 32, 92, 227, 1, 174, 224, 130, 216, 85, 80, 132, 191, 194, 128, 172, 231, 100, 89, 190, 191, 210, 207, 124, 220, 181, 79, 32, 39, 52, 45, 114, 27, 7, 133, 126, 217, 191, 81, 146, 145, 69, 250, 70, 180, 42, 202, 38, 171, 23, 27, 229, 25, 17, 91, 219, 97, 255, 55, 223, 206, 224, 244, 54, 136, 247, 122, 61, 166, 220, 68, 23, 203, 40, 34, 186, 248, 129, 98, 96, 23];
    //     let vk_gamma_abc_g1 = vector[
    //         vector[137, 2, 175, 187, 58, 207, 220, 0, 223, 72, 152, 222, 17, 101, 212, 225, 180, 18, 64, 254, 86, 162, 187, 184, 119, 165, 61, 118, 203, 5, 81, 57, 228, 130, 44, 174, 213, 211, 70, 101, 14, 164, 27, 46, 252, 197, 5, 242],
    //         vector[141, 119, 6, 145, 74, 114, 212, 205, 125, 117, 123, 114, 245, 164, 94, 120, 56, 173, 167, 232, 50, 155, 31, 113, 183, 192, 91, 210, 116, 247, 129, 113, 14, 148, 233, 100, 188, 152, 157, 83, 50, 41, 229, 225, 17, 238, 214, 85]
    //     ];
    //     let public_inputs = vector[
    //         vector[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    //     ];
    //     let proof_a = vector[181, 211, 183, 198, 246, 147, 16, 38, 227, 135, 33, 208, 82, 4, 236, 23, 209, 229, 134, 242, 246, 14, 224, 194, 64, 207, 169, 116, 249, 106, 69, 226, 242, 120, 192, 48, 185, 159, 68, 230, 9, 243, 221, 31, 249, 46, 106, 94];
    //     let proof_b = vector[182, 199, 191, 234, 82, 90, 251, 196, 172, 77, 154, 64, 202, 165, 58, 253, 9, 101, 227, 203, 106, 159, 58, 238, 10, 100, 177, 67, 23, 124, 10, 250, 174, 214, 16, 4, 45, 9, 75, 54, 216, 189, 166, 195, 39, 172, 136, 27, 21, 153, 243, 33, 238, 113, 255, 204, 176, 2, 12, 114, 201, 235, 76, 55, 170, 112, 181, 152, 92, 70, 51, 163, 83, 238, 42, 254, 192, 211, 174, 148, 100, 125, 236, 110, 32, 153, 154, 75, 247, 206, 60, 24, 94, 8, 14, 149];
    //     let proof_c = vector[174, 39, 28, 60, 46, 34, 139, 100, 208, 68, 23, 137, 133, 59, 187, 127, 5, 207, 93, 223, 37, 16, 5, 246, 221, 170, 74, 55, 86, 59, 226, 185, 5, 166, 228, 196, 153, 246, 38, 209, 234, 251, 29, 2, 118, 63, 24, 152];

    //     // let vk_alpha_g1 = x"aae4a7aa45e6d9078ce14dc689c0d904b34739b78383a6e455920ae2695d92db91684786959f583392f01a69db226e66";
    //     // let vk_beta_g2 = x"ad12bb9e7572a9d81ca4d0fae674d9c669c9450b49535986e7066f45ddb141bb06fe3cd0ce4ea09f3da7aadcb7e91d0f0dabb053228381c0404fc1ee2a7c1e096ba2cc5a4da2f25b094268bb1c424b71bceb37ee3b971f61d3e31ca9080f90e1";
    //     // let vk_gamma_g2 = x"868dd00a2f0f32fcc6523dcb1bc75175c76095ce8136f57df526f0f967975a442c67ea95e1ab45e4cc5594fc58cee32b18fc75423f6c5d9f04026fa500b66aa14fb37883a2f23938833f3dc3dbd789354d3c03632b18792ea1898466f793626b";
    //     // let vk_delta_g2 = x"b824399886d7b1390e2f1fdc5c92ff52a6ad58ea4bbb52646347eb6c51a6ee7b82d2371328b1274472c4fae5fa229afc0fb16a04984d05f593dbb611e5973a2559369165146442e4375a599a34c1c9e32e7dbc24b72fd3543c87ab1562eaa3c5";
    //     // let vk_gamma_abc_g1 = vector[
    //     //     x"b7d3940fb912b2905de634043cca5ebbc87375f78dc8904e650275d4eec7559b743c6f5c3ae72ed5c64d9852315edd5e",
    //     //     x"ad8a0fba8ca8abefef01a984107aef02b4a56b531fac1b461759b0a7fefcf66f454698896254cecbc1c5c1a8b03d97b0"
    //     // ];
    //     // let public_inputs = vector[
    //     //     x"0000000000000000000000000000000000000000000000000000000000000000"
    //     // ];
    //     // let proof_a = x"a32b64037ca1aa912d2733167edc13318965f0f28676bea91a374ef9a38ab438b06cf4e6857bc4526539b298e3abdcc4";
    //     // let proof_b = x"b2ad3c09f0bc1874165f52117ce5476ed5945adfe5ac327c0be980d5fb63f79f8a34e5e477ba699692880ed5564f8b680e11c2767a84fafea9c5af911eba04a62c5f27f4b3ca71ac64890f8d3b5fb6d9de00d51e0d6c8bea2b9f3da1000e3ad5";
    //     // let proof_c = x"972d84f5fa9f458b5b6c4fd417a8aa894febb920de939226019d705d448b0d47adb44b4c203c6bc5bf309a25e178a16e";

    //     verify_employee(
    //         vk_alpha_g1,
    //         vk_beta_g2,
    //         vk_gamma_g2,
    //         vk_delta_g2,
    //         vk_gamma_abc_g1,
    //         public_inputs,
    //         proof_a,
    //         proof_b,
    //         proof_c,
    //     );

    //}
}