const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    street1: { type: String, required: true },
    street2: { type: String, required: true },
    city: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, ref: 'Users', required: true,unique:true }
});

module.exports = mongoose.model('Address', addressSchema);