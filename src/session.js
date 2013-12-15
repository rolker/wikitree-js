;(function(wt, $, undefined) {

  wt.Session = function(statusDiv){
    this.user_id = $.cookie('wikitree_wtb_UserID');
    this.user_name = $.cookie('wikitree_wtb_UserName');
    this.loggedIn = false;
    this.profiles = {};
    this.$statusDiv = $(statusDiv);
    this.checkLogin();
  };
  
  wt.Session.prototype.setLoggedIn = function(loggedIn){
    var doCallback = this.loggedIn != loggedIn;
    this.loggedIn = loggedIn;
    if(this.loggedIn && !this.rootProfile){
      this.rootProfile = new wt.Person(this.user_id);
    }
    if(!this.loggedIn){
      self.profiles = {};
      self.rootProfile = null;
    }
    this.updateStatus();
    if(doCallback){
      if(this.loggedIn && this.loginCallback)
        this.loginCallback();
      if(!this.loggedIn && this.logoutCallback)
        this.logoutCallback();
    }
  };

  wt.Session.prototype.setStatusDiv = function(statusDiv){
    this.$statusDiv = $(statusDiv);
    this.updateStatus();
  };
  
  wt.Session.prototype.updateStatus = function(){
    if(this.$statusDiv){
      var self = this;
      if(this.loggedIn){
        this.$statusDiv.html("Welcome "+this.user_name+" ");
        var $logout = $('<input type=button value="Logout"/>').click(function(){self.logout();});
        this.$statusDiv.append($logout);
      } else {
        this.$statusDiv.html("Welcome ");
        var $login = $('<input type=button value="Login"/>').click(function(){self.loginPrompt();});
        this.$statusDiv.append($login);
      }
    }
  };

  wt.Session.prototype.onLogout = function(callback){
    this.logoutCallback = callback;
  };

  wt.Session.prototype.onLogin = function(callback){
    this.loginCallback = callback;
    if(this.loggedIn && this.loginCallback)
      this.loginCallback();
  };
  
  wt.Session.prototype.logout = function(callback){
    var self = this;
    $.post('/wiki/Special:Userlogout').done(function(data) {
      self.setLoggedIn(false);
      if(callback !== undefined)
        callback();
    });
  };
  
  wt.Session.prototype.checkLogin = function(callback){
    if (this.user_id && this.user_name) { 
      var self = this;
      $.post('/api.php',
        { 'action': 'login', 'user_id': this.user_id }
      ).done(function(data) {
        if (data.login.result == self.user_id) {
          self.setLoggedIn(true);
          if(callback !== undefined)
            callback(true);
        } else {
          self.setLoggedIn(false);
          if(callback !== undefined)
            callback(false);
        }
      });
    } else {
      if(callback !== undefined)
        callback(false);
    }
  };
  
  wt.Session.prototype.loginPrompt = function(callback){
    var self = this;
    $form = $('<form id="login">');
    var $email = $('<input type=text id="wpEmail" name="wpEmail">');
    $form.append($('<p>E-mail Address: </p>').append($email));
    var $password = $('<input type=password id="wpPassword2" name="wpPassword2">');
    $form.append($('<p>Password: </p>').append($password));
    var $loginButton = $('<input type=button id="wtLoginButton" value="Login"/>').click(function(){
      var wpEmail = $email.val();
      var wpPassword2 = $password.val();
      $.post('/api.php', 
        { 'action': 'login', 'email': wpEmail, 'password': wpPassword2 }
      ).done(function(data) { 
        if (data.login.result == 'Success') { 
          self.user_id = data.login.userid;
          self.user_name = data.login.username;
          self.loggedIn = true;
          self.updateStatus();
          if(self.loginCallback)
            self.loginCallback();
        } else { 
          alert("Login failed. Please try again.");
        }
        $('div').remove('.wt-login');
        if(callback !== undefined)
          callback();
      });
    });
    $form.append($loginButton);
    $prompt = $('<div class="wt-login">');
    $prompt.append($form);
    $('body').append($prompt);
  };
  
  wt.getRootPerson = function(){
    return wt.session.rootProfile;
  };
  
  wt.getPerson = function(user_id){
    if(wt.session.profiles[user_id] === undefined){
      wt.session.profiles[user_id] = new wt.Person(user_id);
    }
    return wt.session.profiles[user_id];
  };
  
  wt.onLogin = function(loginCallback){
    wt.session.onLogin(loginCallback);
  };

  wt.onLogout = function(logoutCallback){
    wt.session.onLogout(logoutCallback);
  };

  wt.init = function(statusDiv){
    wt.session = new wt.Session(statusDiv);
  };
  
})(window.wt = window.wt || {}, jQuery);
