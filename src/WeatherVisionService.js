const WeatherVisionService = {
    getAllData(db) {
        return db('users')
            .select('*')
    },

    addUser(db, data) {
        return db('users')
        .insert(data)
        .returning('*')
        .then(rows => rows[0]);
    },

    userById(db, id) {
        return db('users')
            .select('*')
            .where({ id })
            .first();
    },

    deleteUser(db, id) {
        return db('users')
            .where({ id })
            .delete();
    },

    updateUser(db, id, data) {
        return db('users')
            .where({ id })
            .update(data);
    }

}

module.exports = WeatherVisionService;
