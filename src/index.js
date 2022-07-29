require("./db/mongoose");
const express = require("express");
const app = express();
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
const PORT = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);


app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`)
})
