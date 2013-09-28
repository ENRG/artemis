define(function(require){
  var domready  = require('domready');
  var Backbone  = require('backbone');
  var Present   = require('backbone.present');
  var _         = require('underscore') || window._;

  var utils     = {};

  _.extend( utils, _ );

  utils.domready = domready;

  utils.Backbone    = Backbone;
  utils.Model       = Backbone.Model;
  utils.Collection  = Backbone.Collection;
  utils.Router      = Backbone.Router;
  utils.Events      = Backbone.Events;

  // Use regions and swapper by default
  utils.View = Backbone.View.extend( _.extend({
    initialize: function( options ){
      if ( typeof options !== 'object' ) return this;

      if ( options.regions ) this.regions = options.regions;
      if ( options.children ) this.children = options.children;

      return this;
    }

  , render: function(){
      if ( this.template ){
        this.$el.html(
          this.template( this.model ? (
            this.model.toJSON ? this.model.toJSON() : this.model
          ) : null )
        );
      }

      // Reset children
      if ( this.children ) this.appended = [];

      // Apply regions by default
      if ( this.regions ) this.applyRegions();

      return this;
    }
  }
  , _.clone( Present.regions )
  , _.clone( Present.swapper )
  ));

  return utils;
});