const db = require('../models')
const restaurant = require('../models/restaurant')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10

const restController = {
    getRestaurants: (req, res) => {
        let offset = 0
        const whereQuery = {}
        let categoryId = ''
        if (req.query.page) {
            offset = (req.query.page - 1) * pageLimit
        }

        if (req.query.categoryId) {
            categoryId = Number(req.query.categoryId)
        }

        Restaurant.findAndCountAll({ include: [Category], where: categoryId, offset, limit: pageLimit })
            .then(result => {
                // data for pagination
                const page = Number(req.query.page) || 1
                const pages = Math.ceil(result.count / pageLimit)
                const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
                const prev = page - 1 < 1 ? 1 : page - 1
                const next = page + 1 > pages ? pages : page + 1

                // clean up restaurant data
                const data = result.rows.map(r => ({
                    ...r.dataValues,
                    description: r.dataValues.description.substring(0, 50),
                    categoryName: r.dataValues.Category.name,
                    isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id)
                }))
                Category.findAll({ raw: true, nest: true })
                    .then(categories => {
                        return res.render('restaurants', { restaurants: data, categories, categoryId, page, totalPage, prev, next })
                    })
                    .catch(error => {
                        console.log(error)
                        res.render('error', { message: 'error !' })
                    })
            })
            .catch(error => {
                console.log(error)
                res.render('error', { message: 'error !' })
            })
    },
    getRestaurant: (req, res) => {
        const id = req.params.id
        return Restaurant.findByPk(id, { include: [Category, { model: User, as: 'FavoritedUsers' }, { model: Comment, include: [User] }] })
            .then(restaurant => {
                // 在sequelize文件中increment使用await控制非同步，但不使用非同步語法運作OK，想聽聽助教的建議
                restaurant.increment('viewCounts', { by: 1 })
                    .then(restaurant => {
                        const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
                        res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited })
                    })
                    .catch(error => {
                        console.log(error)
                        res.render('error', { message: 'error !' })
                    })
            })
            .catch(error => {
                console.log(error)
                res.render('error', { message: 'error !' })
            })
    },
    getFeeds: (req, res) => {
        return Promise.all([
            Restaurant.findAll({
                limit: 10,
                raw: true,
                nest: true,
                order: [['createdAt', 'DESC']],
                include: [Category]
            }),
            Comment.findAll({
                limit: 10,
                raw: true,
                nest: true,
                order: [['createdAt', 'DESC']],
                include: [User, Restaurant]
            })
        ])
            .then(([restaurants, comments]) => {
                res.render('feeds', { restaurants, comments })
            })
            .catch(error => {
                console.log(error)
                res.render('error', { message: 'error !' })
            })
    },
    getDashboard: (req, res) => {
        const id = req.params.id
        return Restaurant.findByPk(id, { include: [Category, Comment] })
            .then(restaurant => {
                res.render('dashboard', { restaurant: restaurant.toJSON() })
            })
            .catch(error => {
                console.log(error)
                res.render('error', { message: 'error !' })
            })
    }
}

module.exports = restController