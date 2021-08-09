import { Fish, Guppy } from 'fish'
import Swarm from 'swarm'
import fs from 'fs';
import path from 'path';
import crypto from 'crypto'

class Otter {

    private food: Swarm = {}
    private dir: string;
    private path: string;

    /**
     *
     * @param dir
     * @param file
     */
    constructor(dir: string, file: string = 'food.json') {
        this.dir = dir;
        this.path = path.join(__dirname, this.dir, file)
        this._load()
    }

    /**
     *
     */
    private _load() {
        // create dir / file if not exists
        try {
            if (!fs.existsSync(path.join(__dirname, this.dir))) {
                fs.mkdirSync(path.join(__dirname, this.dir))
                console.log(`Created directory ${this.dir}`)
            }

            if (!fs.existsSync(this.path)) {
                fs.writeFileSync(this.path, '')
                console.log(`Created file ${this.path}`)

            }
            this._read((data: Swarm) => {
                this.food = data;
            });
        } catch (err) { console.error(err) };
    }

    /**
     * Generates sha256 hases till its an unique key to the set
     * @param data as a key base
     * @returns string sha256 hash value
     */
    private _generateKey(data: Swarm) : string {

        let hash = ''
        do {
            hash = crypto.createHash('sha256')
                .update(crypto.randomBytes(42)
                .toString('base64')).digest('hex')
                .toUpperCase();
        } while(data.hasOwnProperty(hash));

        return hash;
    }

    /**
     *
     * @param callback
     */
    private _read(callback: Function) {

        fs.readFile(this.path, 'utf-8', (err, data) => {
            if (err) throw err;
            if (!data) throw Error('File empty or not json.')
            callback(JSON.parse(data));
        });
    }

    /**
     *
     * @param data
     * @param callback
     */
    private _write(data: string, callback: Function) {

        fs.writeFile(this.path, data, 'utf-8', err => {
            if (err) throw err;

            callback();
        });
    }

    /**
     *
     * @param key
     * @returns
     */
    fetch(key: string) : undefined | Fish {

        const sha256Exp = /^[a-f0-9]{64}$/gi;

        // check if valid sha256 key
        if (!sha256Exp.test(key)) return undefined;
        if (!this.food.hasOwnProperty(key)) return undefined;

        return this.food[key];
    }

    fetchAll() : Array<Fish> {

        return Object.values(this.food)
    }

    /**
     *
     * @param guppy
     * @returns
     */
    add(guppy: Guppy) {

        this._read((data: Swarm) => {
            const key = this._generateKey(data)
            data[key] = {
                key,
                ...guppy,
            };
            this._write(JSON.stringify(data, null, 2), ()=>{ })
        })
        return true;
    }
}

export default Otter
