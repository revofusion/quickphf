const bigInt = require("big-integer");
const { fnv1a } = require('./fnv');
const inscriptions = require('./inscriptions');
const { free, values_len, pilots_table } = require('./constants');

class RawPhfMap {
    constructor(pilots_table, free, values_len) {
        this.free = free;
        this.values_len = values_len;
        this.buckets = bigInt(pilots_table.length);
        this.pilots_table = pilots_table;
    }

    wrapping_mul(x, y) {
        const maxPlusOne = bigInt(2).pow(64);
        return x.times(y).mod(maxPlusOne);
    }

    get_index(key) {
        let key_hash = bigInt(fnv1a(key, {size: 64}));
        let bucket = bigInt(key_hash).mod(this.buckets);
        let pilot_hash = this.wrapping_mul(bigInt(this.pilots_table[bucket]), bigInt('517cc1b727220a95', 16));
        let idx = bigInt(key_hash).xor(pilot_hash).mod(this.free.length + this.values_len);

        return +idx < this.values_len ? +idx : this.free[+idx - this.values_len]
    }
}

const map = new RawPhfMap(pilots_table, free, values_len)

let knownIndexes = new Set()
let collisions = 0
for (const inscription of inscriptions) {
    const idx = map.get_index(inscription)

    if (idx >= inscriptions.length) {
        throw new Error('idx out of bounds')
    }

    console.log(idx)
    if (knownIndexes.has(idx)) {
        collisions++
    }
    knownIndexes.add(idx)
}

for (let i = 0; i < inscriptions.length; i++) {
    if (!knownIndexes.has(i)) {
        collisions++
        console.log('missing', i)
    }
}

console.log(collisions, 'collisions')