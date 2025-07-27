module simple_salary_addr::Verifier{
    use aptos_std::crypto_algebra::{Element, from_u64, multi_scalar_mul, eq, multi_pairing, upcast, pairing, add, zero};
    use std::vector;
    use std::debug;

    friend simple_salary_addr::simplepayroll;
    
    public fun verify_proof<G1,G2,Gt,S>(
        vk_alpha_g1: &Element<G1>,
        vk_beta_g2: &Element<G2>,
        vk_gamma_g2: &Element<G2>,
        vk_delta_g2: &Element<G2>,
        vk_uvw_gamma_g1: &vector<Element<G1>>,
        public_inputs: &vector<Element<S>>,
        proof_a: &Element<G1>,
        proof_b: &Element<G2>,
        proof_c: &Element<G1>,
    ): bool {
        let left = pairing<G1,G2,Gt>(proof_a, proof_b);
        let scalars = vector[from_u64<S>(1)];
        std::vector::append(&mut scalars, *public_inputs);
        let right = zero<Gt>();
        let right = add(&right, &pairing<G1,G2,Gt>(vk_alpha_g1, vk_beta_g2));
        let right = add(&right, &pairing(&multi_scalar_mul(vk_uvw_gamma_g1, &scalars), vk_gamma_g2));
        let right = add(&right, &pairing(proof_c, vk_delta_g2));
        debug::print(&left);
        debug::print(&right);
        eq(&left, &right)
    }

    #[test_only]
    use aptos_std::crypto_algebra::{deserialize, enable_cryptography_algebra_natives};
    #[test_only]
    use aptos_std::bls12381_algebra::{Fr, FormatFrLsb, FormatG1Compr, FormatG2Compr, FormatFq12LscLsb, G1, G2, Gt, Fq12, FormatGt};

    #[test(fx = @std)]
    fun test_verify_proof_with_bls12381(fx: signer) {
        enable_cryptography_algebra_natives(&fx);

        // let vk_alpha_g1 = std::option::extract(&mut deserialize<G1, FormatG1Compr>(&x"a5d76ecc062943877a2cc33ed5d0324868f2dbae1a970f158af7e32a25b56b2b2e8f7b77d46e3d559c069ddf0b884354"));
        // let vk_beta_g2 = std::option::extract(&mut deserialize<G2, FormatG2Compr>(&x"b62ebb2341df2685bc7b4a97af8bc5bade2b5618f6345931a7f3e67ac86cc633d50b949cfe7b7594551e61bea02624ed18e43b2c792a12b95aa9ae1bc636bf0a17a0cab64734e75d732679e5381598b9f46e29829a9f4cc6fb417ed347398841"));
        // let vk_gamma_g2 = std::option::extract(&mut deserialize<G2, FormatG2Compr>(&x"b282bb40f15bc75910b35a1f2169085d627bce0ba26f51271192328455be8bb9ed276cdf4a6de8fc9620b75465823db3109ecfe77f21b8e16baea5c6df53a9f80296cb58484a0e09436abd4eddc2de6a895fe6a87245ef130756e8ddf0280fc8"));
        // let vk_delta_g2 = std::option::extract(&mut deserialize<G2, FormatG2Compr>(&x"8559ab5d7a10852fc92ad7373826d2dce7a18cb8c02bb2a90e2136e7aa7ceed3d94af5889a31785649a31993587613630db2afaf78e04ab535ea8f2fad3deb84549a5a79379ae377862ff034791ecf194c2ef7e38fbd85b36a9a2bc978c43ab4"));
        // let vk_gamma_abc_g1: vector<Element<G1>> = vector[
        //     std::option::extract(&mut deserialize<G1, FormatG1Compr>(&x"92e531125e2e6c5beb253331fd5867f94f651081bda8d64d2754a986360a4e659d32e09530848f264a821ce7297d60fe")),
        //     std::option::extract(&mut deserialize<G1, FormatG1Compr>(&x"9051104b289ddcc5fbbdaece00a1f288b9c9d25df319f6a7e478546225126c0dac5b04bf5ee1c09ea587158929dc197b")),
        //     std::option::extract(&mut deserialize<G1, FormatG1Compr>(&x"838a227377030a6f150e95aefdc8b9d0508d3ee4cd0c77c328acd08ab8ee012b20f5e774b1a9ba96d901c0583f0cd840"))
        // ];
        // let public_inputs: vector<Element<Fr>> =vector[
        //     std::option::extract(&mut deserialize<Fr, FormatFrLsb>(&x"7b00000000000000000000000000000000000000000000000000000000000000")),
        //     std::option::extract(&mut deserialize<Fr, FormatFrLsb>(&x"c801000000000000000000000000000000000000000000000000000000000000"))
        // ];

        // let proof_a = std::option::extract(&mut deserialize<G1, FormatG1Compr>(&x"8da3fa7c37d931bcd0a0e353d58a262ab1931d569b86c0644d41eeb3cafc2c3c67c179bb8ca94daef0bf4c9f3e6472d9"));
        // let proof_b = std::option::extract(&mut deserialize<G2, FormatG2Compr>(&x"b8be2aa9237cf59968452933d97186a69ca4c0367964ce9d8dff66807c2c08207ba61ba4c7ae06696c24e5e1500582d719280b7d284e28a4417d597524e7f1d41b024ea45b1fd06bc2724022fe214326ddd58d25b4acca268b1391d8329a9e72"));
        // let proof_c = std::option::extract(&mut deserialize<G1, FormatG1Compr>(&x"92569539643c189ebc243bfa5e231f117c6f13fcc6720bbd6e1071ccb464d614ef60455f0af3fa4d56e8a1c8d5ae0806"));

        let vk_alpha_g1 = std::option::extract(&mut deserialize<G1, FormatG1Compr>(&x"91c26bea98d4ca3331f1b22aa8c9436046760d127e6aaf277db5b62e4eb2e9d4cf9b28a52c34d579dad6485a003fdf47"));
        let vk_beta_g2 = std::option::extract(&mut deserialize<G2, FormatG2Compr>(&x"b254f8bf4bbb4cc157981a5381c7e30edb62a82efa5b547952c8d8bb54b2490d02822fb05e166feb307a2a87310a894801c9a434bd762a602cb19a2ee75b67104644462530374b821e476d9f94627656633f558d938015f8e9ce7e572eaa5468"));
        let vk_gamma_g2 = std::option::extract(&mut deserialize<G2, FormatG2Compr>(&x"999c6e827a9e7eb768d07220beea9a54d99e417a728a69c2e94c2447708b79fa6d540909e3ae3630d49cf0c1f57760550a01703e54f372d12463a6a57c99dd7e7b74bd4b4dd2a89c8ccc0f2f6d861a131827bf33272d99c99efe66f43bf89d5a"));
        let vk_delta_g2 = std::option::extract(&mut deserialize<G2, FormatG2Compr>(&x"a5e66d8934ab8a64056ba105728d5553b2b93c1eea895725e223dadc89f6edf6048e3be886aea684b9e832ca428762c312727b5a4e18745f9c3c5eb646c5da53f0f5be3288146a24287e98822367075e297e390c2319060f55cff4770ee5b50d"));
        let vk_gamma_abc_g1: vector<Element<G1>> = vector[
            std::option::extract(&mut deserialize<G1, FormatG1Compr>(&x"94a5550ba5d4821cfd26090255eaf117be98fc07b5c71cb6b2ec8aa16621248b92a35496d957ba6e4da38fef29a8af3e")),
            std::option::extract(&mut deserialize<G1, FormatG1Compr>(&x"b58619328082fe2d58b47fa137575a02520944931dbc61eeef95913476e79e96b06f480fc3ca66e3d860931b77f55493")),
            //std::option::extract(&mut deserialize<G1, FormatG1Compr>(&x"838a227377030a6f150e95aefdc8b9d0508d3ee4cd0c77c328acd08ab8ee012b20f5e774b1a9ba96d901c0583f0cd840"))
        ];
        let public_inputs: vector<Element<Fr>> =vector[
            std::option::extract(&mut deserialize<Fr, FormatFrLsb>(&x"0000000000000000000000000000000000000000000000000000000000000000")),
            //std::option::extract(&mut deserialize<Fr, FormatFrLsb>(&x"0000000000000000000000000000000000000000000000000000000000000000"))
        ];

        let proof_a = std::option::extract(&mut deserialize<G1, FormatG1Compr>(&x"b57a6f80340de76dd118fbb3e2d62fc5ca7de616a4b5d8ac523d3cd8b43be731ac2682c75fd9345bc4b744bfcde399c9"));
        let proof_b = std::option::extract(&mut deserialize<G2, FormatG2Compr>(&x"a8a69bf4aae1aed73deccfb0540d2a9304b6758e7447d009ee7b2dc65b0de3fb199945fb86190e0f7a9e04865f96780205d16ae1ac6ffc7447893a85149abcbd581bae3e83c8a01f1ac8c4b5bd253f57895a72d1fcd5ae0beacc0e29170b8f60"));
        let proof_c = std::option::extract(&mut deserialize<G1, FormatG1Compr>(&x"8603df41241294836b9b2c1a3d54873180d5380017b2f20e9d9f03c7c49d7890d047e9d26eb32de2b2db95553b92a8ab"));


        assert!(verify_proof<G1, G2, Gt, Fr>(
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
    }
}

