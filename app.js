const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

// Map global promise
mongoose.Promise = global.Promise;

// Connect to mongoose
mongoose.connect("mongodb://localhost/vidjot-dev")
    .then((() => console.log('mongo connected')))
    .catch(err => console.log(err));

// Load Idea model
require('./models/Idea');
const Idea = mongoose.model('ideas');

// Handlebars middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));

// body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// method override middleware
app.use(methodOverride('_method'));

// session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// flash middleware
app.use(flash());

// global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.set('view engine', 'handlebars');

// Index Route

app.get('/', (req, res) => {
    const title = 'Welcome Justin';
    res.render('index', {
        title: title
    });
});

// About Route

app.get('/about', (req, res) => {
    res.render('about');
});

// List Ideas

app.get('/ideas', (req, res) => {
    Idea.find({})
        .sort({date: 'desc'})
        .then(ideas => {
            res.render('ideas/index', {
                ideas: ideas
        })
    });
});


// Add Idea Form

app.get('/ideas/add', (req, res) => {
    res.render('ideas/add');
});

// Edit Idea Form

app.get('/ideas/edit/:id', (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea => {
        res.render('ideas/edit', {
            idea: idea
        });
    });
});


// Process Form

app.post('/ideas', (req, res) => {
    let errors = [];
    if (!req.body.title) {
        errors.push({text: 'Please add a title'});
    }
    if (!req.body.details) {
        errors.push({text: 'Please add details'});
    }
    if (errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        const newUser = {
            title: req.body.title,
            details: req.body.details
        }
        new Idea(newUser)
            .save()
            .then(idea => {
              req.flash('success_msg', 'Video idea added');
              res.redirect('/ideas')
            });
    }
});

app.put('/ideas/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    idea.title = req.body.title;
    idea.details = req.body.details;
    idea.save()
      .then(idea => {
        res.redirect('/ideas');
      })
  });
});

// Delete Idea
app.delete('/ideas/:id', (req, res) => {
  Idea.remove({
    _id: req.params.id
  })
    .then(() => {
      req.flash('success_msg', 'Video idea removed');
      res.redirect('/ideas');
    });
});



const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});
