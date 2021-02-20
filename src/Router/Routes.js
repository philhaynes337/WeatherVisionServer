const path = require('path');
const express = require('express');
const xss = require('xss');
const WeatherVisionService = require('../WeatherVisionService');
const environment = process.env.NODE_ENV || 'development';
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const WeatherVisionRouter = express.Router();
const jsonParser = express.json();

const createToken = () => {
    return new Promise(( res, rej) => {
        crypto.randomBytes(16, (error, data) => {
            error ? rej(error) : res(data.toString('base64'))
        })
    })
}

const hashPassword = (password) => {
    return new Promise((res, rej) =>
    bcrypt.hash(password, 10, (error, hash) => {
        error ? rej(error) : res(hash)
    })
    )
}

WeatherVisionRouter
    .route('/')
        .get((req, res, next) => {
            res.send('Welcome to the Weather Vision API!')
        });

WeatherVisionRouter
    .route('/api')
        .get((req, res, next) => {
            res.send('API Endpoints for Data')
        });

WeatherVisionRouter
    .route('/api/signup')
    .get((req, res, next) => {
        res.send('Nothing to see here!')
    })
    .post(jsonParser, (req, res, next) => {
        const { username, userpassword, zipcode, firstname, lastname } = req.body
        const newUser = { username, userpassword, zipcode, firstname, lastname }

        if (!username) {
            return res.status(400).json({
                error: { message: `Missing Username`}
            })
        }
        if (!userpassword) {
            return res.status(400).json({
                error: { message: `Missing Password`}
            })
        }  
        if (!zipcode) {
            return res.status(400).json({
                error: { message: `Missing Zipcode`}
            })
        } 
        if (!firstname) {
            return res.status(400).json({
                error: { message: `Missing First Name`}
            })
        }
        if (!lastname) {
            return res.status(400).json({
                error: { message: `Missing Last Name`}
            })
        }
        for (const [key, value] of Object.entries(newUser)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body`}
                })
            }
        }

    WeatherVisionService.addUser(
        req.app.get('db'),
        newUser
    )
        hashPassword(newUser.userpassword)
        .then((hashedPassword) => {
            delete newUser.userpassword
            newUser.userpassword = hashedPassword
        })
        .then(() => createToken())
        .then(token => newUser.token = token)
        .then(() =>createUser(newUser))
        .then(user => {
            delete newUser.userpassword
            res.status(201).json({ newUser })
        })
        // .then(user => {
        //     res
        //         .status(201)
        //         //.location(path.posix.join(req.orginalUrl, `/${user.id}`))
        //         .json(user)
        // })
        .catch(next)

    })


WeatherVisionRouter
        .route('/api/users')
        .get((req, res, next) => {
            WeatherVisionService.getAllData(
                req.app.get('db')
            )
            .then(users => {
                res.json(users)
            })
            .catch(next)
        })
        // .post(jsonParser, (req, res, next) => {
        //     const { username, userpassword, zipcode, firstname, lastname } = req.body
        //     const newUser = { username, userpassword, zipcode, firstname, lastname }

        //     if (!username) {
        //         return res.status(400).json({
        //             error: { message: `Missing Username`}
        //         })
        //     }
        //     if (!userpassword) {
        //         return res.status(400).json({
        //             error: { message: `Missing Password`}
        //         })
        //     }  
        //     if (!zipcode) {
        //         return res.status(400).json({
        //             error: { message: `Missing Zipcode`}
        //         })
        //     } 
        //     if (!firstname) {
        //         return res.status(400).json({
        //             error: { message: `Missing First Name`}
        //         })
        //     }
        //     if (!lastname) {
        //         return res.status(400).json({
        //             error: { message: `Missing Last Name`}
        //         })
        //     }
        //     for (const [key, value] of Object.entries(newUser)) {
        //         if (value == null) {
        //             return res.status(400).json({
        //                 error: { message: `Missing '${key}' in request body`}
        //             })
        //         }
        //     }

        // WeatherVisionService.addUser(
        //     req.app.get('db'),
        //     newUser
        // )
        //     .then(user => {
        //         res
        //             .status(201)
        //             //.location(path.posix.join(req.orginalUrl, `/${user.id}`))
        //             .json(user)
        //     })
        //     .catch(next)

        // })

    WeatherVisionRouter
        .route('/api/auth/login')


    WeatherVisionRouter
        .route('/api/users/:user_id')
        .all((req, res, next) => {
            WeatherVisionService.userById(
                req.app.get('db'),
                req.params.user_id
            )
            .then(user => {
                if (!user) {
                    return res.status(404).json({
                        error: { message: `User doesn't exist` }
                    })
                }
                res.user = user
                next()
            })
            .catch(next)
        })
        .get((req, res, next) => {
            res.json({
                id: res.user.id,
                username: xss(res.user.username),
                userpassword: xss(res.user.userpassword),
                zipcode: xss(res.user.zipcode),
                firstname: xss(res.user.firstname),
                lastname: xss(res.user.lastname),
            })
        })
        .delete((req, res, next) => {
            WeatherVisionService.deleteUser(
                req.app.get('db'),
                req.params.user_id
            )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
        })
        .patch(jsonParser, (req, res, next) => {
            const { username, userpassword, zipcode, firstname, lastname } = req.body
            const userToUpdate = { username, userpassword, zipcode, firstname, lastname }

            const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
                if (numberOfValues === 0) {
                    return res.status(400).json({
                        error: { message: `Request body must contain User Name, User Password, Zipcode, First Name, Last Name`}
                    })
                }

        WeatherVisionService.updateUser(
            req.app.get('db'),
            req.params.user_id,
            userToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)

        })

module.exports = WeatherVisionRouter;