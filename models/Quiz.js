const mongoose = require('mongoose');
const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    options: [{
        question: String,
        questionId: String,
        answer: [String],
        correct_answer: String,
        isAnswerCorrect: Boolean
    }],
    user: {
        userId: String,
        isCompleted: Boolean
    },
    quizId: {
        type: String,
        required: true
    }
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;