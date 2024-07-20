const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
    firstName: { required: true, type: String },
    lastName: { required: true, type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    dob: { type: Date, required: true },
    Address: { type: mongoose.Types.ObjectId, ref: 'Address', unique: true },
    payment_methods: [{ type: mongoose.Types.ObjectId, ref: 'PaymentMethods' }]
});

module.exports = mongoose.model('Users', usersSchema);