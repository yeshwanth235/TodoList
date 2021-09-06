if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express')
const mongoose = require("mongoose");
const methodOverride = require('method-override')
const helmet = require('helmet')
const path = require('path')
const TodoTask = require("./models/TodoTask")
const dbUrl = process.env.db_connect;
//defining router
const app = express();

//set veiw engine to ejs
app.set('view engine', 'ejs')
//set views folder for ejs files
app.set('views', path.join(__dirname, 'views'))
//using public folder
app.use(express.static(path.join(__dirname, 'public')))
//for parsing data from url
app.use(express.urlencoded({extended: true}));
//for method-override
app.use(methodOverride('_method'))
//for using helmet
app.use(helmet())

//connecting to mongoose
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })


app.get('/', async (req, res) => {
    // console.log(req.body)
    const {info} = req.query;
    // console.log(req.query)
    if(info) {
        const tasks = await TodoTask.find({info})
        res.render('home', {tasks, info})
    } else {
        const tasks = await TodoTask.find({});
        res.render('home', {tasks, info})
    }
}) 

app.post('/', async (req, res) => {
    const newTask = new TodoTask(req.body);
    // console.log(newTask)
    await newTask.save();
    res.redirect('/');
})

app.get('/edit/:id', async(req, res) => {
    const {id} = req.params
    // console.log({id})
    const tasks = await TodoTask.find({});
    res.render('edit.ejs', {id, tasks})
})

app.put('/edit/:id', async (req, res) => {
    const {id} = req.params;
    const task = await TodoTask.findByIdAndUpdate(id, req.body, {runValidators: true, new: true});
    res.redirect('/')
})

app.get('/remove/:id', async (req, res) => {
    const id = req.params.id
    TodoTask.findByIdAndRemove(id, err => {
        if (err) return res.send(500, err);
        res.redirect("/");
    });
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})