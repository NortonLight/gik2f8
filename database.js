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
        const question = await dbCon.all('SELECT title, question, timeofquestion, duplicate, category, id FROM questions ORDER BY category');
        return question;

    }
    catch (error) {
        console.log(error);
        throw new Error(error);
    }
};
const getUserQuestion = async (data) =>{
    try{
        const dbCon = await dbPromise;
        const userQuestion = await dbCon.all('SELECT title, question, timeofquestion, duplicate, category, id FROM questions WHERE userquestion=?',[data.userQuestion]);
        return userQuestion;

    }
    catch(error) {
        throw new Error(error);
    }


};
//Gör en getQuestion med email//
//Testa//
//if(email == user.userquestion)=> ändra fråga annars du har inga frågor
const updateQuestion = (async (data) => {
    try {
        const dbCon = await dbPromise;
        const user = await dbCon.get('SELECT accounttype FROM users WHERE email=?', [data.email]);
        const userQuestion = await dbCon.get('SELECT userquestion FROM questions WHERE userquestion=?', [data.userQuestion]);
        if (user.accounttype == 1) {
            const update = await dbCon.run('UPDATE questions set category=?, title=?, question=?,  timeofquestion=?, duplicate=?, userQuestion=? WHERE id=?', [data.category, data.title, data.question, data.timeofquestion, data.duplicate, data.email, data.id]);
            return update;
        }
        else if (userQuestion.userQuestion == user.email) {
            const update = await dbCon.run('UPDATE questions set category=?, title=?, question=?,  timeofquestion=?, duplicate=? WHERE userquestion=?', [data.category, data.title, data.question, data.timeofquestion, data.duplicate, data.email]);
            return update;

        } else {
            return response.json('You have no question');
        }

    }
    catch (error) {
        throw new Error(error);
    }
});
//Testa
const deleteQuestion = (async (id) => {
    try {
        const dbCon = await dbPromise;
        const deleteQuestion = await dbCon.run('DELETE FROM question WHERE id=?', [id]);

    }
    catch (error) {
        throw new ErrorEvent(error);
    }


});
//Testa
const addQuestion = async (data) => {
    try {
        const dbCon = await dbPromise;
        
        const question = await dbCon.run('INSERT INTO questions (category, title ,question, duplicate, userQuestion) VALUES(?, ? ,?, ?, ?)', [data.category, data.title, data.question, data.duplicate, data.userQuestion]);
        return question;

    }
    catch (error) {
        throw new Error(error);
    }

};
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
                    const userLog = await dbCon.get('SELECT email, firstname, lastname, id, accounttype FROM users WHERE password=?', userPass.password);
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


const deleteUser = async (id) => {
    try {
        const dbCon = await dbPromise;
        const del = await dbCon.run('DELETE FROM users WHERE id=?', [id]);
    }
    catch (error) {
        throw new Error(error);
    }
};
module.exports = {
    getQuestions: getQuestions,
    addtUsers: addtUsers,
    deleteUser: deleteUser,
    addQuestion: addQuestion,
    userLogin: userLogin,
    updateQuestion: updateQuestion,
    deleteQuestion: deleteQuestion,
    getUserQuestion: getUserQuestion
}