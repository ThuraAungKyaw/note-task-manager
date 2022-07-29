const { Router } = require("express");
const router = Router();
const auth = require("../middlewares/auth");
const Task = require("../models/task");


router.get("/tasks", auth, async (req, res) => {
    let { completed, limit, skip, sortBy } = req.query;
    let searchCriteria = { owner: req.user._id }
    let mSkip = 0;
    let mLimit = 0;
    let mSortField = "createdAt";
    let mSortOrder = "desc";

    if (sortBy) {
        let [sortField, sortOrder] = sortBy.split(":");
        mSortField = sortField;
        mSortOrder = sortOrder;
    }
    if (completed) searchCriteria = {
        ...searchCriteria, completed
    }
    if (limit) mLimit = limit;
    if (skip) mSkip = skip;
    try {
        const result = await Task.find(searchCriteria).limit(mLimit).skip(mSkip).sort({
            [mSortField]: mSortOrder === 'asc' ? 1 : -1
        });
        if (!result) return res.status(404).send("No tasks found!")

        res.status(200).send(result)
    } catch (e) {
        res.status(500).send(`There was an error \n ${e}`)
    }
})

router.get("/tasks/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Task.findOne({ _id: id, owner: req.user._id })
        //await result.populate('owner');

        if (!result) return res.status(404).send()

        res.status(200).send(result)
    } catch (e) {
        res.status(500).send(`There was an error \n ${e}`)
    }
})

router.patch("/tasks/:id", auth, async (req, res) => {
    const { id } = req.params;
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update));

    if (!isValidUpdate || updates.length === 0) {
        return res.status(400).send({ error: "Invalid Update" })
    }
    try {
        const task = await Task.findOne({ _id: id, owner: req.user._id });
        if (!task) return res.status(404).send()
        updates.forEach(update => task[update] = req.body[update])
        const result = await task.save();

        res.status(200).send(result)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.post("/tasks", auth, async (req, res) => {
    try {
        const task = new Task({ ...req.body, owner: req.user._id });
        const response = await task.save();
        res.status(201).send(`Task saved \n ${response}`)
    } catch (e) {
        res.status(400).send(`There was an error \n ${e}`)
    }
})

router.delete("/tasks/:id", auth, async (req, res) => {
    const { id } = req.params;
    try {
        const task = await Task.findOne({ _id: id, owner: req.user._id });
        if (!task) return res.status(404).send()

        await task.remove();
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(`There was an error \n ${e}`)
    }
})


module.exports = router;