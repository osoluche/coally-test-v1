const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String},
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    description: { type: String},
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;