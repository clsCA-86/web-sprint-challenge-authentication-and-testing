const db = require('../../data/dbConfig')

function getUsername(username) {
    return db('users')
        .where('username', username)
        .select('id', 'username', 'password')
}

async function insert(user) {
    await db('users').insert(user)
    return getUsername(user.username).first()
}

module.exports = {
    insert,
    getUsername
}