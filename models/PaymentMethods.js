const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
    name_on_card: { type: String, required: true },
    expiry: { type: String, required: true },
    cvv: { type: Number, required: true },
    user: { type: mongoose.Types.ObjectId, required: true ,ref:'Users'},
    card_number:{type:Number,required:true}
});

module.exports = mongoose.model('PaymentMethods', paymentMethodSchema);
