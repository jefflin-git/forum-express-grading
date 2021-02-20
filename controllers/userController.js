const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const helpers = require('../_helpers')

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: (req, res) => {
    const { name, email, password, passwordCheck } = req.body
    if (passwordCheck !== password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    }

    User.findOne({ where: { email } })
      .then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        }
        User.create({
          name,
          email,
          password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
        })
          .then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
          .catch(error => {
            console.log(error)
            res.render('error', { message: 'error !' })
          })
      })
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res) => {
    const UserId = req.params.id
    return Promise.all([
      User.findByPk(UserId),
      Comment.findAndCountAll({ raw: true, nest: true, include: Restaurant, where: { UserId } })
    ])
      .then(([user, comments]) => {
        const countComment = comments.count
        const restaurants = comments.rows.map(comment => comment.Restaurant)
        res.render('profile', { userData: user.toJSON(), countComment, restaurants, countRestaurant: restaurants.length })
      })
      .catch(error => {
        console.log(error)
        res.render('error', { message: 'error !' })
      })
  },
  editUser: (req, res) => {
    const id = req.params.id
    return User.findByPk(id)
      .then(user => {
        res.render('profileEdit', { userData: user.toJSON() })
      })
      .catch(error => {
        console.log(error)
        res.render('error', { message: 'error !' })
      })
  },
  putUser: (req, res) => {
    const id = req.params.id
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(id)
          .then(user => {
            return user.update({
              name: req.body.name,
              image: img.data.link
            })
              .then(() => {
                req.flash('success_messages', 'user profile was successfully to update')
                res.redirect(`/users/${id}`)
              })
              .catch(error => {
                console.log(error)
                res.render('error', { message: 'error !' })
              })
          })
      })
    } else {
      return User.findByPk(id)
        .then(user => {
          return user.update({
            name: req.body.name,
            image: user.image
          })
            .then(() => {
              req.flash('success_messages', 'user profile was successfully to update')
              res.redirect(`/users/${id}`)
            })
            .catch(error => {
              console.log(error)
              res.render('error', { message: 'error !' })
            })
        })
    }
  },
  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    })
      .then(() => {
        return res.redirect('back')
      })
  },
  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        favorite.destroy()
          .then(() => {
            return res.redirect('back')
          })
      })
  },
  addLike: (req, res) => {
    return Like.create({
      UserId: helpers.getUser(req).id,
      RestaurantId: req.params.restaurantId
    })
      .then(() => {
        return res.redirect('back')
      })
  },
  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        like.destroy()
          .then(() => {
            return res.redirect('back')
          })
      })
  },
  getTopUser: (req, res) => {
    return User.findAll({ include: [{ model: User, as: 'Followers' }] })
      .then(users => {
        users = users.map(user => ({
          ...user.dataValues,
          FollowerCount: user.Followers.length,
          isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
        }))
        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
        return res.render('topUser', { users })
      })
  }
}

module.exports = userController