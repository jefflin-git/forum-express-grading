const db = require('../models')
const Category = db.Category
const categoryService = require('../services/categoryService')

const categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      return res.render('admin/categories', data)
    })
  },
  postCategory: (req, res) => {
    categoryService.postCategory(req, res, (data) => {
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
          res.redirect('/admin/categories')
      }
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
  },
  deleteCategory: (req, res) => {
    const id = req.params.id
    Category.findByPk(id)
      .then(category => {
        category.destroy()
          .then(() => {
            res.redirect('/admin/categories')
          })
      })
  }
}

module.exports = categoryController