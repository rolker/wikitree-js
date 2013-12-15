;(function(wt, $, undefined) {
  wt.Ahnentafel = function(aNum){
    this.aNum = aNum;
    if(aNum === undefined){
      this.aNum = 1;
    }
  };

  wt.Ahnentafel.prototype.getGen = function(){
    return Math.floor(Math.log(this.aNum)/Math.LN2);
  };

  wt.Ahnentafel.prototype.genSize = function(){
    return Math.pow(2,this.getGen());
  };

  wt.Ahnentafel.prototype.genPosition = function(){
    return this.aNum-this.genSize();
  };

  wt.Ahnentafel.prototype.getChild = function(){
    return  new wt.Ahnentafel(Math.floor(this.aNum/2));
  };

  wt.Ahnentafel.prototype.getFather = function(){
    return  new wt.Ahnentafel(this.aNum*2);
  };

  wt.Ahnentafel.prototype.getMother = function(){
    return  new wt.Ahnentafel(this.aNum*2+1);
  };

  wt.Ahnentafel.prototype.getPath =  function(target){
    if(!this.equals(target)){
      var gen = this.getGen();
      var targetGen = target.getGen();
      var ret;
      if(targetGen>gen){
        ret = this.getPath(target.getChild());
        ret.push(target);
        return ret;
      }
      ret = target.getPath(this.getChild());
      ret.unshift(this);
      return ret;
    }
    return [];
  };

  wt.Ahnentafel.prototype.valid = function(){
    return  this.aNum>0;
  };

  wt.Ahnentafel.prototype.equals = function(other){
    return this.valid() && other.valid() && this.aNum == other.aNum;
  };

  wt.Ahnentafel.prototype.getAncestors = function(gens){
    ret = [];
    if (gens > 1)
      ret = this.getFather().getAncestors(gens-1).concat(this.getMother().getAncestors(gens-1));
    if (gens > 0){
      ret.push(this.getFather());
      ret.push(this.getMother());
    }
    return ret;
  };

})(window.wt = window.wt || {}, jQuery);
