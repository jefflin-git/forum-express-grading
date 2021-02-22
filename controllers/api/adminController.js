const db = require('../../models')
const Restaurant = db.Restaurant
const Category = db.Category

const adminController = {
  getRestaurants: (req, res) => {
    Restaurant.findAll({ raw: true, nest: true, include: [Category] })
      .then(restaurants => {
        res.json({ restaurants })
      })
      .catch(error => {
        console.log(error)
        res.render('error', { message: 'error !' })
      })
  }
}

module.exports = adminController