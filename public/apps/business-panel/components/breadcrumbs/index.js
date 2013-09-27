/**
 * Sidebar
 */

if (typeof module === 'object' && typeof define !== 'function') {
  var define = function(factory) {
    module.exports = factory(require, exports, module);
  };
}

define(function(require, exports, module){
  return {
    exports: 'BreadCrumbs'
  , Main: require('./breadcrumbs-view')
  };
});