;(function(wt, $, undefined) {

  wt.Person = function(user_id){
    this.user_id = user_id;
    this.loaded = false;
    this.loadCallbacks = [];
  };

  wt.Person.prototype.load = function(callback){
    if(!this.loaded){
      if(callback !== undefined)
        this.loadCallbacks.push(callback);
      if(!this.loading){
        this.loading = true;
        var self = this;
        $.post('/api.php', 
          { 'action': 'getPerson', 'key': this.user_id, 'fields': 'Name,FirstName,LastNameCurrent,Gender,Father,Mother', 'format': 'json' }
        ).done(function(data) { 
          if (data[0].status) { 
            console.log("There was an error getting the person:",data);
            self.loading = false;
            for(var i = 0; i < self.loadCallbacks.length; i++){
                self.loadCallbacks[i].call(self);
            }
            self.loadCallbacks = [];
          } else {
            for(var attrib in data[0].person)
              self[attrib] = data[0].person[attrib];
            if (self.Father !== undefined){
              self.Father = wt.getPerson(self.Father);
            }
            if (self.Mother !== undefined){
              self.Mother = wt.getPerson(self.Mother);
            }
  
            $.post('/api.php', {
              'action': 'getPerson', 'key': self.user_id, 'fields': 'Id,Siblings,Spouses,Children', 'format': 'json' 
              }).done(function(data) { 
                for(var attrib in data[0].person)
                  self[attrib] = data[0].person[attrib];
                self.loading = false;
                self.loaded = true;
                for(var i = 0; i < self.loadCallbacks.length; i++){
                    self.loadCallbacks[i].call(self);
                }
                self.loadCallbacks = [];
              });
  
          }
        });
      }

    } else if(callback !== undefined)
      callback(this);
  };
  
})(window.wt = window.wt || {}, jQuery);
