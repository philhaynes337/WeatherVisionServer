const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const signup = (req, res) => {
    
}