var chai = require('chai');
var expect = chai.expect;
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var fhconfig = {
  "host": "http://localhost:8100",
  "appid" : "testappid",
  "appkey" : "testappkey",
  "mode": "dev"
}

var legacyAppHost = {
  domain: "testing",
  firstTime: false,
  hosts: {
    "releaseCloudUrl": "http://localhost:8102",
    "releaseCloudType": "fh",
    "debugCloudUrl": "http://localhost:8103",
    "debugCloudType": "fh"
  },
  init: {
    "trackId": "testtrackid"
  }
}

var buildFakeRes = function(data){
  return [200, {"Content-Type": "application/json"}, JSON.stringify(data)];
}

var initFakeServer = function(server){
   server.respondWith('GET', /fhconfig.js/, buildFakeRes(fhconfig));

   server.respondWith('POST', /init/, buildFakeRes(legacyAppHost));
}

describe("test legacy app props", function(){
  var server;

  beforeEach(function () { server = sinon.fakeServer.create(); });
  afterEach(function () { server.restore(); });

  describe("test auto initialisation", function(){
    it("should emit cloudready events", function(){

      var callback = sinon.spy();

      initFakeServer(server);
      var $fh = require("../../src/feedhenry");
      
      $fh.reset();

      $fh.on('cloudready', callback);

      server.respond();
      server.respond();

      expect(callback).to.have.been.called;
      expect(callback).to.have.been.calledOnce;
      expect(callback).to.have.been.calledWith({host: "http://localhost:8103"});

      var hostUrl = $fh.getCloudURL();
      expect(hostUrl).to.equal("http://localhost:8103");

    });
  });
});