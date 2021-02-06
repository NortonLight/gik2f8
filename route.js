const routes = require('express').Router();
const session = require('express-session');
const dbService = require('./database');
const validation = /[a-z-A-Z0-9]/;
const intValidation = /[0-9]{1,5}/;
const emailValidation = /^[a-zA-z0-9._%+-]+@[a-zA-z0-9.-]+.[a-zA-Z]{2,}$/;
var sess;
var data;

routes.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: true }));

routes.get('/', async (req, res) => {
    try {
        sess = req.session;
        if (sess.email) {
            return res.redirect('/login');
        }
        res.sendFile('index.html');

    }
    catch (error) {
        throw new Error(error);
    }
});

//logga in 
routes.post('/login', async (req, res) => {
    try {
        sess = req.session;
        sess.email = req.body.email;
        data = req.body.password;
        const password = data;
        const emailMatch = emailValidation.test(sess.email);
        const passwordMatch = validation.test(password);
        if (emailMatch && passwordMatch) {
            const user = await dbService.userLogin(sess, password);
            if (user) {

                if (user.accounttype == 1) {
                    return res.json(user);
                } else if (user.accounttype == 2) {
                    return res.json(user);
                } else if (user.accounttype == 3) {
                    return res.json(user);
                }

            }
        } else {
            res.json({status: "nok", message: "email or password does not pass validation"});
        }
    }
    catch (error) {
        console.log(error);
        res.json({status: error });
    }
});
routes.get('/admin', async (req, res) => {
    try {
        const question = await dbService.getQuestions();
        res.json(question);
    }
    catch (error) {
        throw new Error(error);
    }
});

routes.get('/contributer', async (req, res) => {
    try {
        const question = await dbService.getQuestions();
        res.json(question);
    }
    catch (error) {
        throw new Error(error);
    }
});

routes.get('/user', async (req, res) => {
    try {
        sess = req.session;
        if(sess.email){
            
        const question = await dbService.getUserQuestions();
        res.json(question);

        }
    }
    catch (error) {
        throw new Error(error);
    }
});

//user
routes.post('/users', async (req, res) => {
    try {
        const data = req.body;
        const email = validation.test(data.email);
        const firstname = validation.test(data.firstname);
        const lastname = validation.test(data.lastname);
        const password = validation.test(data.password);
        const accounttype = intValidation.test(data.accounttype);
        if (email && firstname && lastname && password && accounttype) {
            await dbService.addtUsers(data);
            res.json('ok');
        }
    }
    catch (error) {
        throw new Error(error);
    }
});
routes.put('/user', async (req, res) => {
    try {
        const data = req.body;
        const email = validation.test(data.email);
        const firstname = validation.test(data.firstname);
        const lastname = validation.test(data.lastname);
        const password = validation.test(data.password);
        const accounttype = intValidation.test(data.accounttype);
        const block = intValidation.test(data.block);
        const id = intValidation.test(data.id);
        if (email && firstname && lastname && password && accounttype && block && id) {
            await dbService.updateUser(data);
            res.json('user was updated');
        }
    }
    catch (error) {
        throw new Error(error);
    }
});

routes.delete('/users/:id', async (req, res) => {
    try {
        const data = req.params.id;
        const dele = await dbService.deleteUser(data);
        res.json(dele);

    } catch (error) {
        throw new error(error);
    }
});

// Get user Frågor // Testa
routes.get('/userquestions', async (req, res) => {
    try {
        sess = req.session
        const question = await dbService.getUserQuestion(sess.email);
        res.json(question);

    }
    catch (error) {
        throw new Error(error);
    }
});

routes.get('/questions', async (req, res) => {
    try {
        sess = req.session
        const question = await dbService.getQuestions();
        res.json(question);

    }
    catch (error) {
        throw new Error(error);
    }
});

//updatera min fråga //Testa
routes.put('/question', async (req, res) => {
    try {
        const data = req.body;
        const category = validation.test(data.category);
        const title = validation.test(data.title);
        const question = validation.test(data.question);
        const idMatch = intValidation.test(data.id);
        const timeofquestion = data.timeofquestion;
        if (category && title && question && idMatch) {
            await dbService.updateQuestion(data);
            res.json('question was updated');
        }
    }
    catch (error) {
        throw new Error(error);
    }
});
//tabort min fråga // Testa
routes.delete('/question', async (req, res) => {
    try {
        const data = req.body.id;
        const dele = await dbService.deleteQuestion(data);
        res.json(dele);

    } catch (error) {
        throw new error(error);
    }
});

//lägga till en fråga //Testa
routes.post('/question', async (req, res) => {
    try {
        const data = req.body;
        const category = validation.test(data.category);
        const title = validation.test(data.title);
        const question = validation.test(data.question);
        const duplicate = validation.test(data.duplicate);
        const userquestion = req.session.email;
        if (category && title && question && duplicate) {
            await dbService.addQuestion(data);
            res.json('ok');
        }
    }
    catch (error) {
        throw new Error(error);
    }
});

module.exports = routes;