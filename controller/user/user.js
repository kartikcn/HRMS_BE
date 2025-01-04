const userRoute = require('express').Router();


userRoute.get('/', (req, res) => {
    try {
        console.log("user route")
        res.send('Oksssssssssss');
    } catch (error) {
        res.status(404).send('Invalid request')
    }
});
userRoute.post('/changepassword', (req, res) => {
    try {
        console.log("change route")
        res.send('Ok');
    } catch (error) {
        res.status(404).send('Invalid request')
    }
});

module.exports = userRoute;