requirejs.config({
  baseUrl: '/apps/business-panel',
  hbs: {
    disableI18n: true,
    disableHelpers: true,
    templateExtension: 'handlebars'
  },
  paths: {
    backbone: '../../components/backbone/backbone',
    domready: '../../components/domready/ready',
    requirejs: '../../components/requirejs/require',
    jquery: '../../components/jquery/jquery',
    underscore: '../../components/underscore/underscore',
    highcharts: '../../components/highcharts/highcharts',
    hbs: '../../components/hbs/hbs',
    routemanager: '../../components/routemanager/backbone.routemanager',
    bootstrap: '../../components/bootstrap/dist/js/bootstrap',
    layoutmanager: '../../components/layoutmanager/backbone.layoutmanager',
    utils: './lib/utils',
    handlebars: '../../components/handlebars/handlebars',
    'handlebars.runtime': '../../components/handlebars/handlebars.runtime',
    json2: '../../components/json2/json2',
    i18nprecompile: '../../components/hbs/hbs/i18nprecompile'
  },
  packages: [
    {
      name: 'app',
      location: '/apps/business-panel',
      main: 'app.js'
    },
    {
      name: 'config',
      location: '/apps/business-panel',
      main: 'config.js'
    },
    {
      name: 'components',
      location: 'components',
      main: 'index.js'
    },
    {
      name: 'pages',
      location: 'pages',
      main: 'index.js'
    },
    {
      name: 'models',
      location: 'models',
      main: 'index.js'
    },
    {
      name: 'collections',
      location: 'collections',
      main: 'index.js'
    },
    {
      name: 'backbone.present',
      location: '../../components/backbone.present',
      main: 'backbone.present.js'
    }
  ],
  shim: {
    backbone: {
      deps: [
        'jquery',
        'underscore'
      ],
      exports: 'Backbone'
    },
    underscore: {
      exports: '_'
    },
    dust: {
      exports: 'dust'
    },
    highcharts: {
      exports: 'highcharts',
      deps: [
        'jquery'
      ]
    },
    handlebars: {
      exports: 'Handlebars'
    },
    json2: {
      exports: 'JSON'
    }
  }
});