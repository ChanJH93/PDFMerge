//selecting all required elements

var _this;

Dropzone.options.droparea = {
  maxFilesize: 5,
  maxFile: 100,
  uploadMultiple: true,
  acceptedFiles: ".pdf",
  autoProcessQueue: false,
  parallelUploads: 50,
  addRemoveLinks: true,

  init: function() {
    this.on("addedfile", handleFile);

    function handleFile() {
      _this = this.files; //putting files into array
      var maxFileSize = 5; //Maximum file size
      var fileLength = _this.length;
      var totalFileSize = 0; // Total uploaded file size

      _this.forEach(function(file) {

        totalFileSize += (file.size / 1048576);

        // checking for valid file extension (pdf)
        if (file.type !== "application/pdf") {
          _this.pop(file); //remove file from array
          file.previewElement.remove(); //remove file preview
          alert("Alert! File not supported. Please upload only PDF file");
          console.log(file.type);
          console.log(_this);
        }
        //checking for file size
        else if ((file.size / 1048576 > maxFileSize) || (totalFileSize > 5)) {
          _this.pop(file); //remove file from array
          file.previewElement.remove(); //remove file array
          alert("Alert! Maximum fize size is 5MB.");
          console.log(totalFileSize);
        } else {
          console.log(totalFileSize);
          console.log(_this);
        }
      });

      console.log(_this);
    }
  }
}

$("#year").html(new Date().getFullYear());

//progres bar
var i = 0;
function move() {
  if (i == 0) {
    i = 1;
    var elem = document.getElementById("myBar");
    var width = 1;
    var id = setInterval(frame, 5);

    function frame() {
      if (width >= 100) {
        clearInterval(id);
        i = 0;
      } else {
        width++;
        elem.style.width = width + "%";
      }
    }
  }
}

$('.mergeButton').click(function() {
  var myDropZone = Dropzone.forElement(".dropzone");
  myDropZone.processQueue();

  if (!_this) {
    alert("Please upload PDF file to proceed."); // Checking if file exist before merging
  }

  else {
    $('#myProgress').removeClass("hide");
    move();
    setTimeout(function(){
      $('#download').removeClass("hide");
      $('#message').removeClass("hide");
      $('#reload').removeClass("hide");
      $('#merge').addClass("hide");
    }, 1200);
  }

});

$(".reloadButton").click(function(){
  location.reload();
})
