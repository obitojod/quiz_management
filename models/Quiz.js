const mongoose = require('mongoose');
const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    options: [{
        question: String,
        answer: [String],
        correct_answer: String
    }]
});
const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;