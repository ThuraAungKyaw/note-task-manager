require("../db/mongoose");
const User = require("../models/user");
const Task = require("../models/task");

//Task.countDocuments({ completed: false })
// .then(res => {
//     console.log(res)
//     return Task.findByIdAndDelete("62a57eabe7a44cc6fabeb8d0")
// }).then(res => {
//     console.log(res)
//     return Task.countDocuments({ completed: false })
// }).then(result => {
//     console.log(result)
// }).catch(e => console.log(e))
const deleteAndCount = async () => {
    const beforeCount = await Task.countDocuments({ completed: true })
    const delResult = await Task.deleteMany({ completed: true })
    const afterCount = await Task.countDocuments({ completed: true })
    console.log(beforeCount)
    console.log(delResult)
    console.log(afterCount)
}

const findUserAndUpdate = async (id, age) => {
    const user = await User.findByIdAndUpdate(id, { age: age })
    const count = await User.countDocuments({ age: age })
    return count;
}

// findUserAndUpdate("62a57d5e4a2af6d92dec4eae", 31)
//     .then(res => console.log(res))
//     .catch(e => console.log(e))

// User.findByIdAndUpdate("62a57d5e4a2af6d92dec4eae", { age: 18 })
//     .then(_ => {
//         return User.countDocuments({ age: 18 })
//     }).then(result => console.log(result))
//     .catch(e => console.log(e))


deleteAndCount()