const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const fs = require('fs')
const imgur = require('imgur-node-api')
const restaurant = require('../models/restaurant')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const adminService = require('../services/adminService')

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render('admin/restaurants', data)
    })
  },
  createRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        res.render('admin/create', { categories })
      })
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
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId
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
        image: null,
        CategoryId: req.body.categoryId
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
    adminService.getRestaurant(req, res, (data) => {
      if (data['status'] === 'fail') {
        return res.render('error', { message: 'error !' })
      }
      return res.render('admin/restaurant', data)
    })
  },
  editRestaurant: (req, res) => {
    const id = req.params.id
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        Restaurant.findByPk(id)
          .then(restaurant => {
            res.render('admin/create', {
              restaurant: restaurant.toJSON(),
              categories
            })
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
              CategoryId: req.body.categoryId
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
            image: restaurant.image,
            CategoryId: req.body.categoryId
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
    adminService.deleteRestaurant(req, res, (data) => {
      switch (data['status']) {
        case 'success':
          return res.redirect('/admin/restaurants')
        case 'fail':
          return res.render('error', { message: 'error !' })
      }
    })
  },
  getUsers: (req, res) => {
    User.findAll({ raw: true })
      .then(users => {
        res.render('admin/users', { users })
      })
      .catch(error => {
        console.log(error)
        res.render('error', { message: 'error !' })
      })
  },
  toggleAdmin: (req, res) => {
    const id = req.params.id
    User.findByPk(id)
      .then(user => {
        user.update({
          isAdmin: !user.isAdmin
        })
      })
      .then(() => {
        req.flash('success_messages', 'user was successfully to update')
        res.redirect('/admin/users')
      })
      .catch(error => {
        console.log(error)
        res.render('error', { message: 'error !' })
      })
  }
}

module.exports = adminController