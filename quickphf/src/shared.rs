use core::hash::{Hash, Hasher};
// use fnv_rs::{Fnv64, FnvHasher};
// use fnv::FnvHasher;
use fnv_rs::{Fnv64, FnvHasher, FnvHashResult};


#[inline]
pub fn hash_key<K: Hash + ?Sized + core::convert::AsRef<[u8]>>(key: &K, seed: u64) -> u64 {
    let hash = Fnv64::hash(key);
    let ret = u64::from_be_bytes(hash.as_bytes().try_into().expect("slice with incorrect length"));
    return ret
    // let mut hasher = wyhash::WyHash::with_seed(seed);
    // hasher.write(key.as_ref());
    // return hasher.finish();

}

#[inline]
pub fn hash_pilot_value(pilot_value: u16) -> u64 {
    /// Multiplicative constant from `fxhash`.
    const K: u64 = 0x517cc1b727220a95;
    (pilot_value as u64).wrapping_mul(K)
}

#[inline]
pub fn get_bucket(key_hash: u64, buckets: quickdiv::DivisorU64) -> usize {
    (key_hash % buckets) as usize
}

#[inline]
pub fn get_index(key_hash: u64, pilot_hash: u64, codomain_len: quickdiv::DivisorU64) -> usize {
    ((key_hash ^ pilot_hash) % codomain_len) as usize
}
