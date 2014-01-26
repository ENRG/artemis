var net     = require('net');
var Stream  = require('stream');

var Nmt = function(options){
  var defaults = {
    port:     10001
  , password: 'bk4441'
  };

  if (!options.address) throw new Error('Missing argument `address`');

  for (var key in defaults) !(key in options) && (options[key] = defaults[key]);

  // NMT Settings
  this.address  = options.address;
  this.port     = options.port;
  this.password = options.password

  // Make stream readable and writable
  this.readable = true;
  this.writable = true;

  this.isConnected = false;
  this.buffer = "";

  this.state = {
    idle:         false
  , realTime:     false
  , connecting:   false
  , connected:    false
  , loggedIn:     false
  , loggingIn:    false
  };

  return this;
};

Nmt.prototype = new Stream();

Nmt.prototype.connect = function(callback){
  if (this.state.connecting || this.state.connected){
    var error = new Error('Connect called twice');
    if (callback) return callback(error);
    throw error;
  }

  this.state.connecting = true;

  var this_ = this;

  // Could pipe client, except on data we need to parse
  this.client = net.createConnection(this.port, this.address, function(){
    this_.state.connecting = false;
    this_.state.connected = true;

    this_.emit('connect');

    this_.login(callback);
  });

  var oldWrite = this.client.write;
  this.client.write = function(){
    console.log("Writing: ", arguments);
    oldWrite.apply(this_.client, arguments);
  }

  this.client.on('data', function(data){
    this_.parseData(data);
  });

  this.client.on('close', function(){
    this_.emit('close');
  });

  this.client.on('error', function(error){
    this_.emit('error', error);
  });

  this.client.on('timeout', function(){
    this_.emit('timeout');
  });

  this.client.on('end', function(){
    console.log("END!!");
    this_.buffer = "";
    this_.emit('end')
  });

  this.client.on('drain', function(data){
    console.log("DRAIN!!", data);
    this_.emit('drain', data);
  });

  return this;
};

Nmt.prototype.enterRealTime = function(){
  var this_ = this;

  if (this.state.pendingRealTime) return this;

  this.state.pendingRealTime = true;

  this.cancel();

  // Wait until the buffer is dry
  // this.client.once('drain', function(){
    this_.client.write("level repe\n");

    this_.client.once('data', function(data){
      this_.state.pendingRealTime = false;

      if (data.toString().indexOf('Err') > -1)
        return this_.emit('error', data);

      this_.state.realTime = true;
      this_.emit('entered-real-time');
    });
  // });

  return this;
};

Nmt.prototype.login = function(callback){
  this.client.write(this.password + "\n");
  this.client.once('data', function(data){
    // Have to do it inside so it doesn't pass data param
    if (callback) callback();
  });
  return this;
};

Nmt.prototype.cancel = function(){
  this.client.write("\x03\n");
  return this;
};

Nmt.prototype.parseData = function(data){
  this.buffer += data.toString();

  // At least 2 new lines in the buffer
  while (this.buffer.indexOf('\n') != this.buffer.lastIndexOf('\n')){
    // Slice off first new line
    this.buffer = this.buffer.substring( this.buffer.indexOf('\n') + 1 );
    // Parse out leq from chunk
    var leq = this.buffer.substring( 0, this.buffer.indexOf('\n') );

    leq = parseFloat( leq.split(',')[1] );

    // Remove oldness from buffer
    this.buffer = this.buffer.substring( this.buffer.indexOf('\n') );

    // Leq is number and !NaN
    if (+leq > 0){
      this.emit('data', leq.toString());
      this.emit('real-time', leq);
    }
  }

  return this;
};

Nmt.prototype.write = function(data){
  this.client.write(data);
  return this;
};

Nmt.prototype.end = function(data){
  this.client.end(data);
  this.writable = false;
  return this;
};

Nmt.prototype.destroy = function(){
  this.client.destroy();
  this.writable = false;
  return this;
}

module.exports = Nmt;