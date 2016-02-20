var express = require('express');
var router = express.Router();
var azure = require('azure-storage'); 
var Task = require('./../models/tasks');
var nconf = require('nconf');


nconf.env()
     .file({ file: 'config.json', search: true });
var tableName = nconf.get("TABLE_NAME");
var partitionKey = nconf.get("PARTITION_KEY");
var accountName = nconf.get("STORAGE_NAME");
var accountKey = nconf.get("STORAGE_KEY");
var machineName = nconf.get("MACHINE_NAME");


/* GET home page. */
router.get('/', function(req, res, next) {
     
    var todaysDate = new Date();
    var yesterdaysDate = new Date(); 
    todaysDate.setDate(todaysDate.getDate()  + 1); 
    yesterdaysDate.setHours(0, 0, 0, 0);
    todaysDate.setHours(0, 0, 0, 0);
    
    var queryParams = req.query;
     
     if(typeof queryParams !== 'undefined'  &&  Object.keys(queryParams).length > 0 && queryParams ){
         
         yesterdaysDate= new Date(queryParams.historyStartDate);
        // yesterdaysDate.setDate(yesterdaysDate.getDate()+1);
       //  yesterdaysDate.setHours(0, 0, 0, 0);
         todaysDate= new Date(queryParams.historyEndDate);
        // todaysDate.setDate(yesterdaysDate.getDate()+1);
        // todaysDate.setHours(0, 0, 0, 0);
     } 
     
     console.log('startDate: '+ yesterdaysDate);
     console.log('endDate: '+ todaysDate);
     
     var tasks = new Task(azure.createTableService(accountName, accountKey), tableName, partitionKey);
     var query = new azure.TableQuery().where('PartitionKey eq ? and dateTime > ?  and dateTime <= ?', 'comcast',yesterdaysDate, todaysDate);
    //var tasksObject = req.app.get('tasks');
     tasks.find(query, function(error, results) { 
     // console.log(results);
     
        var charts = results.slice();
        
         charts.sort(function(a,b){ 
            return a.dateTime._ - b.dateTime._;
        });
     
        results.sort(function(a,b){ 
            return b.dateTime._ - a.dateTime._;
        });
        yesterdaysDate.setDate(yesterdaysDate.getDate()+1);
        todaysDate.setDate(yesterdaysDate.getDate()+1);
        
       res.render('index', { tabular: results , charts : charts, historyEndDate : todaysDate ,historyStartDate: yesterdaysDate });
    });
 
});

module.exports = router;
