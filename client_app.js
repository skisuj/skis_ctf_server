const express = require('express')
const app = express()
const port = 3000

var bodyParser = require('body-parser');
app.use(bodyParser.json())

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
var docClient = new AWS.DynamoDB.DocumentClient();

app.post('/team/create', function(req, res){
  var teamdata = req.body;

  var params = {
    TableName:"teams",
    Key: { "team_name": teamdata.team_name },
    UpdateExpression: 'SET #tm = :m, #ct = :t',
    ExpressionAttributeNames: { '#tm': "team_members", '#ct': "completed_tasks"},
    ExpressionAttributeValues: {':m': teamdata.team_members, ":t": []},
    ReturnValues:"UPDATED_NEW"
  }

  docClient.update(params, function(err, data){
    if(err) console.log(err, err.stack);
    else console.log(data);
  });
  res.end();
  ;}
);

app.get('/task/list/:category', function(req, res){

  var params = {
    TableName: "tasks",
    KeyConditionExpression: "#cat = :catname",
    ExpressionAttributeNames: { "#cat": "category" },
    ExpressionAttributeValues: { ":catname": req.params.category }
  }

  docClient.query(params, function(err, data){
      console.log(data);
      res.send(data);
      res.end();
  })
})

app.post('/task/begin', function(req, res){
  var taskdata = req.body;

  var params = {
    TableName: "tasks",
    Key: { "name": taskdata.name, "category": taskdata.category },
    UpdateExpression: 'SET #av = :a',
    ExpressionAttributeNames: { "#av": "available" },
    ExpressionAttributeValues: { ":a": false },
    ReturnValues: "UPDATED_NEW"
  }

  docClient.update(params, function(err, data) {
    if(err) console.log(err, err.stack);
    else console.log(data);
  })

  res.end();
})

app.post('/task/abort', function(req, res){
  var taskdata = req.body;

  var params = {
    TableName: "tasks",
    Key: { "name": taskdata.name, "category": taskdata.category },
    UpdateExpression: 'SET #av = :a',
    ExpressionAttributeNames: { "#av": "available" },
    ExpressionAttributeValues: { ":a": true },
    ReturnValues: "UPDATED_NEW"
  }

  docClient.update(params, function(err, data) {
    if(err) console.log(err, err.stack);
    else console.log(data);
  })

  res.end();
})

app.post('/task/finish', function(req, res){
    /*  ...   */
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
