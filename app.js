const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const pdfMerge = require("pdf-merger-js");
const multer = require("multer");
const {GridFsStorage} = require('multer-gridfs-storage');
const mongoose = require("mongoose");
const fs = require("fs");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname+"/public"));

//setting up MongoDB database
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
const connection = mongoose.connect("mongodb://localhost:27017/pdfDB");
const conn = mongoose.connection;
conn.option={};

//setting up Multer Storage
const storage = new GridFsStorage({
  db: connection,
  file: (req,file) => {
    return new Promise(resolve => {
    const fileInfo = {
      filename: file.originalname,
      bucketName: "file_uploads",
      chunkSize: 6000000
    };
    resolve(fileInfo);
  });
  }
});
const upload = multer({storage});
var uploadID; // define ID of uploaded file as global variable

app.get("/", function(req, res) {
  res.render("index");
});

app.post("/", upload.any(), function(req, res) {

  const uploadedFile = req.files; //getting the uploaded files
  console.log(uploadedFile);

  const fileID = uploadedFile.map(a => a.id); //getting files ID
  // console.log(fileID);

  const fileLength = fileID.length; //getting total number of files

  let gb = new mongoose.mongo.GridFSBucket(conn.db, {bucketName:'file_uploads'});
  let merger = new pdfMerge();

  var rs;
  var ws;
  var stream;
  var bufferArray =[];

  //creating new file container in mongodb gridfs bucket
  ws = gb.openUploadStream('merged.pdf', {chunkSizeBytes:9000000, contentType:'application/pdf'});

  //Reading pdf files from database and merge the files
  for (var i=0; i<fileLength;i++){
    rs = gb.openDownloadStream(fileID[i]);
    rs.on('data', function(chunk){
      bufferArray.push(chunk);
      console.log(bufferArray);
      merger.add(chunk);
    });
  }

    rs.on('end',function(){
      var buffer = Buffer.concat(bufferArray);
      // console.log(merger);
      merger.save("");
  });

  //creating merged file readstream
  stream = merger.doc.on('read', function(err){
    if(err){
      console.log(err);
    }
  });

  // transfering merged pdf file to mongodb gridfs bucket
  stream.pipe(ws).on('error', function(){
    console.log('error');
  }).on('finish', function(){
    console.log('done');
  });

  uploadID = ws.id;
  console.log(uploadID);

  // Downloading the merged pdf file
  app.get("/download", function(req, res) {

    res.set({
           'Content-Type': 'application/pdf',
           'Content-Disposition': 'attachment; filename=merged.pdf'
       });
       console.log(uploadID);
    gb.openDownloadStream(uploadID).pipe(res);
});

});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
