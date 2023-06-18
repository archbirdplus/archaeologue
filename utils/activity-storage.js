
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
        if(!this.data[day]) { this.data[day] = {} }
        if(this.data[day].includes(snowflake)) { return false }
        this.data[day].push(snowflake)
        return true
    }
    getObject() {
        return this.data
    }
}

class GuildData {
    data;
    cache;
    constructor(obj) {
        this.data = obj
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
        Object.keys(this.cache).forEach(key => {
            object[key] = this.cache[key]?.data ?? this.data[key]
        })
        return object
    }
}

const base = {
    dir: path.join(appRoot, 'data'),
    cache: {},
    data: {},
    getGuild(guild) {
        const key = '#'+guild
        if(!this.cache[key]) {
            this.data[key] = require(path.join(this.dir, guild+'.json'))
            this.cache[key] = new GuildData(this.data[key])
        }
        return this.cache[key]
    },
    write() {
        Object.keys(this.cache).forEach(key => {
            fs.writeFileSync(
                path.join(this.dir, guild+'.json'),
                JSON.stringify(this.cache[key]?.getObject() ?? this.data[key])
            )
        })
    }
}

module.exports = base

