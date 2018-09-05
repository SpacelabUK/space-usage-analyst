const mongoose = require('mongoose');

const { Schema } = mongoose;

const SpaceSchema = new Schema({
  name: { type: String, required: true },
  occupancyCapacity: { type: Number, required: true },
  siteId: { type: String, required: true },
});

const Space = mongoose.model('Space', SpaceSchema);

module.exports = Space;
