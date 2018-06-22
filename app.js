const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const app = express();

// Map global promise
mongoose.Promise = global.Promise;

// Connect to mongoose
mongoose.connect("mongodb://localhost/vidjot-dev",
    {
        useMongoClient: true
    })
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
            .then(idea => res.redirect('/ideas'))
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
    .then(() => res.redirect('/ideas'));
});



const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});
