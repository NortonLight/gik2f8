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
        //sess.type = req.body.type;
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
            //Dumt att skicka html här eftersom vi frågar ett
            //api, returnera typ ett json-svar att användaren
            //måste logga in
            //Och varför skicka please login first, när användaren försöker logga in?
            //res.write('<h1>Please login first.</h1>');
            //res.end('<a href=' + '/' + '>Login</a>');
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

//lägga till en user
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
routes.delete('/users', async (req, res) => {
    try {
        const data = req.body.id;
        const dele = await dbService.deleteQuestion(data);
        res.json(dele);

    } catch (error) {
        throw new error(error);
    }
});

//lägga till en fråga /7Testa
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

//På min fråga(title, text, datum, kategori, id, )
//PÅ user sidan ska man kunna se de frågor som ställs ofta (FAQ)
//man ska kunna se vilka frågor som ställs mest i vilken kategori
//Get mina frågor (vue) standard!! montend
//Att kunna se om någon har svarat på frågan

module.exports = routes;