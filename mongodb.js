const { MongoClient, ObjectId } = require('mongodb');


const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'
const client = new MongoClient(connectionURL);
const id = ObjectId();

console.log(id)

const tasks = [{ description: "Do react course", completed: false }, { description: "Do node course", completed: false }, { description: "Do web bootcamp course", completed: true }]
client.connect((err, client) => {
    if (err) {
        return console.log('cannot connect to the server');
    }

    console.log('could connect to the server')
    const db = client.db(databaseName);

    // db.collection('users').insertOne({
    //     "_id": id,
    //     'name': 'Adrian',
    //     'age': 30
    // }, (err, res) => {
    //     if (err) {
    //         return console.log(err)
    //     }
    //     console.log(res)
    // })

    // db.collection('users').insertMany([{ name: 'Dua', age: 27 }, { name: 'Britney', age: 39 }], (err, res) => {
    //     if (err) {
    //         return console.log(`An error occured ${err}`)
    //     }
    //     console.log(res)
    // })

    // db.collection('tasks').insertMany(tasks, (err, res) => {
    //     if (err) {
    //         return console.log(`An error occured ${err}`)
    //     }
    //     console.log(res)
    // })
    const findOneUser = async () => {
        const result = await db.collection('users').find().sort({ '_id': -1 }).limit(1).toArray()
        console.log(result)
    }

    const findUser = async () => {
        const result = await db.collection('users').find({ age: 31 }).toArray()
        const count = await db.collection('users').countDocuments({ age: 31 })
        console.log(result, count)
    }


    const findTasks = async () => {
        const result = await db.collection('tasks').find({ completed: false }).toArray()
        console.log(result)
    }

    const updateUser = async () => {
        try {
            const result = await db.collection('users').updateOne({ _id: new ObjectId("629c89306532cdadda286516") }, { $set: { name: 'Thu Ra Aung Kyaw' } })
            console.log(result)
        } catch (e) {
            console.log(e.message)
        }

    }

    const updateAge = async () => {
        try {
            const result = await db.collection('users').updateOne({ _id: new ObjectId("629c89306532cdadda286516") }, { $inc: { age: 1 } })
            console.log(result)
        } catch (e) {
            console.log(e.message)
        }
    }

    const updateTasks = async () => {
        try {
            const result = await db.collection('tasks').updateMany({}, { $set: { completed: true } })
            console.log(result)
        } catch (e) {
            console.log(e.message)
        }
    }

    // findUser()
    // findOneUser()
    // findTasks()
    // updateUser()
    // updateAge()
    //updateTasks()


});
