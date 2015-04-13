'use strict';

/* global Promise, KeyboardEvent, LayoutNormalizer */

(function(exports) {

// Keyboard layouts register themselves in this object, for now.
var Keyboards = {};

Keyboards.defaultLayout = {
  pages: [
    { /* The 0th page of the defaultLayout should never be used */ }
  ]
};

Keyboards.numberLayout = {
  width: 3,
  keyClassName: 'big-key special-key',
  keys: [
    [ { value: '1'}, { value: '2'}, { value: '3'} ],
    [ { value: '4'}, { value: '5'}, { value: '6'} ],
    [ { value: '7'}, { value: '8'}, { value: '9'} ],
    [ { value: '.', longPressValue: ',' },
      { value: '0', longPressValue: '-' },
      { value: '⌫', keyCode: KeyboardEvent.DOM_VK_BACK_SPACE } ]
  ]
};

Keyboards.pinLayout = {
  width: 3,
  keyClassName: 'big-key special-key bottom-symbol',
  keys: [
    [ { value: '1'}, { value: '2'}, { value: '3'} ],
    [ { value: '4'}, { value: '5'}, { value: '6'} ],
    [ { value: '7'}, { value: '8'}, { value: '9'} ],
    [ { value: ''}, { value: '0'},
      { value: '⌫', keyCode: KeyboardEvent.DOM_VK_BACK_SPACE } ]
  ]
};

Keyboards.telLayout = {
  width: 3,
  keyClassName: 'big-key special-key bottom-symbol',
  keys: [
      [
        { value: '1', longPressValue: '('},
        { value: '2', longPressValue: ')'},
        { value: '3', longPressValue: '/'}
      ],
      [
        { value: '4', longPressValue: '-'},
        { value: '5', longPressValue: '_'},
        { value: '6', longPressValue: ','}
      ],
      [
        { value: '7', longPressValue: ':'},
        { value: '8', longPressValue: '.'},
        { value: '9', longPressValue: ';'}],
      [
        { value: '*', longPressValue: '#'},
        { value: '0', longPressValue: '+'},
        { value: '⌫', keyCode: KeyboardEvent.DOM_VK_BACK_SPACE }
      ]
  ]
};

var LayoutLoader = function(app) {
  this.app = app;
};

LayoutLoader.prototype.SOURCE_DIR = './js/layouts/';

LayoutLoader.prototype.start = function() {
  this._initializedLayouts = {};
  this._layoutsPromises = {};
  this.initLayouts();
};

LayoutLoader.prototype.initLayouts = function() {
  // Reset the exposed Keyboards object and collect all layouts
  // in the original one.
  var Keyboards = exports.Keyboards;
  exports.Keyboards = {};
  var layoutName;
  for (layoutName in Keyboards) {
    if (this._initializedLayouts[layoutName]) {
      console.warn('LayoutLoader: ' + layoutName + ' is overwritten.');
    }

    var layoutNormalizer = new LayoutNormalizer(Keyboards[layoutName]);
    layoutNormalizer.normalize();
    this._initializedLayouts[layoutName] = layoutNormalizer.normalizedLayout;

    // Create a promise so that these panels can be loaded async
    // even if they are not loaded with file of their name.
    if (!this._layoutsPromises[layoutName]) {
      this._layoutsPromises[layoutName] =
        Promise.resolve(this._initializedLayouts[layoutName]);
    }
  }
};

LayoutLoader.prototype.getLayout = function(layoutName) {
  return this._initializedLayouts[layoutName];
};

// This method returns a promise and resolves when the IMEngine script
// is loaded.
LayoutLoader.prototype.getLayoutAsync = function(layoutName) {
  if (this._layoutsPromises[layoutName]) {
    return this._layoutsPromises[layoutName];
  }

  var p = new Promise(function(resolve, reject) {
    var script = document.createElement('script');
    script.onload = function() {
      this.initLayouts();
      resolve(this._initializedLayouts[layoutName]);
    }.bind(this);
    script.onerror = function() {
      this._layoutsPromises[layoutName] = null;
      console.error('LayoutLoader: unable to load ' + layoutName + '.');
      reject();
    }.bind(this);
    script.src = this.SOURCE_DIR + layoutName + '.js';
    document.body.appendChild(script);
  }.bind(this));

  this._layoutsPromises[layoutName] = p;
  return p;
};

// Expose Keyboards object
exports.Keyboards = Keyboards;

exports.LayoutLoader = LayoutLoader;

})(window);
