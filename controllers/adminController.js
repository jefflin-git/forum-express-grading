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
      if (data['status'] === 'fail') {
        return res.render('error', { message: 'error !' })
      }
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
    adminService.postRestaurant(req, res, (data) => {
      switch (data['status']) {
        case 'fail':
          res.render('error', { message: 'error !' })
          break
        case 'error':
          req.flash('error_messages', data['message'])
          res.redirect('back')
          break
        case 'success':
          req.flash('success_messages', data['message'])
          res.redirect('/admin/restaurants')
          break
      }
    })
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
    adminService.putRestaurant(req, res, (data) => {
      switch (data['status']) {
        case 'fail':
          res.render('error', { message: 'error !' })
          break
        case 'error':
          req.flash('error_messages', data['message'])
          res.redirect('back')
          break
        case 'success':
          req.flash('success_messages', data['message'])
          res.redirect('/admin/restaurants')
          break
      }
    })
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