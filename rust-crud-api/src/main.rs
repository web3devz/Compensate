use std::env;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
//use ark_circom::ethereum::VerifyingKey;
//use fastcrypto_zkp::bn254::VerifyingKey;
use futures::stream::TryStreamExt;
use mongodb::bson::{doc, Document};
use mongodb::error::Error;
use mongodb::options::ResolverConfig;
use mongodb::{options::ClientOptions, Client};

//ZKP Proof Generator

use ark_bls12_381::{Bls12_381, Fr};
use ark_groth16::Groth16;
use ark_serialize::CanonicalSerialize;
use ark_std::rand::thread_rng;

use fastcrypto::groups::bls12381::G1Element;
use fastcrypto::groups::bls12381::Scalar;
use fastcrypto::serde_helpers::ToFromByteArray;

use ark_ff::{BigInteger, PrimeField};

use fastcrypto_zkp::bls12381:: VerifyingKey;
use fastcrypto_zkp::groth16::Proof;


use ark_circom::{CircomBuilder, CircomConfig};
use ark_snark::SNARK;

use num_bigint::BigInt;
// use num_bigint::BigInt;
use sha2::{Digest, Sha256};
use hex;

#[macro_use]
extern crate serde_derive;
extern crate mongodb;

#[derive(Serialize, Deserialize)]
struct User {
    name: String,
    job_title: String,
    address: String,
}

//DATABASE_URL
//const DB_URL: String = env::var("DATABASE_URL").expect("Your must set DATABASE_URL environment variable");

//constants
const OK_RESPONSE: &str = "HTTP/1.1 200 OK\r\nAccess-Control-Allow-Origin: *\r\nContent-Type: application/json\r\n\r\n";
const OPTIONS_RESPONSE: &str = "HTTP/1.1 204 No Content\r\n\
    Access-Control-Allow-Origin: *\r\n\
    Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE\r\n\
    Access-Control-Allow-Headers: Content-Type\r\n\
    Access-Control-Max-Age: 86400\r\n\r\n";
const NOT_FOUND: &str = "HTTP/1.1 404 Not Found\r\n\r\n";
const INTERNAL_SERVER_ERROR: &str = "HTTP/1.1 500 INTERNAL SERVER ERROR\r\n\r\n";

#[tokio::main]
async fn main() {
    let client_uri =
        env::var("DATABASE_URL").expect("Your must set the DATABASE_URL environment variable");
    let options =
        ClientOptions::parse_with_resolver_config(&client_uri, ResolverConfig::cloudflare())
            .await
            .unwrap();
    let client = Client::with_options(options).unwrap();

    if let Err(e) = set_database(&client).await {
        println!("Error: {}", e);
        return;
    }

    let listener = TcpListener::bind(format!("0.0.0.0:8081")).unwrap();
    println!("Server started at port 8080");

    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                handle_client(&client, stream).await;
            }
            Err(e) => {
                println!("Error: {}", e);
            }
        }
    }
}

async fn handle_client(client: &Client, mut stream: TcpStream) {
    let mut buffer = [0; 1024];
    let mut request = String::new();

    match stream.read(&mut buffer) {
        Ok(size) => {
            request.push_str(String::from_utf8_lossy(&buffer[..size]).as_ref());

            if request.starts_with("OPTIONS") {
                // Handle preflight request for CORS
                stream.write_all(OPTIONS_RESPONSE.as_bytes()).unwrap();
                stream.flush().unwrap();
                return;
            }

            let (status_line, content) = match &*request {
                r if r.starts_with("POST /users") => handle_post_request(&client, r).await,
                r if r.starts_with("GET /user/") => handle_get_request(&client, r).await,
                r if r.starts_with("GET /users") => handle_get_all_request(&client).await,
                r if r.starts_with("POST /verify") => handle_verify_request(&client, r).await,
                //r if r.starts_with("PUT /users/")=> handle_put_request(r),
                r if r.starts_with("DELETE /users/") => handle_delete_request(&client, r).await,
                _ => (NOT_FOUND.to_string(), "404 Not Found".to_string()),
            };

            stream
                .write_all(format!("{}{}", status_line, content).as_bytes())
                .unwrap();
        }
        Err(e) => {
            println!("Error: {}", e);
        }
    }
}

async fn handle_post_request(client: &Client, request: &str) -> (String, String) {
    match get_user_request_body(&request) {
        Ok(user) => {
            let db = client.database("EmployeeDB");
            let collection = db.collection("EmpCollection1");

            let doc = mongodb::bson::doc! {
                "name": &user.name,
                "job_title": &user.job_title,
                "address": &user.address
            };

            match collection.insert_one(doc, None).await {
                Ok(_) => (OK_RESPONSE.to_string(), "User created".to_string()),
                Err(e) => (INTERNAL_SERVER_ERROR.to_string(), format!("Error: {}", e)),
            }
        }
        _ => (INTERNAL_SERVER_ERROR.to_string(), "Error".to_string()),
    }
}

async fn handle_get_request(client: &Client, request: &str) -> (String, String) {
    match get_id(&request).parse::<String>() {
        Ok(id) => {
            let db = client.database("EmployeeDB");
            let collection = db.collection::<Document>("EmpCollection1");

            let filter = doc! {"address": id};

            match collection.find_one(Some(filter), None).await {
                Ok(Some(result)) => (
                    OK_RESPONSE.to_string(),
                    serde_json::to_string(&result).unwrap(),
                ),
                Ok(None) => (NOT_FOUND.to_string(), "No result".to_string()),
                Err(e) => (NOT_FOUND.to_string(), format!("Error {}", e)),
            }
        }
        _ => (INTERNAL_SERVER_ERROR.to_string(), "Error".to_string()),
    }
}

async fn handle_get_all_request(client: &Client) -> (String, String) {
    let db = client.database("EmployeeDB");
    let collection = db.collection::<User>("EmpCollection1");
    match collection.find(None, None).await {
        Ok(result) => {
            let users: Vec<User> = result.try_collect().await.unwrap();
            (
                OK_RESPONSE.to_string(),
                serde_json::to_string(&users).unwrap(),
            )
        }
        _ => (INTERNAL_SERVER_ERROR.to_string(), "Error".to_string()),
    }
}

// fn handle_put_request(request: &str) -> (String, String) {
//     match
//         (
//             get_id(&request).parse::<i32>(),
//             get_user_request_body(&request),
//             Client::connect(DB_URL, NoTls),
//         )
//     {
//         (Ok(id), Ok(user), Ok(mut client)) => {
//             client
//                 .execute(
//                     "UPDATE users SET name = $1, job_title = $2, address = $3 WHERE id = $4",
//                     &[&user.name, &user.job_title, &user.address, &id]
//                 )
//                 .unwrap();

//             (OK_RESPONSE.to_string(), "User updated".to_string())
//         }
//         _ => (INTERNAL_SERVER_ERROR.to_string(), "Error".to_string()),
//     }
// }
async fn handle_delete_request(client: &Client, request: &str) -> (String, String) {
    match get_id(&request).parse::<String>() {
        Ok(id) => {
            let db = client.database("EmployeeDB");
            let collection = db.collection::<Document>("EmpCollection1");

            let filter = doc! {"address": id};
            match collection.delete_one(filter, None).await {
                Ok(_) => (OK_RESPONSE.to_string(), "User deleted".to_string()),
                Err(e) => (NOT_FOUND.to_string(), format!("Error {}", e)),
            }
        }
        _ => (INTERNAL_SERVER_ERROR.to_string(), "Error".to_string()),
    }
}

async fn handle_verify_request(client: &Client, request: &str) -> (String, String) {
    // Parse the JSON body of the request to extract the name, job title, and address
    match get_user_request_body(&request) {
        Ok(user) => {
            let db = client.database("EmployeeDB");
            let collection = db.collection::<User>("EmpCollection1");

            let filter = doc! {"address": user.address.clone()};

            match collection.find_one(Some(filter), None).await {
                Ok(Some(result)) => {
                    let input_commitment = format!("{}{}{}", user.name, user.job_title, user.address);
                    let input_commitment_server = format!("{}{}{}", result.name, result.job_title, result.address);
                    let commitment = generate_sha256_hash(&input_commitment);
                    let commitment_server = generate_sha256_hash(&input_commitment_server);
                    let vk_serialized = groth16_verify(&commitment,&commitment_server);
                    let vk_input_serialized =format!("{:?}",vk_serialized);
                    (OK_RESPONSE.to_string(), vk_input_serialized)
                }
                Ok(None) => (NOT_FOUND.to_string(), "No result".to_string()),
                Err(e) => (NOT_FOUND.to_string(), format!("Error {}", e)),
            }
        }
        Err(_) => (INTERNAL_SERVER_ERROR.to_string(), "Error parsing request".to_string()),
    }
}


async fn set_database(client: &Client) -> Result<(), Error> {
    let db = client.database("EmployeeDB");
    db.create_collection("EmpCollection1", None).await.unwrap();
    Ok(())
}

fn get_id(request: &str) -> &str {
    request
        .split("/")
        .nth(2)
        .unwrap_or_default()
        .split_whitespace()
        .next()
        .unwrap_or_default()
}

fn get_user_request_body(request: &str) -> Result<User, serde_json::Error> {
    serde_json::from_str(request.split("\r\n\r\n").nth(1).unwrap_or_default())
}

// fn vec_string(input: &Vec<[u8; 32]>) -> String {
//     let hex_string: String = input
//         .iter() 
//         .flat_map(|array| array.iter()) 
//         .map(|&byte| format!("{:02x}", byte)) 
//         .collect::<Vec<String>>() 
//         .join(""); 

//     hex_string
// }

fn generate_sha256_hash(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();
    // let encode = format!("{:?}", result);
    // encode
    hex::encode(result)
   
}

fn groth16_verify(input: &str,server_input: &str) -> String {
    let cfg = CircomConfig::<Fr>::new("src/commitment.wasm", "src/commitment.r1cs").unwrap();
    let mut builder = CircomBuilder::new(cfg);
    
    let big_int_val = BigInt::parse_bytes(input.as_bytes(), 16)
        .expect("Failed to convert hex to BigInt");
    let big_int_val_server = BigInt::parse_bytes(server_input.as_bytes(), 16)
        .expect("Failed to convert hex to BigInt");

    let circom = builder.setup();
    let mut rng = thread_rng();
    
    let params = {
        Groth16::<Bls12_381>::generate_random_parameters_with_reduction(circom, &mut rng).unwrap()
    };
    builder.push_input("employeeHashedCommitment", big_int_val);
    builder.push_input("employeerHashedCommitment", big_int_val_server);

    
    
    let circom = builder.build().unwrap();
    let inputs: Vec<ark_ff::Fp<ark_ff::MontBackend<ark_bls12_381::FrConfig, 4>, 4>> = circom.get_public_inputs().unwrap();
    let proof ={
        Groth16::<Bls12_381>::create_random_proof_with_reduction( circom, &params, &mut rng).unwrap()
    };

    
    let pvk = Groth16::<Bls12_381>::process_vk(&params.vk).unwrap();
    let mut vk_bytes = Vec::new();
    params.vk.serialize_compressed(&mut vk_bytes).unwrap();
    let vk = VerifyingKey::from_arkworks_format(&vk_bytes).unwrap();
    let verified = Groth16::<Bls12_381>::verify_with_processed_vk(&pvk, &inputs, &proof).unwrap();

    assert!(verified);
   
    println!("{:?}", vk);
    let mut proof_bytes = Vec::new();
    proof.a.serialize_compressed(&mut proof_bytes).unwrap();
    proof.b.serialize_compressed(&mut proof_bytes).unwrap();
    proof.c.serialize_compressed(&mut proof_bytes).unwrap();
    let proof: Proof<G1Element> = bcs::from_bytes(&proof_bytes).unwrap();

    println!("{:?}", proof);
    let inputs_bytes =serialize_to_32_bytes(&inputs);
    println!("{:?},{:?}", inputs_bytes,inputs);


    let vk_serialized = format!("{:?},{:?},{:?}", vk, proof, inputs_bytes);

    vk_serialized
}
fn serialize_to_32_bytes(
    big_int_vec: &Vec<ark_ff::Fp<ark_ff::MontBackend<ark_bls12_381::FrConfig, 4>, 4>>,
) -> Vec<[u8; 32]> {
    big_int_vec
        .iter()
        .map(|element| {
            // Serialize each field element to bytes (as a vec first)
            let mut bytes = vec![0u8; 32];
            element.serialize_compressed(&mut bytes).unwrap(); // Serialize into 32 bytes

            // Convert to fixed-size array
            let mut fixed_bytes = [0u8; 32];
            fixed_bytes.copy_from_slice(&bytes[..32]);
            fixed_bytes
        })
        .collect()
}
pub fn from_arkworks_scalar(scalar: &Fr) -> Scalar {
    Scalar::from_byte_array(&scalar.into_bigint().to_bytes_be().try_into().unwrap()).unwrap()
}
