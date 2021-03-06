const routes = require('express').Router();
const session = require('express-session');
const dbService = require('./database');
const validation = /[a-z-A-Z0-9]/;
const intValidation = /[0-9]{1,5}/;
const emailValidation = /^[a-zA-z0-9._%+-]+@[a-zA-z0-9.-]+.[a-zA-Z]{2,}$/;
var sess;
var data;

routes.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: true }));

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
            res.json({ status: "nok", message: "email or password does not pass validation" });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ status: error });
    }
});

//user
routes.get('/users', async (req, res) => {
    try {
        sess = req.session;
        const allUsers = await dbService.getUsers();
        res.json(allUsers);
    }
    catch (error) {
        console.log(error);
        res.json({ status: error });
    }
})

routes.get('/users/:id', async (req, res) => {
    try {
        sess = req.session;
        id = req.params.id;
        const allUsers = await dbService.getuserbyId(id);
        res.json(allUsers);
    }
    catch (error) {
        console.log(error);
        res.json({ status: error });
    }
})

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
        if (data.accounttype == 'Admin') {
            data.accounttype = 1;
        } else if (data.accounttype == 'Contributer') {
            data.accounttype = 2;
        } else if (data.accounttype == 'Consumer') {
            data.accounttype = 3;
        } else {
            data.accounttype = null;
        }
        const accounttype = intValidation.test(data.accounttype);
        const id = intValidation.test(data.id);
        if (accounttype && id) {
            await dbService.updateUser(data);
            res.json('user was updated');
        }
    }
    catch (error) {
        throw new Error(error);
    }
});


routes.put('/block', async (req, res) => {
    try {
        const data = req.body;
        const block = intValidation.test(data.block);
        const id = intValidation.test(data.id);
        if (block && id) {
            await dbService.blockUser(data);
            res.json('user was Blocked');
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

// Questions
routes.get('/userquestions', async (req, res) => {
    try {
        sess = req.session
        const question = await dbService.getUserQuestion(sess);
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

routes.get('/question/:id', async (req, res) => {
    try {
        sess = req.session
        const qId = req.params.id;
        const question = await dbService.getQuestion(qId);
        res.json(question);
    }
    catch (error) {
        throw new Error(error);
    }
});

routes.put('/question', async (req, res) => {
    try {
        sess = req.session;
        const data = req.body;
        const category = validation.test(data.category);
        const title = validation.test(data.title);
        const question = validation.test(data.question);
        const idMatch = intValidation.test(data.id);
        const duplicate = validation.test(data.duplicate);
        if (category && title && question && idMatch) {
            await dbService.updateQuestion(data, sess);
            res.json('question was updated');
        }
    }
    catch (error) {
        throw new Error(error);
    }
});
routes.put('/duplicate', async (req, res) => {
    try {
        sess = req.session;
        const data = req.body;
        const duplicate = validation.test(data.duplicate);
        await dbService.duplicate(data);
    }
    catch (error) {
        throw new Error(error);
    }
});

routes.delete('/question/:id', async (req, res) => {
    try {
        sess = req.session
        const id = req.params.id;
        const dele = await dbService.deleteQuestion(id);
        res.json("Success");

    } catch (error) {
        throw new Error(error);
    }
});

routes.post('/question', async (req, res) => {
    try {
        const data = req.body;
        const category = validation.test(data.category);
        const title = validation.test(data.title);
        const question = validation.test(data.question);
        const duplicate = validation.test(data.duplicate);
        const userquestion = req.session.email;
        if (category && title && question && duplicate) {
            await dbService.addQuestion(data, userquestion);
            res.json('ok');
        }
    }
    catch (error) {
        throw new Error(error);
    }
});
//answers
routes.post('/answer', async (req, res) => {
    try {
        sess = req.session;
        const data = req.body;
        const response = validation.test(data.response);
        const userAnswer = sess.email;
        const questionId = intValidation.test(data.questionId);
        if (response && userAnswer && questionId) {
            await dbService.addAnswer(data, sess);
            res.json('ok');
        }
    }
    catch (error) {
        throw new Error(error);
    }
});


routes.get('/contributer', async (req, res) => {
    try {
        sess = req.session
        const answers = await dbService.getContAnswers(sess);
        res.json(answers);


    }
    catch (error) {
        throw new Error(error);
    }
});
routes.get('/answer/:id', async (req, res) => {
    try {
        sess = req.session
        const qId = req.params.id;
        const answer = await dbService.getAnswersId(qId);
        if (answer) {
            res.json(answer);
        } else {
            res.json('No answers found');
        }
    }
    catch (error) {
        throw new Error(error);
    }
});

routes.put('/voteUp', async (req, res) => {
    try {
        sess = req.session;
        const data = req.body;
        const result = await dbService.voteUpNaswer(data);
        res.json(result);

    }
    catch (error) {
        throw new Error(error);

    }

});

routes.put('/voteDown', async (req, res) => {
    try {
        sess = req.session;
        const data = req.body;
        const result = await dbService.votedownAswer(data);
        res.json(result);

    }
    catch (error) {
        throw new Error(error);

    }

});
routes.put('/answer', async (req, res) => {
    try {
        sess = req.session;
        const data = req.body;
        const response = validation.test(data.response);
        const questionId = intValidation.test(data.questionId);
        const id = intValidation.test(data.id);
        if (response && sess && questionId && id) {
            await dbService.updateAnswer(data, sess);
            res.json('answer was updated');
        }
    }
    catch (error) {
        throw new Error(error);
    }
});
routes.delete('/answer/:id', async (req, res) => {
    try {
        const data = req.params.id;
        const dele = await dbService.deleteAnswer(data);
        res.json(dele);

    } catch (error) {
        throw new error(error);
    }
});


module.exports = routes;