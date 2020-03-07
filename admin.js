const express = require('express')
const app = express()
const port = 3000

var bodyParser = require('body-parser');
app.use(bodyParser.json())

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
var docClient = new AWS.DynamoDB.DocumentClient();

//----------------------------  tasks

//add new task or update existing one (cannot change name or category - create a new task and delete the old one)
app.post('/task/add', function(req, res){
  var taskdata = req.body;

  var newtask = {
    TableName: "tasks",
    Key: { "name": taskdata.name, "category": taskdata.category },
    UpdateExpression: 'SET #desc = :d, #av = :a, #pt = :p',
    ExpressionAttributeNames: { '#desc':"description", '#av':"available", '#pt':"points"},
    ExpressionAttributeValues: { ':d': taskdata.description, ':a': taskdata.available, ':p': taskdata.points,},
    ReturnValues:"UPDATED_NEW"
  }

  docClient.update(newtask, function(err, data){
    if(err) console.log(err, err.stack);
    else console.log(data);
    res.end();
  });
});

app.post('/task/remove', function(req, res){
  var taskdata = req.body;

  var params = {
    TableName: "tasks",
    Key: { "name": taskdata.name, "category": taskdata.category },
  }


  docClient.delete(params, function(err, data) {
    if(err) console.log(err, err.stack);
    else console.log(data);
    res.end();
  })
});
//----------------------------  panel

app.get('/panel/unlock', function(req, res){

});

app.get('/panel/lock', function(req, res){

});

app.get('/panel', function(req, res){

});

//----------------------------  teams

app.get('/team/list', function(req, res){
  var params = {
    TableName: "teams"
  }

  docClient.scan(params, function(err, data){
    console.log(data);
    res.send(data);
    res.end();
  })
});

//update existing team (or add a new one)
app.post('/team/update', function(req, res){
  var teamdata = req.body;

  var params = {
    TableName:"teams",
    Key: { "team_name": teamdata.team_name },
    UpdateExpression: 'SET #tm = :m, #ct = :t',
    ExpressionAttributeNames: { '#tm': "team_members", '#ct': "completed_tasks"},
    ExpressionAttributeValues: {':m': teamdata.team_members, ":t": teamdata.completed_tasks},
    ReturnValues:"UPDATED_NEW"
  }

  docClient.update(params, function(err, data){
    if(err) console.log(err, err.stack);
    else console.log(data);
  });
  res.end();
  ;}
);

app.post('/admin/delete_team', function(req, res){
  var teamdata = req.body;

  var params = {
    TableName: "teams",
    Key: { "team_name": teamdata.name },
  }

  docClient.delete(params, function(err, data) {
    if(err) console.log(err, err.stack);
    else console.log(data);
    res.end();
  })
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`))
