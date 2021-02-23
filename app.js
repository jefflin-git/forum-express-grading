const express = require('express')
const app = express()
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const helpers = require('./_helpers')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')
const methodOverride = require('method-override')
const db = require('./models')
const port = process.env.PORT || 3000

app.engine('handlebars', handlebars({ defaultLayout: 'main', helpers: require('./config/handlebars-helpers') })) // Handlebars 註冊樣板引擎
app.set('view engine', 'handlebars') // 設定使用 Handlebars 做為樣板引擎

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(methodOverride('_method'))

app.use('/upload', express.static(__dirname + '/upload'))

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}))

passport(app)

app.use(flash())

app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = helpers.getUser(req)
  next()
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

require('./routes')(app)

module.exports = app
