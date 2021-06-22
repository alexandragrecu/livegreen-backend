const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'An offer must have a name!'],
      unique: true,
      trim: true,
      maxLength: [40, 'An offer must have less or equal 40 characters!'],
      minLength: [10, 'An offer must have more or equal 10 characters!']
      // validators
    },
    city: {
      type: String,
      required: [true, 'An offer must have a city!']
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'An offer must have a description!']
    },
    image: {
      type: String,
      trim: true,
      required: [true, 'An offer must have a photo!']
    },
    points: {
      type: Number,
      required: [true, 'An offer must have a price!']
    },
    expirationDate: {
      type: Date,
      required: [true, 'An offer must an expiration Date!']
    },
    people: {
      type: Number,
      required: [true, 'An offer must be for a number of people!']
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

offerSchema.methods.getPoints = function () {
  return this.points;
};

offerSchema.virtual('duration').get(function () {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = Date.now();
  const secondDate = this.expirationDate;

  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
