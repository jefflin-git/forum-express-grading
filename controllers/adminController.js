const db = require('../models')
const Restaurant = db.Restaurant
const fs = require('fs')

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
      fs.readFile(file.path, (err, data) => {
        if (err) console.log('Error: ', err)
        fs.writeFile(`upload/${file.originalname}`, data, () => {
          Restaurant.create({
            name,
            tel,
            address,
            opening_hours,
            description,
            image: file ? `/upload/${file.originalname}` : null
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
      fs.readFile(file.path, (err, data) => {
        if (err) console.log('Error: ', err)
        fs.writeFile(`upload/${file.originalname}`, data, () => {
          Restaurant.create({
            name,
            tel,
            address,
            opening_hours,
            description,
            image: file ? `/upload/${file.originalname}` : restaurant.image
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
      })
    } else {
      Restaurant.create({
        name,
        tel,
        address,
        opening_hours,
        description,
        image: restaurant.image
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