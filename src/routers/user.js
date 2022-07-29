const { Router } = require("express");
const auth = require("../middlewares/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendCancelEmail } = require("../emails/account");
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error("Please upload an image file that falls under the format of jpg, jpeg, or png."))
        }

        callback(undefined, true)
    }
})
const router = Router();
const User = require("../models/user");


router.get("/users/me", auth, async (req, res) => {
    try {

        let user = await User.findById({ _id: req.user._id })
        user = await user.populate({
            path: "tasks"
        })

        res.status(200).send({ user: req.user, tasks: user.tasks })
    } catch (e) {
        res.status(500).send(`There was an error \n ${e}`)
    }
})

router.get("/users/:id/avatar", async (req, res) => {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
    try {
        if (!user || !user.avatar) throw new Error()

        res.set("Content-Type", "image/png")
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }

    res.status(200).send()
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message })
})

router.post("/users", async (req, res) => {

    try {
        const user = new User(req.body)
        const token = await user.generateToken();

        sendWelcomeEmail(user.email, user.name)


        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(`There was an error \n ${e}`)
    }
})

router.post("/users/logout", auth, async (req, res) => {

    try {
        const user = req.user;
        user.tokens = user.tokens.filter(token => token.token !== req.token)
        await user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }


})

router.post("/users/logoutAll", auth, async (req, res) => {

    try {
        const user = req.user;
        user.tokens = []
        await user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }


})

router.post("/users/login", async (req, res) => {

    const { email, password } = req.body;
    if (email && password) {
        try {
            const user = await User.findByCredentials(email, password);
            const token = await user.generateToken();
            if (user) {

                return res.status(200).send({ user, token })
            }
        } catch (e) {
            res.status(400).send(e)
        }
    }

    return res.status(400).send()

})

router.post("/users/me/avatar", auth, upload.single("avatar"), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer;
    await req.user.save()
    res.status(200).send("Avatar uploaded");
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message })
})

router.patch("/users/me", auth, async (req, res) => {

    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "age", "password", "email"];
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update));

    if (!isValidUpdate) return res.status(400).send({ "error": "Invalid Update!" })

    try {

        updates.forEach(update => req.user[update] = req.body[update]);
        const result = await req.user.save()

        res.status(200).send(result)
    } catch (e) {
        res.status(400).send(`There was an error \n ${e}`)
    }
})

router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name)
        res.status(200).send(req.user)
    } catch (e) {
        res.status(500).send(`There was an error \n ${e}`)
    }
})


router.delete("/users/me/avatar", auth, async (req, res) => {
    req.user.avatar = null;
    await req.user.save();
    res.status(200).send()
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message })
})

module.exports = router;