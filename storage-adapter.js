// TODO
var checkArgumentsNumber = function (arg, expectedNum){
  if(arg.length !== expectedNum){
    throw new Error('Passed '+arg.length+' arguments, expected '+expectedNum);
  }
}
// ==================================================================

// General Interface implementation
var Interface = function(name, methods) {
  checkArgumentsNumber(arguments, 2)
  this.name = name;
  this.methods = [];

  for(var i in methods){
    if(typeof methods[i] !== 'string'){
      throw new Error("The methods name has to be String");
    }
    this.methods.push(methods[i]);
  }
}

// Static method
Interface.ensureImplements = function (object) {
  checkArgumentsNumber(arguments, 2)
  for (var i=1; i<arguments.length; i++){
    var interface = arguments[i];

    for(var j in interface.methods){
      var method = interface.methods[j];
      if(!object[method] && typeof object[method] !== 'function'){
        throw new Error('The object not implement the '+arguments[i].methods[j]+' interface method');
      }
    }
  }
  return true
}
// ==================================================================

// Interface that has to be implemented from every *Storage class
var StorageInterface = new Interface('StorageInterface', ['exist', 'set', 'get']);

//
var LocalStorage = function () {}
LocalStorage.exist = function () {
  var test = 'test';
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch(e) {
    return false;
  }
}

/**
* arguments[0] must contain the key
* arguments[1] must contain the value
*/
LocalStorage.set = function(){
  checkArgumentsNumber(arguments, 2);
  try{
    localStorage.setItem(arguments[0], arguments[1]);
  } catch(e){}
}
/**
* arguments[0] must contain the key
*/
LocalStorage.get = function(){
  checkArgumentsNumber(arguments, 1);
  localStorage.removeItem(arguments[0]);
}

//
var CookiesStorage = function (){
  this.expires = 1;
}
CookiesStorage.exist = function (){
  if(typeof navigator !== 'undefined'){
    return navigator.cookieEnabled;
  }
  return false;
}
CookiesStorage.set = function (){
  var d = new Date(),
      expirDay = arguments[2] || this.expires;

  d.setTime(d.getTime() + (expirDay*24*60*60*1000));
  var expires = "expires="+d.toUTCString();
  try{
    document.cookie = arguments[0] + "=" + arguments[1] + "; " + expires;
  } catch(e){}

}
CookiesStorage.get = function (){
  checkArgumentsNumber(arguments, 1);
  var name = arguments[0] + "=",
      ca = document.cookie.split(';');

  for(var i=0; i<ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1);
    if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
  }
  return "";
}

//
var UrlStorage = function (){
  this.separator = '/';
}
UrlStorage.exist = function (){
  if(typeof location !== 'undefined'){
    return true;
  }
  return false;
}
UrlStorage.set = function (){
  checkArgumentsNumber(arguments, 2);
  var curHash = location.hash;
  try{
    location.hash = curHash+this.separator+arguments[0]+'='+arguments[1];
  } catch(e){}

}
UrlStorage.get = function (){
  checkArgumentsNumber(arguments, 1);
  var key = arguments[0],
      hash = location.hash;
  if (hash === ''){
    return '';
  }
  var hashes = hash.split(this.separator);
  for(var i in hashes){
    if(hashes[i].indexOf(key) !== -1){
      return hashes[i].split('=')[1];
    }
  }
  return '';
}

// Factory pattern
var StorageAdapter = function() {}
StorageAdapter.getAdapter = function(){
  var adapter = null;
  if (LocalStorage.exist()){
    console.log('local');
    Interface.ensureImplements(LocalStorage, StorageInterface);
    this.adapter = LocalStorage;
  }
  else if (CookiesStorage.exist()){
    console.log('cookie');
    Interface.ensureImplements(LocalStorage, CookiesStorage);
    this.adapter = CookiesStorage;
  }
  else if (UrlStorage.exist()){
    console.log('url');
    Interface.ensureImplements(LocalStorage, UrlStorage);
    this.adapter = UrlStorage;
  }
  else{
    throw new Error('There is no storage adapter available');
  }
  this.getAdapter = adapter; //memoization technique
  return this.adapter;
}

var adapter = StorageAdapter.getAdapter();
