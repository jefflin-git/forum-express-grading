const db = require('../models')
const Restaurant = db.Restaurant
const fs = require('fs')
const imgur = require('imgur-node-api')
const restaurant = require('../models/restaurant')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  getRestaurants: (req, res) => {
    Restaurant.findAll({ raw: true })
      .then(restaurants => {
        res.render('admin/restaurants', { restaurants })
      })
      .catch(error => {
        console.log(error)
        res.render('error', { message: 'error !' })
      })
  },
  createRestaurant: (req, res) => {
    res.render('admin/create')
  },
  postRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
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
          image: file ? img.data.link : null
        })
          .then(() => {
            req.flash('success_messages', 'restaurant was successfully created')
            return res.redirect('/admin/restaurants')
          })
          .catch(error => {
            console.log(error)
            res.render('error', { message: 'error !' })
          })
      })
    } else {
      Restaurant.create({
        name,
        tel,
        address,
        opening_hours,
        description,
        image: null
      })
        .then(() => {
          req.flash('success_messages', 'restaurant was successfully created')
          return res.redirect('/admin/restaurants')
        })
        .catch(error => {
          console.log(error)
          res.render('error', { message: 'error !' })
        })
    }
  },
  getRestaurant: (req, res) => {
    const id = req.params.id
    Restaurant.findByPk(id)
      .then(restaurant => {
        res.render('admin/restaurant', {
          restaurant: restaurant.toJSON()
        })
      })
      .catch(error => {
        console.log(error)
        res.render('error', { message: 'error !' })
      })

  },
  editRestaurant: (req, res) => {
    const id = req.params.id
    Restaurant.findByPk(id)
      .then(restaurant => {
        res.render('admin/create', {
          restaurant: restaurant.toJSON()
        })
      })
      .catch(error => {
        console.log(error)
        res.render('error', { message: 'error !' })
      })
  },
  putRestaurant: (req, res) => {
    const id = req.params.id
    const { name, tel, address, opening_hours, description } = req.body
    if (!name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        Restaurant.findByPk(id)
          .then(restaurant => {
            restaurant.update({
              name,
              tel,
              address,
              opening_hours,
              description,
              image: file ? img.data.link : restaurant.image,
            })
              .then(() => {
                req.flash('success_messages', 'restaurant was successfully to update')
                res.redirect('/admin/restaurants')
              })
              .catch(error => {
                console.log(error)
                res.render('error', { message: 'error !' })
              })
          })
      })
    }
    else {
      Restaurant.findByPk(id)
        .then(restaurant => {
          restaurant.update({
            name,
            tel,
            address,
            opening_hours,
            description,
            image: restaurant.image
          })
            .then(() => {
              req.flash('success_messages', 'restaurant was successfully to update')
              res.redirect('/admin/restaurants')
            })
            .catch(error => {
              console.log(error)
              res.render('error', { message: 'error !' })
            })
        })
    }
  },
  deleteRestaurant: (req, res) => {
    const id = req.params.id
    Restaurant.findByPk(id)
      .then(restaurant => {
        restaurant.destroy()
      })
      .then(() => res.redirect('/admin/restaurants'))
      .catch(error => {
        console.log(error)
        res.render('error', { message: 'error !' })
      })
  }
}

module.exports = adminController