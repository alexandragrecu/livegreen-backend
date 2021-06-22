const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'An article must have a title'],
    trim: true
  },
  link: {
    type: String,
    required: [true, 'An article must have a link'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'An article must have an image'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'An article must have a description'],
    trim: true
  }
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
