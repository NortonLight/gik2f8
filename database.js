const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const { response } = require('express');


const dbPromise = (async () => {
    return open({
        filename: 'database.sqlite',
        driver: sqlite3.Database
    });
})();

const genPass = async (pass) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(pass, salt);
        return hashPassword;

    }
    catch (error) {
        throw new Error(error);
    }

};
//Question
const getQuestions = async () => {
    try {
        const dbCon = await dbPromise;
        const question = await dbCon.all('SELECT title, question, timeofquestion, duplicate, userQuestion, category, id FROM questions ORDER BY category');
        return question;

    }
    catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

const getQuestion = async (id) => {
    try {
    const dbCon = await dbPromise;
    const question = await dbCon.get('SELECT category, title, question, id FROM questions WHERE id=?', [id]);
    return question;
    }
    catch (error) {
        throw new Error(error)
    }
};

//Answers HÄR BEHÖVER DU FIXA DATABASEN TILL ANSSWERS
const getAnswers = async (data) => {
    try {
        const dbCon = await dbPromise;
        const answers = await dbCon.all('SELECT response, timeofanswer, userAnswer FROM answers WHERE questionId=?', [data.questionId]);
        return answers;

    }
    catch (error) {
        console.log(error);
        throw new Error(error);
    }
};
const getUserQuestion = async (data) => {
    try {
        const dbCon = await dbPromise;
        const userQuestion = await dbCon.all('SELECT title, question, timeofquestion, duplicate, category, id FROM questions WHERE userquestion=?', [data.userQuestion]);
        return userQuestion;

    }
    catch (error) {
        throw new Error(error);
    }


};

const updateQuestion = (async (data) => {
    try {
        const dbCon = await dbPromise;
        const user = await dbCon.get('SELECT accounttype, email FROM users WHERE email=?', [data.userQuestion]);
        const userQuestion = await dbCon.get('SELECT userQuestion FROM questions WHERE userQuestion=?', [data.userQuestion]);
        if (user.accounttype == 1) {
            const update = await dbCon.run('UPDATE questions set category=?, title=?, question=?,  timeofquestion=?, duplicate=?, userQuestion=? WHERE id=?', [data.category, data.title, data.question, data.timeofquestion, data.duplicate, data.email, data.id]);
            return update;
        }
        else if (userQuestion.userQuestion == user.email) {
            const update = await dbCon.run('UPDATE questions set category=?, title=?, question=?,  timeofquestion=?, duplicate=? WHERE userquestion=?', [data.category, data.title, data.question, data.timeofquestion, data.duplicate, data.email]);
            return update;

        } else {
            throw new error('You have no question');
        }

    }
    catch (error) {
        throw new Error(error);
    }
});

const deleteQuestion = (async (id) => {
    try {
        const dbCon = await dbPromise;
        const deleteQuestion = await dbCon.run('DELETE FROM question WHERE id=?', [id]);

    }
    catch (error) {
        throw new ErrorEvent(error);
    }


});

const addQuestion = async (data, userquestion) => {
    try {
        const dbCon = await dbPromise;

        const question = await dbCon.run('INSERT INTO questions (category, title ,question, duplicate, userQuestion) VALUES(?, ? ,?, ?, ?)', [data.category, data.title, data.question, data.duplicate, userquestion]);
        return question;

    }
    catch (error) {
        throw new Error(error);
    }

};
//Answer

const addAnswer = async (data) => {
    try {
        const dbCon = await dbPromise;

        const answer = await dbCon.run('INSERT INTO answers (response, vote ,userAnswer, questionId) VALUES(?, ?, ?, ?)', [data.response, data.vote, data.userAnswer, data.questionId]);
        return answer;

    }
    catch (error) {
        throw new Error(error);
    }

};

const updateAnswer = (async (data) => {
    try {
        //const hashPassword = await genPass(data.password);
        const dbCon = await dbPromise;
        const user = await dbCon.get('UPDATE answers set response=?, vote=?, userAnswer=?, questionId=? WHERE id=?', [data.response, data.vote, data.userAnswer, data.questionId, data.id]);
        return user;
    }
    catch (error) {
        throw new Error(error);
    }
});
const deleteAnswer = (async (id) => {
    try {
        const dbCon = await dbPromise;
        const answerdelete = await dbCon.run('DELETE FROM answers WHERE id=?', [id]);
        return answerdelete;

    }
    catch (error) {
        throw new ErrorEvent(error);
    }


});


//User
const addtUsers = async (data) => {
    try {
        const hashPassword = await genPass(data.password);
        const dbCon = await dbPromise;
        const users = await dbCon.run('INSERT INTO users (email, firstname ,lastname ,password, accounttype) VALUES(? ,? ,?, ?, ?)', [data.email, data.firstname, data.lastname, hashPassword, data.accounttype]);
        return users;

    }
    catch (error) {
        throw new Error(error);
    }

};
const userLogin = async (data, pass) => {
    try {
        const dbCon = await dbPromise;
        const trueEmail = await dbCon.get('SELECT email FROM users WHERE email=?', [data.email])
        if (data.email != null) {
            if (data.email == trueEmail.email) {
                const userPass = await dbCon.get('SELECT password FROM users WHERE email=?', [data.email]);
                //const match = pass == userPass.password;
                const match = await bcrypt.compare(pass, userPass.password);

                if (match) {
                    const userLog = await dbCon.get('SELECT email, firstname, lastname, id, accounttype, block FROM users WHERE password=?', userPass.password);
                    return userLog;
                } else {
                    //Vad kommer error ifrån här? Ett fel har ju inte uppstått
                    //Utan lösenorden matchade ju inte
                    //Anledningen till att ni hamnar här är ju att ni inte har krypterade lösenord i databasen
                    //men försöker jämföra två okrypterade lösenord vilket ställer till det.

                    //Kanske göra som så att "skapa ett nytt error som indikerar vad som gått fel istället?"
                    throw new Error("Passwords don't match.");
                    //throw new Error(error);
                }
            }
        } else {
            //Vad är response här? Response har ni bara tillgång i routen
            //Så här skulle jag inte kolla om data.email är satt, gör det
            //i anropande metod istället, dvs routes.post('login')
            throw new Error("Missing email");
            //response.send('Please write in your email!');
        }
    }
    catch (error) {
        throw error;
    }
};

const updateUser = (async (data) => {
    try {
        const hashPassword = await genPass(data.password);
        const dbCon = await dbPromise;
        const user = await dbCon.get('UPDATE users set email=?, firstname=?, lastname=?, password=?,  accounttype=?, block=? WHERE id=?', [data.email, data.firstname, data.lastname, hashPassword, data.accounttype, data.block, data.id]);
        return user;
    }
    catch (error) {
        throw new Error(error);
    }
});

const deleteUser = async (id) => {
    try {
        const dbCon = await dbPromise;
        const del = await dbCon.run('DELETE FROM users WHERE id=?', [id]);
        return del;
    }
    catch (error) {
        throw new Error(error);
    }
};
module.exports = {
    getQuestions: getQuestions,
    getQuestion: getQuestion,
    addtUsers: addtUsers,
    deleteUser: deleteUser,
    addQuestion: addQuestion,
    userLogin: userLogin,
    updateQuestion: updateQuestion,
    deleteQuestion: deleteQuestion,
    getUserQuestion: getUserQuestion,
    updateUser: updateUser,
    addAnswer : addAnswer,
    deleteAnswer :deleteAnswer,
    updateAnswer: updateAnswer,
    getAnswers: getAnswers
}