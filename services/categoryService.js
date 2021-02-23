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
    }
}

module.exports = categoryController