const db = require('../models')
const Category = db.Category

const categoryController = {
    getCategories: (req, res, callback) => {
        const id = req.params.id
        Category.findAll({ raw: true, nest: true })
            .then(categories => {
                if (id) {
                    Category.findByPk(id)
                        .then(category => {
                            callback({ categories, category: category.toJSON() })
                        })
                } else {
                    callback({ categories })
                }
            })
    },
    postCategory: (req, res, callback) => {
        const { name } = req.body
        if (!name) {
            return callback({ status: 'error', message: "name didn't exist" })
        }
        Category.create({ name })
            .then((category) => {
                callback({ status: 'success', message: 'category was successfully created' })
            })
            .catch(error => {
                console.log(error)
                callback({ status: 'fail', message: 'error !' })
            })
    }
}

module.exports = categoryController