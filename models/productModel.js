const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name!'],
    unique: true,
    trim: true
  },
  qrCode: {
    type: String
  },
  points: {
    type: Number,
    required: [true, 'A product must have points!']
  },
  image: {
    type: String,
    trim: true,
    required: [true, 'A product must have a photo!']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

productSchema.methods.getPoints = function () {
  return this.points;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
