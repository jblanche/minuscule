var HID = require('HID');
var _ = require('underscore');

var devices = HID.devices();  //new HID.devices(7592, 4865);
var mirrors = _.filter(devices, function (device) {
    return device.product === 'Mirror';
});
console.log(mirrors.length+" mirrors found");
var hids = [];

var Sound = require('simple-mplayer');

var musics = {
    '208226383314178': new Sound('0.wav'),
    '2082263831945130': new Sound('1.wav'),
    '2082263831945': new Sound('1.wav'),
    '208224193922154217': new Sound('2.wav'),
    '2082263822142950': new Sound('3.wav')
};

if (!mirrors.length) {
  console.log("No mir:ror found");
  console.log(HID.devices());
} else {
  _.each(mirrors, function (mirror) {
    var hid_mirror = new HID.HID(mirror.path);
    hid_mirror.write([03,01]); //Disable sounds and lights
    listen(hid_mirror);
    //hids.push(hid_mirror);
  });

};

function listen (hid) {
    hid.read(function(error, data){
        console.log('reading');
        onRead(hid, error, data);
    });
    // A tester syntaxe plus clean avec partial application
    // hid.read(_.bind(onRead, null, hid));
    // ou
    // hid.read(_.bind(onRead, hid)); // et utiliser this au lieu de hid dans la méthode onRead
}

function onRead(hid, error, data) {
  var size;
  var id;
  var dataType;
  var color;

  //get 64 bytes
  if (data[0] != 0) {

    //console.log("\n" + data.map(function (v) {return ('00' + v.toString(16)).slice(-2)}).join(','));

    switch (data[0]) {
    case 1:
      //Orientation change
      switch (data[1]) {
      case 4:
        //socket.emit('mir:ror-up');
        console.log("-> mir:ror up");
        break;
      case 5:
        //socket.emit('mir:ror-down');
        console.log("-> mir:ror down");
        break;
      }
      break;
    case 2:
      //RFID
      size = data[4];
      dataType = data[1];
      id = (data.splice(0)).splice(5, size);
      console.log(id.join(''));

      switch (dataType) {
      case 1:
        console.log("-> RFID in", id.join(''));
        console.log(musics, id.join(''));
        musics[id.join('')].play({loop: 0});
        break;
      case 2:
        console.log("-> RFID out", color);
        musics[id.join('')].stop();
        break;
      }

      break;
    }
  }

  hid.read(function(error, data){
      onRead(hid, error, data);
  });

}
/*
music.play({loop: 0}); // send "-loop 0" to MPlayer to loop the soundtrack forever

setTimeout(function () {
    music.pause(); // pause the music after one seconds
}, 1000);

setTimeout(function () {
    music.resume(); // and resume it two seconds after pausing
}, 3000);

setTimeout(function () {
    music.stop(); // and stop definitely seven seconds after resuming
}, 10000);
*/
