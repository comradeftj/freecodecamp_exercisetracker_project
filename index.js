const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { userData, exerciseData } = require('./data.js')

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const charactersToChoose = 'abcdefghijklmnopqrstuvwxyz1234567890';
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  let specialId = '';
  for (let i = 0; i < 27; i += 1) {
    specialId += charactersToChoose[Math.round(Math.random() * (charactersToChoose.length - 1))];
  }
  userData.push({
    username: username, 
    _id: specialId
  })
  res.json({ username: username, _id: specialId })
});

app.get('/api/users', (req, res) => {
  res.json(userData);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const _id = req.params._id;
  let { description, duration, date } = req.body;
  duration = Number(duration);
  date = date === '' ? new Date().toDateString() : new Date(date).toDateString();

  if (date === 'Invalid Date') {
    date = new Date().toDateString()
  }

  const user = userData.filter((user) => user._id === _id)[0];
  if (user === undefined) {
    res.json({ error: 'create user first!' });
  } else {
    exerciseData.push({
      username: user.username, 
      description: description, 
      duration: duration, 
      date: date, 
      _id: user._id,
    })
    res.json({ username: user.username, description: description, duration: duration, date: date, _id: user._id })
  }
});

app.get('/api/users/:_id/logs', (req, res) => {
  let { from, to, limit } = req.query;
  //from=2025-06-23&&to=2025-06-23&&limit=2
  console.log(from + ' ' + to + ' ' + limit)
  const _id = req.params._id;
  const userInfo = userData.filter((user) => user._id === _id)[0];
  let exerciseInfo = exerciseData.filter((exercise) => exercise._id === _id);

  if (from !== undefined) {
    from = new Date(from).toDateString();
    exerciseInfo = exerciseInfo.filter((exercise) => exercise.date >= from);
  } 
  if (to !== undefined) {
    to = new Date(to).toDateString();
    exerciseInfo = exerciseInfo.filter((exercise) => exercise.date <= to);
  } 
  if (limit !== undefined) {
    limit = Number(limit);
    exerciseInfo = exerciseInfo.slice(0, limit);
  } 
  
  const exerciseInfoAgg = exerciseInfo.map((exercise) => {return {
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
  }});

  res.json({
    username: userInfo.username,
    count: exerciseInfoAgg.length,
    _id: userInfo._id,
    log: exerciseInfoAgg,
  })
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
