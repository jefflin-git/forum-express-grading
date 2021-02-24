if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant

module.exports = app => {
    app.use(passport.initialize())
    app.use(passport.session())

    passport.use(new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, (req, email, password, done) => {
        User.findOne({ where: { email } })
            .then(user => {
                if (!user) {
                    return done(null, false, req.flash('error_messages', ' That email is not registered !'))
                }
                bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if (!isMatch) {
                            return done(null, false, req.flash('error_messages', ' Email or Password incorrect !'))
                        }
                        return done(null, user)
                    })
            })
            .catch(err => done(err, false))
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
    passport.deserializeUser((id, done) => {
        User.findByPk(id, {
            include: [
                { model: Restaurant, as: 'FavoritedRestaurants' },
                { model: Restaurant, as: 'LikedRestaurants' },
                { model: User, as: 'Followers' },
                { model: User, as: 'Followings' },
                { model: Restaurant, as: 'CommentedRestaurants' }
            ]
        })
            .then((user) => {
                user = user.toJSON()
                done(null, user)
            }).catch(err => done(err, null))
    })


    // JWT
    const jwt = require('jsonwebtoken')
    const passportJWT = require('passport-jwt')
    const ExtractJwt = passportJWT.ExtractJwt
    const JwtStrategy = passportJWT.Strategy

    let jwtOptions = {}
    jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
    jwtOptions.secretOrKey = process.env.JWT_SECRET

    passport.use(new JwtStrategy(jwtOptions, function (jwt_payload, next) {
        User.findByPk(jwt_payload.id, {
            include: [
                { model: db.Restaurant, as: 'FavoritedRestaurants' },
                { model: db.Restaurant, as: 'LikedRestaurants' },
                { model: User, as: 'Followers' },
                { model: User, as: 'Followings' }
            ]
        }).then(user => {
            if (!user) return next(null, false)
            return next(null, user)
        })
    }))
}