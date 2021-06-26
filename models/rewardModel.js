const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  offer_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  purchaseDate: { type: Date, default: Date.now() },
});

// const Reward = mongoose.model('Reward', rewardSchema);

module.exports = rewardSchema;
