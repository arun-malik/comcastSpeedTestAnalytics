var azure = require('azure-storage');
var uuid = require('node-uuid');
var entityGen = azure.TableUtilities.entityGenerator;


module.exports = Task;

function Task(storageClient, tableName, partitionKey) {
  this.storageClient = storageClient;
  this.tableName = tableName;
  this.partitionKey = partitionKey; 
  this.storageClient.createTableIfNotExists(tableName, function tableCreated(error) {
    if(error) {
      throw error;
    }
  });
};


Task.prototype = {
  find: function(query, callback) {
    self = this;
    self.storageClient.queryEntities(this.tableName, query, null, function entitiesQueried(error, result) {
      if(error) {
        callback(error);
      } else {
        callback(null, result.entries);
      }
    });
  },

  addItem: function(item,machineName, callback) {
    self = this; 
    // use entityGenerator to set types
    // NOTE: RowKey must be a string type, even though
    // it contains a GUID in this example.
    var itemDescriptor = {
      PartitionKey: entityGen.String(self.partitionKey),
      RowKey: entityGen.String(uuid()),
      downloadSpeed : entityGen.Double(item.speeds.download),
      uploadSpeed : entityGen.Double(item.speeds.upload),
      originalDownload :  entityGen.Double(item.speeds.originalDownload),
      originalUpload :  entityGen.Double(item.speeds.originalUpload),
      server : entityGen.String(item.server.host),
      lat : entityGen.Double(item.server.lat),
      lon:entityGen.Double(item.server.lon),
      location : entityGen.String(item.server.location),
      country : entityGen.String(item.server.country),
      cc : entityGen.String(item.server.cc),
      sponsor : entityGen.String(item.server.sponsor),
      ping : entityGen.Double(item.server.ping),
      id : entityGen.Int32(item.server.id),
      dateTime : entityGen.DateTime(new Date()),
      machineName : entityGen.String(machineName),
    };
    self.storageClient.insertEntity(self.tableName, itemDescriptor, function entityInserted(error) {
      if(error){  
        callback(error);
      }
      callback(null);
    });
  },
// 
//   updateItem: function(rKey, callback) {
//     self = this;
//     self.storageClient.retrieveEntity(self.tableName, self.partitionKey, rKey, function entityQueried(error, entity) {
//       if(error) {
//         callback(error);
//       }
//       entity.completed._ = true;
//       self.storageClient.updateEntity(self.tableName, entity, function entityUpdated(error) {
//         if(error) {
//           callback(error);
//         }
//         callback(null);
//       });
//     });
//   }
}