var map = new Map();

function mapReq(req){
  var output = req.toLowerCase();
  if(output.lastIndexOf('.js') === output.length-3){
    output = output.substring(0, output.length-3);
  }
  return output;
}

function definer(req){
  return raw(req).exports;
}

function raw(req){
  var mapped = mapReq(req);
  if(map.has(mapped)){
    return map.get(mapped);
  }
  throw new Error('Module "' + req + '" has not been registered');
};

function define(req, mod){
  var mapped = mapReq(req);
  mod.name = mapped;
  map.set(mapped, mod);
};

function defineRaw(req, exports){
  define(req, { exports: exports });
};

definer.raw = raw;
definer.define = define;
definer.define.raw = defineRaw;

window.definer = definer;

module.exports = definer;