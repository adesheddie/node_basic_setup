const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const Users = require('./models/Users');
const errorHandler = require('./middlewares/exceptions');
const Address = require('./models/Address');
const PaymentMethods = require('./models/PaymentMethods');
const bcrypt = require('bcrypt');
const { createJWTToken, verifyJWTToken } = require('./middlewares/jsontoken');
const saltRounds = 10;

mongoose.connect('mongodb://localhost:27017/practise').then((connection) => {

    if (connection) console.log('Conection established');
    else console.log('Conection not established');


})

app.use(bodyparser.json());



app.get('/api/users', verifyJWTToken, async (req, res, next) => {

    try {
        let usersArr = await Users.find({}).populate('Address').populate('payment_methods');
        return res.status(200).send({ results: usersArr, success: true });

    }
    catch (err) {
        next(err);
    }

})

app.post('/api/users', async (req, res, next) => {

    try {
        let obj = req.body;

        if (!obj.firstName || !obj.lastName || !obj.age || !obj.dob || !obj.email || !obj.password) return res.status(400).send({ message: "Invalid body", success: false });

        let hashedPassword = await returnHashedPassword(obj.password);
        obj.password = hashedPassword;

        console.log('obj.password', obj.password);

        let saveResponse = await Users.create(obj);
        console.log('saveRes', saveResponse);
        if (saveResponse._id) return res.status(200).send({ message: 'User Created', success: true });
        else return res.status(200).send({ message: 'User Not Created', success: false });
    }
    catch (err) {
        next(err);
    }
})


app.post('/api/login', async (req, res, next) => {

    try {
        let obj = req.body;

        if (!obj.email || !obj.password) return res.status(400).send({ message: "Payload is missing some values", success: false });

        let theUser = await Users.findOne({ email: obj.email });

        if (!theUser) return res.status(400).send({ message: "Invalid email/password", success: false });

        let verifyPass = await verifyPassword(obj.password, theUser.password);

        if (!verifyPass) return res.status(400).send({ message: "Invalid email/password", success: false });

        const token = createJWTToken(theUser.email, theUser._id);
        return res.status(200).send({ message: "Login Successful", success: true, token: token });
    }
    catch (err) {
        next(err);
    }






})


app.put('/api/users/:id', async (req, res) => {

    try {
        let obj = req.body;

        let userId = req.params.id;

        if (!userId || !mongoose.isValidObjectId(userId)) return res.status(400).send({ message: "Invalid user id", success: false });

        let theUser = await Users.findById(userId);

        if (!theUser) return res.status(400).send({ message: "No user with id", success: false });

        Object.assign(theUser, obj);

        let updateResponse = await theUser.save();

        if (updateResponse._id) return res.status(200).send({ message: 'User Updated', success: true });
        else return res.status(200).send({ message: 'User Not Updated', success: false });

    }
    catch (err) {
        next(err);
    }

})



app.delete('/api/users/:id', async (req, res) => {


    try {
        let userId = req.params.id;

        if (!userId || !mongoose.isValidObjectId(userId)) return res.status(400).send({ message: "Invalid user id", success: false });

        let deleteUserRes = await Users.deleteOne({ _id: new mongoose.Types.ObjectId(userId) });
        console.log({ deleteUserRes })
        if (deleteUserRes.deletedCount == 0) return res.status(200).send({ message: 'User not deleted', success: false });
        else return res.status(200).send({ message: 'User Deleted', success: true });


    }
    catch (error) {
        next(err);
    }


})


app.post('/api/address', async (req, res, next) => {

    try {
        let obj = req.body;
        if (!obj.street1 || !obj.street2 || !obj.city || !obj.user || !mongoose.isValidObjectId(obj.user)) {


            return res.status(400).send({ message: "Invalid body parameters", success: false });

        }

        let theUser = await Users.findById(obj.user);

        if (!theUser) return res.status(400).send({ message: "Invalid userId", success: false });

        let saveResult = await Address.create(obj);
        console.log({ saveResult });

        if (saveResult._id) {

            theUser.Address = saveResult._id;
            await theUser.save();


            return res.status(200).send({ message: 'Address Added', success: true });
        }
        else return res.status(200).send({ message: 'Address Not Added', success: false });

    }
    catch (err) {
        next(err);
    }


})



app.get('/api/addresses', async (req, res, next) => {


    let addresses = await Address.find({}).populate('user');

    return res.status(200).send({ results: addresses, success: true });
});


app.put('/api/address/:id', async (req, res, next) => {

    try {
        let obj = req.body;
        let addressId = req.params.id;
        if (!addressId || !mongoose.isValidObjectId(addressId)) return res.status(400).send({ message: "Invalid addressId", success: false });

        let theAddress = await Address.findById(addressId);
        if (!theAddress) return res.status(400).send({ message: "Invalid address ID", success: false });
        if (obj.user) delete obj.user;
        Object.assign(theAddress, obj);


        let updateRes = await theAddress.save();

        console.log('updateRes', updateRes)

        if (updateRes._id) res.status(200).send({ message: 'Address Updated', success: true })

        else return res.status(200).send({ message: 'Address Not Updated', success: false });

    }
    catch (err) {
        next(err);
    }

})

app.delete('/api/address/:id', async (req, res, next) => {

    try {
        let addressId = req.params.id;

        if (!addressId || !mongoose.isValidObjectId(addressId)) return res.status(400).send({ message: "Invalid addressId", success: false });

        let deleteRes = await Address.deleteOne({ _id: addressId });

        if (deleteRes.deletedCount == 0) res.status(200).send({ message: 'Address not deleted', success: false })

        else return res.status(200).send({ message: 'Address deleted', success: true });
    }
    catch (err) {
        next(err);
    }

})




app.post('/api/paymentmethod', async (req, res, next) => {

    try {
        let obj = req.body;

        if (!obj.name_on_card || !obj.expiry || !obj.cvv || !obj.user || !mongoose.isValidObjectId(obj.user)) return res.status(400).send({ message: "Incorrect request body" });

        let theUser = await Users.findById(obj.user);

        if (!theUser) return res.status(400).send({ message: "Incorrect USer id" });

        let createRes = await PaymentMethods.create(obj);



        if (createRes._id) {


            theUser.payment_methods.push(createRes._id);
            await theUser.save();
            res.status(200).send({ message: 'Payment method added', success: true })

        }

        else return res.status(200).send({ message: 'Payment method not added', success: false });
    }
    catch (err) {
        next(err);
    }


})



app.get('*', (req, res) => {


    res.send('Invalid route');

})


async function returnHashedPassword(password) {
    hashedPassword = await bcrypt.hash(password, saltRounds);

    return hashedPassword;
}


async function verifyPassword(password, hashPassword) {

    console.log({ password, hashPassword });
    return await bcrypt.compare(password, hashPassword);
}




app.use(errorHandler);
console.log('Nodejs app started');
app.listen(port);
