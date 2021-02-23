const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const fs = require('fs')
const imgur = require('imgur-node-api')
const restaurant = require('../models/restaurant')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
    getRestaurants: (req, res, callback) => {
        return Restaurant.findAll({ raw: true, nest: true, include: [Category] })
            .then(restaurants => {
                callback({ restaurants })
            })
            .catch(error => {
                console.log(error)
                callback({ status: 'fail', message: 'error !' })
            })
    },
    getRestaurant: (req, res, callback) => {
        const id = req.params.id
        Restaurant.findByPk(id, { include: [Category] })
            .then(restaurant => {
                callback({
                    restaurant: restaurant.toJSON()
                })
            })
            .catch(error => {
                console.log(error)
                callback({ status: 'fail', message: 'error !' })
            })

    },
    deleteRestaurant: (req, res, callback) => {
        const id = req.params.id
        Restaurant.findByPk(id)
            .then(restaurant => {
                restaurant.destroy()
            })
            .then(() => callback({ status: 'success', message: '' }))
            .catch(error => {
                console.log(error)
                callback({ status: 'fail', message: 'error !' })
            })
    },
    postRestaurant: (req, res, callback) => {
        const { name, tel, address, opening_hours, description } = req.body
        if (!name) {
            return callback({ status: 'error', message: "name didn't exist" })
        }
        const { file } = req
        if (file) {
            imgur.setClientID(IMGUR_CLIENT_ID)
            imgur.upload(file.path, (err, img) => {
                Restaurant.create({
                    name,
                    tel,
                    address,
                    opening_hours,
                    description,
                    image: file ? img.data.link : null,
                    CategoryId: req.body.categoryId
                })
                    .then(() => {
                        callback({ status: 'success', message: 'restaurant was successfully created' })
                    })
                    .catch(error => {
                        console.log(error)
                        callback({ status: 'fail', message: 'error !' })
                    })
            })
        } else {
            Restaurant.create({
                name,
                tel,
                address,
                opening_hours,
                description,
                image: null,
                CategoryId: req.body.categoryId
            })
                .then(() => {
                    callback({ status: 'success', message: 'restaurant was successfully created' })
                })
                .catch(error => {
                    console.log(error)
                    callback({ status: 'fail', message: 'error !' })
                })
        }
    }
}

module.exports = adminController