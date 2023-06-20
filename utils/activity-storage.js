
const fs = require('node:fs')
const path = require('node:path')

/* storage object tree =
    base {
        getGuild guild -> GuildData {
            userMessages user -> UserMessages {
                onDay day -> count
                push snowflake => <updates>
            }
            pushMessage user snowflake -> <updates>
        }
        write => <save file>
    }
*/

/* file 1239023.json
{
    "@12388348": {
        "10": [132030239392],
        "12": [202340943904, 1280238230, 2390092309]
    },
    "@43894392": {
        "0": [],
        "1": [202340943904, 1280238230, 2390092309]
    }
}
*/

function getDay(snowflake) {
    const day = Math.floor(Number(BigInt(snowflake) >> BigInt(22))/(1000*60*60*24))
    return day
}

function timestamp(snowflake) {
    return (snowflake >> (22))
}

class UserMessages {
    data;
    constructor(obj) {
        this.data = obj ?? {}
    }
    onDay(day) {
        return this.data['d'+day]?.length ?? 0
    }
    push(snowflake) {
        const day = 'd'+getDay(snowflake)
        if(!this.data[day]) { this.data[day] = [] }
        if(this.data[day].includes(snowflake)) { return true }
        this.data[day].push(snowflake)
        return false
    }
    getObject() {
        return this.data
    }
}

class GuildData {
    data;
    cache;
    file;
    constructor(obj, file) {
        this.data = obj
        this.cache = {}
        this.file = file
    }
    userMessages(user) {
        const key = '@'+user
        if(!this.cache[key]) {
            this.cache[key] = new UserMessages(this.data['@'+user])
        }
        return this.cache[key]
    }
    pushMessage(user, snowflake) {
        return this.userMessages(user).push(snowflake)
    }
    getObject() {
        const object = {}
        console.log('[INFO] getObject')
        const cacheData = {}
        for(const key in this.cache) {
            cacheData[key] = this.cache[key].data
        }
        const merged = Object.assign({}, this.data, cacheData)
        return merged
    }
    async write() {
        const json = JSON.stringify(this.getObject())
        fs.writeFileSync(this.file+'', json, (err)=>console.log(`[ERROR] The writeFileSync error is`, err))
        console.log(`[INFO] GuildData wrote to ${this.file}`)
    }
}

const base = {
    dir: path.join(appRoot, 'data'),
    cache: {},
    data: {},
    getGuild(guild) {
        const key = '#'+guild
        if(!this.cache[key]) {
            const file = path.join(this.dir, guild+'.json')
            if(fs.existsSync(file)) {
                this.data[key] = require(file)
            } else { this.data[key] = {} }
            this.cache[key] = new GuildData(this.data[key], file)
        }
        return this.cache[key]
    },
    write() {
        Object.values(this.cache).forEach(val => val.write())
    }
}

module.exports = base

