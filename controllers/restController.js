const db = require('../models')
const restaurant = require('../models/restaurant')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
    getRestaurants: (req, res) => {
        const whereQuery = {}
        let categoryId = ''
        if (req.query.categoryId) {
            categoryId = Number(req.query.categoryId)
            whereQuery.categoryId = categoryId
        }
        Restaurant.findAll({ include: [Category], where: whereQuery })
            .then(restaurants => {
                const data = restaurants.map(r => ({
                    ...r.dataValues,
                    description: r.dataValues.description.substring(0, 50),
                    categoryName: r.Category.name
                }))
                Category.findAll({ raw: true, nest: true })
                    .then(categories => {
                        return res.render('restaurants', { restaurants: data, categories, categoryId })
                    })
            })
    },
    getRestaurant: (req, res) => {
        const id = req.params.id
        Restaurant.findByPk(id, { include: [Category] })
            .then(restaurant => {
                res.render('restaurant', { restaurant: restaurant.toJSON() })
            })
    }
}

module.exports = restController