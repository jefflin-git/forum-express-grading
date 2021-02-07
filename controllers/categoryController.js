const db = require('../models')
const category = require('../models/category')
const Category = db.Category

const categoryController = {
  getCategories: (req, res) => {
    const id = req.params.id
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        if (id) {
          Category.findByPk(id)
            .then(category => {
              return res.render('admin/categories', { categories, category: category.toJSON() })
            })
        } else {
          return res.render('admin/categories', { categories })
        }
      })
  },
  postCategory: (req, res) => {
    const { name } = req.body
    if (!name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    Category.create({ name })
      .then((category) => {
        res.redirect('/admin/categories')
      })
  },
  putCategory: (req, res) => {
    const { name } = req.body
    const id = req.params.id
    if (!name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    Category.findByPk(id)
      .then(category => {
        category.update(req.body)
          .then(() => {
            res.redirect('/admin/categories')
          })
      })
  }
}

module.exports = categoryController