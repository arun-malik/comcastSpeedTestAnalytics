var speedTest = require('speedtest-net');
var azure = require('azure-storage');
var uuid = require('node-uuid');
var nconf = require('nconf'); 
var Task = require('./models/task');
var cron = require('cron');

nconf.env()
     .file({ file: 'config.json', search: true });
var tableName = nconf.get("TABLE_NAME");
var partitionKey = nconf.get("PARTITION_KEY");
var accountName = nconf.get("STORAGE_NAME");
var accountKey = nconf.get("STORAGE_KEY");
var machineName = nconf.get("MACHINE_NAME");

speedTestFunction();


var cronJob = cron.job("0 */15 * * * *", function(){
    
	speedTestFunction();
  
});


function speedTestFunction(){
	 
    console.info('****************************************Speed Test Started*************************************');
    console.info('Speed Test Date Time: '+ new Date());
      
            var task = new Task(azure.createTableService(accountName, accountKey), tableName, partitionKey);
 
            var speedTestProgress = speedTest({maxTime: 109990});

            speedTestProgress.on('data', function(data) {
                    
                        console.log('The speed test has completed successfully. \n'); 
                        console.log('Saving results to Azure');
                        
                        task.addItem(data, machineName, function itemAdded(error) { 
                        if(error) {
                        console.log(error);
			console.info('Speed Test End Date Time: '+ new Date());
                        console.info('****************************************Speed Test Ended*************************************');
                        }
                        console.log('Saved to Azure successfully');
			console.info('Speed Test End Date Time: '+ new Date());
                        console.info('****************************************Speed Test Ended*************************************');
                        });
            });
                    

            speedTestProgress.on('error', function(err) {
                console.log('Speed test error: ');
                console.error(err);
            });

            speedTestProgress.on('downloadspeedprogress', function(speed) {
            console.log('Download speed (in progress):', (speed).toFixed(2), 'Mb/s \n');
            });


            speedTestProgress.on('uploadspeedprogress', function(speed) {
            console.log('Upload speed (in progress):', (speed).toFixed(2), 'Mb/s \n');
            });

}

cronJob.start();