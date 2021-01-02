//Dependencies
const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const path = require('path');
const bcrypt = require('bcrypt');
const userModel = require(path.join(__dirname, '..', 'models', 'user'));

const validationChecks = [
    check('username', 'Add meg a felhasználónevet!')
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("A felhasználónévnek legalább 3 karakternek kell lennie!")
        .isLength({ max: 25 })
        .withMessage("A felhasználónév maximum 25 karakter lehet!")
        .custom((value) => {
            return userModel.findOne({username: new RegExp('^'+value+'$', "i")})
            .then(user => {
                if (user) {
                  return Promise.reject('A felhasználónév foglalt!');
                }
            });
        }),
    check("password", "Add meg a jelszót!")
        .notEmpty()
        .isLength({ min: 8 })
        .withMessage("A jelszónak legalább 8 karakternek kell lennie!")
        .isLength({ max: 25 })
        .withMessage("A jelszó maximum 25 karakter lehet!")
        .custom((value, { req }) => {
            if (value !== req.body.password_confirm) {
                throw new Error('A két jelszó nem egyezik meg!');
            }
            else {
                return true
            }
        }),
    check('email', 'Add meg az email címet!')
        .notEmpty()
        .isLength({ min: 5 })
        .withMessage("Az email címnek legalább 5 karakternek kell lennie!")
        .isLength({ max: 25 })
        .withMessage("A email címnek maximum 25 karakter lehet!")
        .isEmail()
        .withMessage("Valós email címet adj meg!")
        .normalizeEmail()
]

//Route register
router.route('/')
.get((req, res) => { res.render('register'); })
.post(validationChecks, async(req, res) => {
    const userObject = {
        username: req.body.username,
        password: req.body.password,
        password_confirm: req.body.password_confirm,
        email: req.body.email
    };
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        const alertsArray = errors.array()
        res.render('register', {
            formData: userObject,
            alerts: alertsArray
        })
    }
    else {
        try {
            const postUser = new userModel({
                username: userObject.username,
                password: await bcrypt.hash(userObject.password, 10),
                email: userObject.email
            });
            await postUser.save();
            res.render('register', { 
              success: true
            });
        } 
        catch (err) {
            res.render('register', { 
                formData: userObject,
                errorMessage: err.message
            });
        }
    }
});

module.exports = router;
