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


const getAnswersId = async (id) => {
    try {
        const dbCon = await dbPromise;
        const answer = await dbCon.all('SELECT response, id, questionId, timeofanswer, userAnswer FROM answers WHERE questionId=?', [id]);
        return answer;
    }
    catch (error) {
        throw new Error(error)
    }
};
//Databasen funger och skickar tillbaka svaret på DATA när vi sätter email = "user@du.se" i routes
const getUserQuestion = async (data) => {
    try {
        const dbCon = await dbPromise;
        const userQuestion = await dbCon.all('SELECT category, title, question, timeofquestion, id FROM questions WHERE userQuestion=?', [data.email]);
        return userQuestion;

    }
    catch (error) {
        throw new Error(error);
    }
};

//INTE KLAR!! måste koppla mina svar, till en users fråga.
const getContAnswers = async (sess) => {
    try {
        const dbCon = await dbPromise;
        const contAnswers = await dbCon.all('SELECT * FROM answers INNER JOIN questions ON answers.questionId = questions.Id AND answers.userAnswer=?',[sess.email]);
        return contAnswers;
        
    }
    catch (error) {
        throw new Error(error);
    }
};

const getUserQandAnswers = async () => {
    try {
        const dbCon = await dbPromise;
        const userQandAnswers = await dbCon.all('SELECT questions.*, answers.*  FROM questions LEFT JOIN answers ON questions.Id = answers.questionId ORDER BY category ASC');
        return userQandAnswers;
        
    }
    catch (error) {
        throw new Error(error);
    }
};


// const getUserQandAnswers = async () => {
//     try {
//         const dbCon = await dbPromise;
//         const userQandAnswers = await dbCon.all('SELECT * FROM questions INNER JOIN answers ON questions.Id = answers.questionId ORDER BY category ASC');
//         return userQandAnswers;
        
//     }
//     catch (error) {
//         throw new Error(error);
//     }
// };



const updateQuestion = (async (data, sess) => {
    try {
        const dbCon = await dbPromise;
        const user = await dbCon.get('SELECT accounttype, email FROM users WHERE email=?', [sess.email]);
        if (user.accounttype == 1 || user.accounttype == 3) {
            const update = await dbCon.run('UPDATE questions set category=?, title=?, question=?, userQuestion=? WHERE id=?', [data.category, data.title, data.question, sess.email, data.id]);
            return update;
        }
        else {
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
        const deleteQuestion = await dbCon.run('DELETE FROM questions WHERE id=?', [id]);

    }
    catch (error) {
        throw new Error(error);
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

const addAnswer = async (data, sess) => {
    try {
        const dbCon = await dbPromise;

        const answer = await dbCon.run('INSERT INTO answers (response, vote ,userAnswer, questionId) VALUES(?, ?, ?, ?)', [data.response, data.vote, sess.email, data.questionId]);
        return answer;

    }
    catch (error) {
        throw new Error(error);
    }

};

const updateAnswer = (async (data, sess) => {
    try {
        const dbCon = await dbPromise;
        const user = await dbCon.get('UPDATE answers set response=?, vote=?, userAnswer=?, questionId=? WHERE id=?', [data.response, data.vote, sess.email, data.questionId, data.id]);
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

const getUsers = async () => {
    try {
        const dbCon = await dbPromise;
        const users = await dbCon.all('SELECT * FROM users ORDER BY email ASC');
        return users;
    }
    catch (error) {
        console.log(error);
        throw new Error(error);
    }
};


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
                const match = await bcrypt.compare(pass, userPass.password);

                if (match) {
                    const userLog = await dbCon.get('SELECT email, firstname, lastname, id, accounttype, block FROM users WHERE password=?', userPass.password);
                    return userLog;
                } else {
                    throw new Error("Passwords don't match.");
                }
            }
        } else {
            throw new Error("Missing email");
        }
    }
    catch (error) {
        throw error;
    }
};
const duplicate = async (data) =>{
    try {
        const dbCon = await dbPromise;
        const duplicate = await dbCon.get('UPDATE questions SET duplicate=? WHERE id=?', [data.duplicate, data.id]);
        return duplicate;
    }
    catch (error) {
        throw new Error(error);
    }
};

const updateUser = (async (data) => {
    try {
        //const hashPassword = await genPass(data.password);
        const dbCon = await dbPromise;
        const user = await dbCon.get('UPDATE users set accounttype=? WHERE id=?', [data.accounttype, data.id]);
        return user;
    }
    catch (error) {
        throw new Error(error);
    }
});
const getuserbyId = (async (id) => {
    try{
        const dbCon = await dbPromise;
        const user = await dbCon.get('SELECT email, accounttype, block, id FROM users WHERE id=?', [id]);
        return user;
    }
    catch (error){
        throw new Error (error);
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
const blockUser = async (data) => {
    try {
        const dbCon = await dbPromise;
        const del = await dbCon.run('UPDATE users set block=? WHERE id=?', [data.block, data.id]);
        return del;
    }
    catch (error) {
        throw new Error(error);
    }
};
module.exports = {
    getQuestions: getQuestions,
    getQuestion: getQuestion,
    addQuestion: addQuestion,
    updateQuestion: updateQuestion,
    deleteQuestion: deleteQuestion,
    getUserQuestion: getUserQuestion,
    duplicate: duplicate,
    addAnswer: addAnswer,
    getAnswersId: getAnswersId,
    getContAnswers: getContAnswers,
    deleteAnswer: deleteAnswer,
    updateAnswer: updateAnswer,
    getAnswers: getAnswers,
    getUsers: getUsers,
<<<<<<< HEAD
    getAnswersId: getAnswersId,
    getContAnswers: getContAnswers,
    getUserQandAnswers: getUserQandAnswers
=======
    updateUser: updateUser,
    addtUsers: addtUsers,
    deleteUser: deleteUser,
    blockUser: blockUser,
    userLogin: userLogin,
    getuserbyId: getuserbyId,
    
>>>>>>> 51215755c3869e80c24513c1e192198d3332e879
}