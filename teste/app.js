var MongoClient = require('mongodb').MongoClient
var assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/myproject';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  
  // findDocuments2(db, function() {
  //   db.close();
  // });  
 insertDocuments3(db, function() {
    db.collection('documents').find({}).toArray(function(err,docs) {
      console.log(docs);
    });
   	db.close();
 });
});

var insertDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.insertMany([
    {a : 1}, {a : 2}, {a : 3}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 documents into the collection");
    callback(result);
  });
}

var findDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.log(docs)
    callback(docs);
  });
}

var findDocuments2 = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Find some documents
  collection.find({'a': 3}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.log(docs);
    console.log(docs.length); 
    callback(docs);
  });      
}


var insertDocuments2 = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');

  var novo = 30;

  // Check if the document is already registered
  collection.find({'a' : novo}).toArray(function(err, docs) {
    if(docs.length == 0) {
      //no register yet - lets add something
      console.log('no records, adding new one.. ' + novo);

      collection.insertMany([{'a' : novo}], function(err, result) {
        console.log('added new: ' + novo);  
        callback(result);
      });
    }
    else {
      //already registered
      console.log('document already registered, records found: ' + docs.length);
      callback();
    }
  });
}

var insertDocuments3 = function(db, callback) {
  var collection = db.collection('documents');

  var selector = {};
  //var new_records = {$set: {'a': 10}};
  var new_records = {$set: {'a': 15}};
  //var new_records = {$set: {'a':8, 'b':8}};

  collection.updateOne(selector, new_records, {upsert: true}, function(err, res, raw) {
    //if(err) throw err;
    console.log('res: ' + res);
    console.log('err: ' + err);
    console.log('raw: ' + raw);
    callback(res); 
  });


}
  // // Insert some documents
  // collection.insertMany([
  //   {a : 1}, {a : 2}, {a : 3}
  // ], function(err, result) {
  //   assert.equal(err, null);
  //   assert.equal(3, result.result.n);
  //   assert.equal(3, result.ops.length);
  //   console.log("Inserted 3 documents into the collection");
  //   callback(result);
  // });
// }