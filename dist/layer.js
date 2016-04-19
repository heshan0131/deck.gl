'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint-disable guard-for-in */


var _attributeManager = require('./attribute-manager');

var _attributeManager2 = _interopRequireDefault(_attributeManager);

var _flatWorld = require('./flat-world');

var _flatWorld2 = _interopRequireDefault(_flatWorld);

var _util = require('./util');

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _viewportMercatorProject = require('viewport-mercator-project');

var _viewportMercatorProject2 = _interopRequireDefault(_viewportMercatorProject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @param {string} props.id - layer name
 * @param {array}  props.data - array of data instances
 * @param {number} props.width - viewport width, synced with MapboxGL
 * @param {number} props.height - viewport width, synced with MapboxGL
 * @param {bool} props.isPickable - whether layer response to mouse event
 * @param {bool} props.opacity - opacity of the layer
 */
var DEFAULT_PROPS = {
  key: 0,
  opacity: 0.8,
  numInstances: undefined,
  data: [],
  isPickable: false,
  deepCompare: false,
  getValue: function getValue(x) {
    return x;
  },
  onHover: function onHover() {},
  onClick: function onClick() {}
};

var ATTRIBUTES = {
  pickingColors: { size: 3, '0': 'pickRed', '1': 'pickGreen', '2': 'pickBlue' }
};

var counter = 0;

var Layer = function () {
  _createClass(Layer, null, [{
    key: 'attributes',
    get: function get() {
      return ATTRIBUTES;
    }

    /**
     * @classdesc
     * Base Layer class
     *
     * @class
     * @param {object} props - See docs above
     */
    /* eslint-disable max-statements */

  }]);

  function Layer(props) {
    _classCallCheck(this, Layer);

    props = _extends({}, DEFAULT_PROPS, props);

    // Add iterator to objects
    // TODO - Modifying props is an anti-pattern
    if (props.data) {
      (0, _util.addIterator)(props.data);
      (0, _assert2.default)(props.data[Symbol.iterator], 'data prop must have an iterator');
    }

    this.checkProp(props.data, 'data');
    this.checkProp(props.id, 'id');
    this.checkProp(props.width, 'width');
    this.checkProp(props.height, 'height');

    this.checkProp(props.width, 'width');
    this.checkProp(props.height, 'height');
    this.checkProp(props.latitude, 'latitude');
    this.checkProp(props.longitude, 'longitude');
    this.checkProp(props.zoom, 'zoom');

    this.props = props;
    this.count = counter++;
  }
  /* eslint-enable max-statements */

  // //////////////////////////////////////////////////
  // LIFECYCLE METHODS, overridden by the layer subclasses

  // Called once to set up the initial state


  _createClass(Layer, [{
    key: 'initializeState',
    value: function initializeState() {}

    // gl context is now available

  }, {
    key: 'didMount',
    value: function didMount() {}
  }, {
    key: 'shouldUpdate',
    value: function shouldUpdate(oldProps, newProps) {
      // If any props have changed
      if (!(0, _util.areEqualShallow)(newProps, oldProps)) {

        if (newProps.data !== oldProps.data) {
          this.setState({ dataChanged: true });
        }
        return true;
      }
      if (newProps.deepCompare && !(0, _lodash2.default)(newProps.data, oldProps.data)) {
        // Support optional deep compare of data
        // Note: this is quite inefficient, app should use buffer props instead
        this.setState({ dataChanged: true });
        return true;
      }
      return false;
    }

    // Default implementation, all attributeManager will be updated

  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(newProps) {
      var attributeManager = this.state.attributeManager;

      if (this.state.dataChanged) {
        attributeManager.invalidateAll();
      }
    }

    // gl context still available

  }, {
    key: 'willUnmount',
    value: function willUnmount() {}

    // END LIFECYCLE METHODS
    // //////////////////////////////////////////////////

    // Public API

  }, {
    key: 'getNeedsRedraw',
    value: function getNeedsRedraw(_ref) {
      var clearFlag = _ref.clearFlag;

      // this method may be called by the render loop as soon a the layer
      // has been created, so guard against uninitialized state
      if (!this.state) {
        return false;
      }

      var attributeManager = this.state.attributeManager;

      var needsRedraw = attributeManager.getNeedsRedraw({ clearFlag: clearFlag });
      needsRedraw = needsRedraw || this.state.needsRedraw;
      if (clearFlag) {
        this.state.needsRedraw = false;
      }
      return needsRedraw;
    }

    // Updates selected state members and marks the object for redraw

  }, {
    key: 'setState',
    value: function setState(updateObject) {
      Object.assign(this.state, updateObject);
      this.state.needsRedraw = true;
    }

    // Updates selected state members and marks the object for redraw

  }, {
    key: 'setUniforms',
    value: function setUniforms(uniformMap) {
      if (this.state.model) {
        this.state.model.setUniforms(uniformMap);
      }
      // TODO - set needsRedraw on the model?
      this.state.needsRedraw = true;
      (0, _log2.default)(3, 'layer.setUniforms', uniformMap);
    }

    // Use iteration (the only required capability on data) to get first element

  }, {
    key: 'getFirstObject',
    value: function getFirstObject() {
      var data = this.props.data;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var object = _step.value;

          return object;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return null;
    }

    // INTERNAL METHODS

    // Deduces numer of instances. Intention is to support:
    // - Explicit setting of numInstances
    // - Auto-deduction for ES6 containers that define a size member
    // - Auto-deduction for Classic Arrays via the built-in length attribute
    // - Auto-deduction via arrays

  }, {
    key: 'getNumInstances',
    value: function getNumInstances(props) {
      props = props || this.props;

      // First check if the layer has set its own value
      if (this.state && this.state.numInstances !== undefined) {
        return this.state.numInstances;
      }

      // Check if app has set an explicit value
      if (props.numInstances) {
        return props.numInstances;
      }

      var _props = props;
      var data = _props.data;

      // Check if ES6 collection "size" attribute is set

      if (data && typeof data.count === 'function') {
        return data.count();
      }

      // Check if ES6 collection "size" attribute is set
      if (data && data.size) {
        return data.size;
      }

      // Check if array length attribute is set on data
      // Note: checking this last since some ES6 collections (Immutable)
      // emit profuse warnings when trying to access .length
      if (data && data.length) {
        return data.length;
      }

      // TODO - slow, we probably should not support this unless
      // we limit the number of invocations
      //
      // Use iteration to count objects
      // let count = 0;
      // /* eslint-disable no-unused-vars */
      // for (const object of data) {
      //   count++;
      // }
      // return count;

      throw new Error('Could not deduce numInstances');
    }

    // Internal Helpers

  }, {
    key: 'checkProps',
    value: function checkProps(oldProps, newProps) {
      // Note: dataChanged might already be set
      if (newProps.data !== oldProps.data) {
        // Figure out data length
        this.state.dataChanged = true;
      }

      var viewportChanged = newProps.width !== oldProps.width || newProps.height !== oldProps.height || newProps.latitude !== oldProps.latitude || newProps.longitude !== oldProps.longitude || newProps.zoom !== oldProps.zoom;

      this.setState({ viewportChanged: viewportChanged });
    }
  }, {
    key: 'updateAttributes',
    value: function updateAttributes(props) {
      var attributeManager = this.state.attributeManager;

      var numInstances = this.getNumInstances(props);
      // Figure out data length
      attributeManager.update({
        numInstances: numInstances,
        bufferMap: props,
        context: this,
        // Don't worry about non-attribute props
        ignoreUnknownAttributes: true
      });
    }
  }, {
    key: 'updateBaseUniforms',
    value: function updateBaseUniforms() {
      this.setUniforms({
        // apply gamma to opacity to make it visually "linear"
        opacity: Math.pow(this.props.opacity || 0.8, 1 / 2.2)
      });
    }

    // LAYER MANAGER API

    // Called by layer manager when a new layer is found

  }, {
    key: 'initializeLayer',
    value: function initializeLayer(_ref2) {
      var gl = _ref2.gl;

      (0, _assert2.default)(gl);
      this.state = { gl: gl };

      // Initialize state only once
      this.setState({
        attributeManager: new _attributeManager2.default({ id: this.props.id }),
        model: null,
        needsRedraw: true,
        dataChanged: true
      });

      var attributeManager = this.state.attributeManager;
      // All instanced layers get pickingColors attribute by default
      // Their shaders can use it to render a picking scene

      attributeManager.addInstanced(ATTRIBUTES, {
        pickingColors: { update: this.calculatePickingColors }
      });

      this.setViewport();
      this.initializeState();
      (0, _assert2.default)(this.state.model, 'Model must be set in initializeState');
      this.setViewport();

      // Add any primitive attributes
      this._initializePrimitiveAttributes();

      // TODO - the app must be able to override

      // Add any subclass attributes
      this.updateAttributes(this.props);
      this.updateBaseUniforms();
      this.state.model.setInstanceCount(this.getNumInstances());

      // Create a model for the layer
      this._updateModel({ gl: gl });

      // Call life cycle method
      this.didMount();
    }

    // Called by layer manager when existing layer is getting new props

  }, {
    key: 'updateLayer',
    value: function updateLayer(oldProps, newProps) {
      // Calculate standard change flags
      this.checkProps(oldProps, newProps);

      // Check if any props have changed
      if (this.shouldUpdate(oldProps, newProps)) {
        if (this.state.viewportChanged) {
          this.setViewport();
        }

        // Let the subclass mark what is needed for update
        this.willReceiveProps(oldProps, newProps);
        // Run the attribute updaters
        this.updateAttributes(newProps);
        // Update the uniforms
        this.updateBaseUniforms();

        this.state.model.setInstanceCount(this.getNumInstances());
      }

      this.state.dataChanged = false;
      this.state.viewportChanged = false;
    }

    // Called by manager when layer is about to be disposed
    // Note: not guaranteed to be called on application shutdown

  }, {
    key: 'finalizeLayer',
    value: function finalizeLayer() {
      this.willUnmount();
    }
  }, {
    key: 'calculatePickingColors',
    value: function calculatePickingColors(attribute, numInstances) {
      var value = attribute.value;
      var size = attribute.size;
      // add 1 to index to seperate from no selection

      for (var i = 0; i < numInstances; i++) {
        var pickingColor = this.encodePickingColor(i);
        value[i * size + 0] = pickingColor[0];
        value[i * size + 1] = pickingColor[1];
        value[i * size + 2] = pickingColor[2];
      }
    }
  }, {
    key: 'decodePickingColor',
    value: function decodePickingColor(color) {
      (0, _assert2.default)(color instanceof Uint8Array);

      var _color = _slicedToArray(color, 3);

      var i1 = _color[0];
      var i2 = _color[1];
      var i3 = _color[2];
      // 1 was added to seperate from no selection

      var index = i1 + i2 * 256 + i3 * 65536 - 1;
      return index;
    }
  }, {
    key: 'encodePickingColor',
    value: function encodePickingColor(i) {
      return [(i + 1) % 256, Math.floor((i + 1) / 256) % 256, Math.floor((i + 1) / 256 / 256) % 256];
    }

    // Override to add or modify info in sublayer
    // The sublayer may know what lat,lon corresponds to using math etc
    // even when picking does not work

  }, {
    key: 'onGetHoverInfo',
    value: function onGetHoverInfo(info) {
      var color = info.color;

      info.index = this.decodePickingColor(color);
      info.geoCoords = this.unproject({ x: info.x, y: info.y });
      return info;
    }
  }, {
    key: 'onHover',
    value: function onHover(info) {
      var _info = info;
      var color = _info.color;

      var selectedPickingColor = new Float32Array(3);
      selectedPickingColor[0] = color[0];
      selectedPickingColor[1] = color[1];
      selectedPickingColor[2] = color[2];
      this.setUniforms({ selectedPickingColor: selectedPickingColor });

      info = this.onGetHoverInfo(info);
      return this.props.onHover(info);
    }
  }, {
    key: 'onClick',
    value: function onClick(info) {
      info = this.onGetHoverInfo(info);
      return this.props.onClick(info);
    }

    // INTERNAL METHODS

    // Set up attributes relating to the primitive itself (not the instances)

  }, {
    key: '_initializePrimitiveAttributes',
    value: function _initializePrimitiveAttributes() {
      var _state = this.state;
      var gl = _state.gl;
      var model = _state.model;
      var attributeManager = _state.attributeManager;

      // TODO - this unpacks and repacks the attributes, seems unnecessary

      if (model.geometry.hasAttribute('vertices')) {
        var vertices = model.geometry.getArray('vertices');
        attributeManager.addVertices(vertices);
      }

      if (model.geometry.hasAttribute('normals')) {
        var normals = model.geometry.getArray('normals');
        attributeManager.addNormals(normals);
      }

      if (model.geometry.hasAttribute('indices')) {
        var indices = model.geometry.getArray('indices');
        attributeManager.addIndices(indices, gl);
      }
    }
  }, {
    key: '_updateModel',
    value: function _updateModel(_ref3) {
      var gl = _ref3.gl;
      var _state2 = this.state;
      var model = _state2.model;
      var attributeManager = _state2.attributeManager;
      var uniforms = _state2.uniforms;


      (0, _assert2.default)(model);
      model.setAttributes(attributeManager.getAttributes());
      model.setUniforms(uniforms);
      // whether current layer responds to mouse events
      model.setPickable(this.props.isPickable);
    }
  }, {
    key: 'checkProp',
    value: function checkProp(property, propertyName) {
      if (!property) {
        throw new Error('Property ' + propertyName + ' undefined in layer ' + this.id);
      }
    }

    // MAP LAYER FUNCTIONALITY

  }, {
    key: 'setViewport',
    value: function setViewport() {
      var _props2 = this.props;
      var width = _props2.width;
      var height = _props2.height;
      var latitude = _props2.latitude;
      var longitude = _props2.longitude;
      var zoom = _props2.zoom;

      this.setState({
        viewport: new _flatWorld2.default.Viewport(width, height),
        mercator: (0, _viewportMercatorProject2.default)({
          width: width, height: height, latitude: latitude, longitude: longitude, zoom: zoom,
          tileSize: 512
        })
      });
      var _state$viewport = this.state.viewport;
      var x = _state$viewport.x;
      var y = _state$viewport.y;

      this.setUniforms({
        viewport: [x, y, width, height],
        mapViewport: [longitude, latitude, zoom, _flatWorld2.default.size]
      });
      (0, _log2.default)(3, this.state.viewport, latitude, longitude, zoom);
    }

    /**
     * Position conversion is done in shader, so in many cases there is no need
     * for this function
     * @param {Object|Array} latLng - Either [lat,lng] or {lat, lon}
     * @return {Object} - x, y
     */

  }, {
    key: 'project',
    value: function project(latLng) {
      var mercator = this.state.mercator;

      var _ref4 = Array.isArray(latLng) ? mercator.project([latLng[1], latLng[0]]) : mercator.project([latLng.lon, latLng.lat]);

      var _ref5 = _slicedToArray(_ref4, 2);

      var x = _ref5[0];
      var y = _ref5[1];

      return { x: x, y: y };
    }
  }, {
    key: 'unproject',
    value: function unproject(xy) {
      var mercator = this.state.mercator;

      var _ref6 = Array.isArray(xy) ? mercator.unproject(xy) : mercator.unproject([xy.x, xy.y]);

      var _ref7 = _slicedToArray(_ref6, 2);

      var lon = _ref7[0];
      var lat = _ref7[1];

      return { lat: lat, lon: lon };
    }
  }, {
    key: 'screenToSpace',
    value: function screenToSpace(_ref8) {
      var x = _ref8.x;
      var y = _ref8.y;
      var viewport = this.state.viewport;

      return viewport.screenToSpace({ x: x, y: y });
    }
  }]);

  return Layer;
}();

exports.default = Layer;
//# sourceMappingURL=data:application/json;base64,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O1VBRUosYUFGSTs7QUFLZCxhQUFPLEVBQUMsSUFBRCxFQUFJLElBQUosRUFBUCxDQUxjOzs7OzhCQVFOLElBQUk7VUFDTCxXQUFZLEtBQUssS0FBTCxDQUFaLFNBREs7O2tCQUVPLE1BQU0sT0FBTixDQUFjLEVBQWQsSUFDakIsU0FBUyxTQUFULENBQW1CLEVBQW5CLENBRGlCLEdBRWpCLFNBQVMsU0FBVCxDQUFtQixDQUFDLEdBQUcsQ0FBSCxFQUFNLEdBQUcsQ0FBSCxDQUExQixDQUZpQixDQUZQOzs7O1VBRUwsZUFGSztVQUVBLGVBRkE7O0FBS1osYUFBTyxFQUFDLFFBQUQsRUFBTSxRQUFOLEVBQVAsQ0FMWTs7Ozt5Q0FRUTtVQUFQLFlBQU87VUFBSixZQUFJO1VBQ2IsV0FBWSxLQUFLLEtBQUwsQ0FBWixTQURhOztBQUVwQixhQUFPLFNBQVMsYUFBVCxDQUF1QixFQUFDLElBQUQsRUFBSSxJQUFKLEVBQXZCLENBQVAsQ0FGb0I7Ozs7U0FoYkgiLCJmaWxlIjoibGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vKiBlc2xpbnQtZGlzYWJsZSBndWFyZC1mb3ItaW4gKi9cbmltcG9ydCBBdHRyaWJ1dGVNYW5hZ2VyIGZyb20gJy4vYXR0cmlidXRlLW1hbmFnZXInO1xuaW1wb3J0IGZsYXRXb3JsZCBmcm9tICcuL2ZsYXQtd29ybGQnO1xuaW1wb3J0IHthcmVFcXVhbFNoYWxsb3d9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge2FkZEl0ZXJhdG9yfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IGxvZyBmcm9tICcuL2xvZyc7XG5pbXBvcnQgaXNEZWVwRXF1YWwgZnJvbSAnbG9kYXNoLmlzZXF1YWwnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IFZpZXdwb3J0TWVyY2F0b3IgZnJvbSAndmlld3BvcnQtbWVyY2F0b3ItcHJvamVjdCc7XG5cbi8qXG4gKiBAcGFyYW0ge3N0cmluZ30gcHJvcHMuaWQgLSBsYXllciBuYW1lXG4gKiBAcGFyYW0ge2FycmF5fSAgcHJvcHMuZGF0YSAtIGFycmF5IG9mIGRhdGEgaW5zdGFuY2VzXG4gKiBAcGFyYW0ge251bWJlcn0gcHJvcHMud2lkdGggLSB2aWV3cG9ydCB3aWR0aCwgc3luY2VkIHdpdGggTWFwYm94R0xcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcm9wcy5oZWlnaHQgLSB2aWV3cG9ydCB3aWR0aCwgc3luY2VkIHdpdGggTWFwYm94R0xcbiAqIEBwYXJhbSB7Ym9vbH0gcHJvcHMuaXNQaWNrYWJsZSAtIHdoZXRoZXIgbGF5ZXIgcmVzcG9uc2UgdG8gbW91c2UgZXZlbnRcbiAqIEBwYXJhbSB7Ym9vbH0gcHJvcHMub3BhY2l0eSAtIG9wYWNpdHkgb2YgdGhlIGxheWVyXG4gKi9cbmNvbnN0IERFRkFVTFRfUFJPUFMgPSB7XG4gIGtleTogMCxcbiAgb3BhY2l0eTogMC44LFxuICBudW1JbnN0YW5jZXM6IHVuZGVmaW5lZCxcbiAgZGF0YTogW10sXG4gIGlzUGlja2FibGU6IGZhbHNlLFxuICBkZWVwQ29tcGFyZTogZmFsc2UsXG4gIGdldFZhbHVlOiB4ID0+IHgsXG4gIG9uSG92ZXI6ICgpID0+IHt9LFxuICBvbkNsaWNrOiAoKSA9PiB7fVxufTtcblxuY29uc3QgQVRUUklCVVRFUyA9IHtcbiAgcGlja2luZ0NvbG9yczoge3NpemU6IDMsICcwJzogJ3BpY2tSZWQnLCAnMSc6ICdwaWNrR3JlZW4nLCAnMic6ICdwaWNrQmx1ZSd9XG59O1xuXG5sZXQgY291bnRlciA9IDA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExheWVyIHtcblxuICBzdGF0aWMgZ2V0IGF0dHJpYnV0ZXMoKSB7XG4gICAgcmV0dXJuIEFUVFJJQlVURVM7XG4gIH1cblxuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBCYXNlIExheWVyIGNsYXNzXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge29iamVjdH0gcHJvcHMgLSBTZWUgZG9jcyBhYm92ZVxuICAgKi9cbiAgLyogZXNsaW50LWRpc2FibGUgbWF4LXN0YXRlbWVudHMgKi9cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcblxuICAgIHByb3BzID0ge1xuICAgICAgLi4uREVGQVVMVF9QUk9QUyxcbiAgICAgIC4uLnByb3BzXG4gICAgfTtcblxuICAgIC8vIEFkZCBpdGVyYXRvciB0byBvYmplY3RzXG4gICAgLy8gVE9ETyAtIE1vZGlmeWluZyBwcm9wcyBpcyBhbiBhbnRpLXBhdHRlcm5cbiAgICBpZiAocHJvcHMuZGF0YSkge1xuICAgICAgYWRkSXRlcmF0b3IocHJvcHMuZGF0YSk7XG4gICAgICBhc3NlcnQocHJvcHMuZGF0YVtTeW1ib2wuaXRlcmF0b3JdLCAnZGF0YSBwcm9wIG11c3QgaGF2ZSBhbiBpdGVyYXRvcicpO1xuICAgIH1cblxuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLmRhdGEsICdkYXRhJyk7XG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMuaWQsICdpZCcpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLndpZHRoLCAnd2lkdGgnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy5oZWlnaHQsICdoZWlnaHQnKTtcblxuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLndpZHRoLCAnd2lkdGgnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy5oZWlnaHQsICdoZWlnaHQnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy5sYXRpdHVkZSwgJ2xhdGl0dWRlJyk7XG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMubG9uZ2l0dWRlLCAnbG9uZ2l0dWRlJyk7XG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMuem9vbSwgJ3pvb20nKTtcblxuICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgICB0aGlzLmNvdW50ID0gY291bnRlcisrO1xuICB9XG4gIC8qIGVzbGludC1lbmFibGUgbWF4LXN0YXRlbWVudHMgKi9cblxuICAvLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBMSUZFQ1lDTEUgTUVUSE9EUywgb3ZlcnJpZGRlbiBieSB0aGUgbGF5ZXIgc3ViY2xhc3Nlc1xuXG4gIC8vIENhbGxlZCBvbmNlIHRvIHNldCB1cCB0aGUgaW5pdGlhbCBzdGF0ZVxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gIH1cblxuICAvLyBnbCBjb250ZXh0IGlzIG5vdyBhdmFpbGFibGVcbiAgZGlkTW91bnQoKSB7XG4gIH1cblxuICBzaG91bGRVcGRhdGUob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgLy8gSWYgYW55IHByb3BzIGhhdmUgY2hhbmdlZFxuICAgIGlmICghYXJlRXF1YWxTaGFsbG93KG5ld1Byb3BzLCBvbGRQcm9wcykpIHtcblxuICAgICAgaWYgKG5ld1Byb3BzLmRhdGEgIT09IG9sZFByb3BzLmRhdGEpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YUNoYW5nZWQ6IHRydWV9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAobmV3UHJvcHMuZGVlcENvbXBhcmUgJiYgIWlzRGVlcEVxdWFsKG5ld1Byb3BzLmRhdGEsIG9sZFByb3BzLmRhdGEpKSB7XG4gICAgICAvLyBTdXBwb3J0IG9wdGlvbmFsIGRlZXAgY29tcGFyZSBvZiBkYXRhXG4gICAgICAvLyBOb3RlOiB0aGlzIGlzIHF1aXRlIGluZWZmaWNpZW50LCBhcHAgc2hvdWxkIHVzZSBidWZmZXIgcHJvcHMgaW5zdGVhZFxuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YUNoYW5nZWQ6IHRydWV9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBEZWZhdWx0IGltcGxlbWVudGF0aW9uLCBhbGwgYXR0cmlidXRlTWFuYWdlciB3aWxsIGJlIHVwZGF0ZWRcbiAgd2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKHRoaXMuc3RhdGUuZGF0YUNoYW5nZWQpIHtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZUFsbCgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGdsIGNvbnRleHQgc3RpbGwgYXZhaWxhYmxlXG4gIHdpbGxVbm1vdW50KCkge1xuICB9XG5cbiAgLy8gRU5EIExJRkVDWUNMRSBNRVRIT0RTXG4gIC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgLy8gUHVibGljIEFQSVxuXG4gIGdldE5lZWRzUmVkcmF3KHtjbGVhckZsYWd9KSB7XG4gICAgLy8gdGhpcyBtZXRob2QgbWF5IGJlIGNhbGxlZCBieSB0aGUgcmVuZGVyIGxvb3AgYXMgc29vbiBhIHRoZSBsYXllclxuICAgIC8vIGhhcyBiZWVuIGNyZWF0ZWQsIHNvIGd1YXJkIGFnYWluc3QgdW5pbml0aWFsaXplZCBzdGF0ZVxuICAgIGlmICghdGhpcy5zdGF0ZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgbGV0IG5lZWRzUmVkcmF3ID0gYXR0cmlidXRlTWFuYWdlci5nZXROZWVkc1JlZHJhdyh7Y2xlYXJGbGFnfSk7XG4gICAgbmVlZHNSZWRyYXcgPSBuZWVkc1JlZHJhdyB8fCB0aGlzLnN0YXRlLm5lZWRzUmVkcmF3O1xuICAgIGlmIChjbGVhckZsYWcpIHtcbiAgICAgIHRoaXMuc3RhdGUubmVlZHNSZWRyYXcgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG5lZWRzUmVkcmF3O1xuICB9XG5cbiAgLy8gVXBkYXRlcyBzZWxlY3RlZCBzdGF0ZSBtZW1iZXJzIGFuZCBtYXJrcyB0aGUgb2JqZWN0IGZvciByZWRyYXdcbiAgc2V0U3RhdGUodXBkYXRlT2JqZWN0KSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLCB1cGRhdGVPYmplY3QpO1xuICAgIHRoaXMuc3RhdGUubmVlZHNSZWRyYXcgPSB0cnVlO1xuICB9XG5cbiAgLy8gVXBkYXRlcyBzZWxlY3RlZCBzdGF0ZSBtZW1iZXJzIGFuZCBtYXJrcyB0aGUgb2JqZWN0IGZvciByZWRyYXdcbiAgc2V0VW5pZm9ybXModW5pZm9ybU1hcCkge1xuICAgIGlmICh0aGlzLnN0YXRlLm1vZGVsKSB7XG4gICAgICB0aGlzLnN0YXRlLm1vZGVsLnNldFVuaWZvcm1zKHVuaWZvcm1NYXApO1xuICAgIH1cbiAgICAvLyBUT0RPIC0gc2V0IG5lZWRzUmVkcmF3IG9uIHRoZSBtb2RlbD9cbiAgICB0aGlzLnN0YXRlLm5lZWRzUmVkcmF3ID0gdHJ1ZTtcbiAgICBsb2coMywgJ2xheWVyLnNldFVuaWZvcm1zJywgdW5pZm9ybU1hcCk7XG4gIH1cblxuICAvLyBVc2UgaXRlcmF0aW9uICh0aGUgb25seSByZXF1aXJlZCBjYXBhYmlsaXR5IG9uIGRhdGEpIHRvIGdldCBmaXJzdCBlbGVtZW50XG4gIGdldEZpcnN0T2JqZWN0KCkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgZm9yIChjb25zdCBvYmplY3Qgb2YgZGF0YSkge1xuICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBJTlRFUk5BTCBNRVRIT0RTXG5cbiAgLy8gRGVkdWNlcyBudW1lciBvZiBpbnN0YW5jZXMuIEludGVudGlvbiBpcyB0byBzdXBwb3J0OlxuICAvLyAtIEV4cGxpY2l0IHNldHRpbmcgb2YgbnVtSW5zdGFuY2VzXG4gIC8vIC0gQXV0by1kZWR1Y3Rpb24gZm9yIEVTNiBjb250YWluZXJzIHRoYXQgZGVmaW5lIGEgc2l6ZSBtZW1iZXJcbiAgLy8gLSBBdXRvLWRlZHVjdGlvbiBmb3IgQ2xhc3NpYyBBcnJheXMgdmlhIHRoZSBidWlsdC1pbiBsZW5ndGggYXR0cmlidXRlXG4gIC8vIC0gQXV0by1kZWR1Y3Rpb24gdmlhIGFycmF5c1xuICBnZXROdW1JbnN0YW5jZXMocHJvcHMpIHtcbiAgICBwcm9wcyA9IHByb3BzIHx8IHRoaXMucHJvcHM7XG5cbiAgICAvLyBGaXJzdCBjaGVjayBpZiB0aGUgbGF5ZXIgaGFzIHNldCBpdHMgb3duIHZhbHVlXG4gICAgaWYgKHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5udW1JbnN0YW5jZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUubnVtSW5zdGFuY2VzO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIGFwcCBoYXMgc2V0IGFuIGV4cGxpY2l0IHZhbHVlXG4gICAgaWYgKHByb3BzLm51bUluc3RhbmNlcykge1xuICAgICAgcmV0dXJuIHByb3BzLm51bUluc3RhbmNlcztcbiAgICB9XG5cbiAgICBjb25zdCB7ZGF0YX0gPSBwcm9wcztcblxuICAgIC8vIENoZWNrIGlmIEVTNiBjb2xsZWN0aW9uIFwic2l6ZVwiIGF0dHJpYnV0ZSBpcyBzZXRcbiAgICBpZiAoZGF0YSAmJiB0eXBlb2YgZGF0YS5jb3VudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGRhdGEuY291bnQoKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBFUzYgY29sbGVjdGlvbiBcInNpemVcIiBhdHRyaWJ1dGUgaXMgc2V0XG4gICAgaWYgKGRhdGEgJiYgZGF0YS5zaXplKSB7XG4gICAgICByZXR1cm4gZGF0YS5zaXplO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIGFycmF5IGxlbmd0aCBhdHRyaWJ1dGUgaXMgc2V0IG9uIGRhdGFcbiAgICAvLyBOb3RlOiBjaGVja2luZyB0aGlzIGxhc3Qgc2luY2Ugc29tZSBFUzYgY29sbGVjdGlvbnMgKEltbXV0YWJsZSlcbiAgICAvLyBlbWl0IHByb2Z1c2Ugd2FybmluZ3Mgd2hlbiB0cnlpbmcgdG8gYWNjZXNzIC5sZW5ndGhcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGRhdGEubGVuZ3RoO1xuICAgIH1cblxuICAgIC8vIFRPRE8gLSBzbG93LCB3ZSBwcm9iYWJseSBzaG91bGQgbm90IHN1cHBvcnQgdGhpcyB1bmxlc3NcbiAgICAvLyB3ZSBsaW1pdCB0aGUgbnVtYmVyIG9mIGludm9jYXRpb25zXG4gICAgLy9cbiAgICAvLyBVc2UgaXRlcmF0aW9uIHRvIGNvdW50IG9iamVjdHNcbiAgICAvLyBsZXQgY291bnQgPSAwO1xuICAgIC8vIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgLy8gZm9yIChjb25zdCBvYmplY3Qgb2YgZGF0YSkge1xuICAgIC8vICAgY291bnQrKztcbiAgICAvLyB9XG4gICAgLy8gcmV0dXJuIGNvdW50O1xuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGVkdWNlIG51bUluc3RhbmNlcycpO1xuICB9XG5cbiAgLy8gSW50ZXJuYWwgSGVscGVyc1xuXG4gIGNoZWNrUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgLy8gTm90ZTogZGF0YUNoYW5nZWQgbWlnaHQgYWxyZWFkeSBiZSBzZXRcbiAgICBpZiAobmV3UHJvcHMuZGF0YSAhPT0gb2xkUHJvcHMuZGF0YSkge1xuICAgICAgLy8gRmlndXJlIG91dCBkYXRhIGxlbmd0aFxuICAgICAgdGhpcy5zdGF0ZS5kYXRhQ2hhbmdlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3Qgdmlld3BvcnRDaGFuZ2VkID1cbiAgICAgIG5ld1Byb3BzLndpZHRoICE9PSBvbGRQcm9wcy53aWR0aCB8fFxuICAgICAgbmV3UHJvcHMuaGVpZ2h0ICE9PSBvbGRQcm9wcy5oZWlnaHQgfHxcbiAgICAgIG5ld1Byb3BzLmxhdGl0dWRlICE9PSBvbGRQcm9wcy5sYXRpdHVkZSB8fFxuICAgICAgbmV3UHJvcHMubG9uZ2l0dWRlICE9PSBvbGRQcm9wcy5sb25naXR1ZGUgfHxcbiAgICAgIG5ld1Byb3BzLnpvb20gIT09IG9sZFByb3BzLnpvb207XG5cbiAgICB0aGlzLnNldFN0YXRlKHt2aWV3cG9ydENoYW5nZWR9KTtcbiAgfVxuXG4gIHVwZGF0ZUF0dHJpYnV0ZXMocHJvcHMpIHtcbiAgICBjb25zdCB7YXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IG51bUluc3RhbmNlcyA9IHRoaXMuZ2V0TnVtSW5zdGFuY2VzKHByb3BzKTtcbiAgICAvLyBGaWd1cmUgb3V0IGRhdGEgbGVuZ3RoXG4gICAgYXR0cmlidXRlTWFuYWdlci51cGRhdGUoe1xuICAgICAgbnVtSW5zdGFuY2VzLFxuICAgICAgYnVmZmVyTWFwOiBwcm9wcyxcbiAgICAgIGNvbnRleHQ6IHRoaXMsXG4gICAgICAvLyBEb24ndCB3b3JyeSBhYm91dCBub24tYXR0cmlidXRlIHByb3BzXG4gICAgICBpZ25vcmVVbmtub3duQXR0cmlidXRlczogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlQmFzZVVuaWZvcm1zKCkge1xuICAgIHRoaXMuc2V0VW5pZm9ybXMoe1xuICAgICAgLy8gYXBwbHkgZ2FtbWEgdG8gb3BhY2l0eSB0byBtYWtlIGl0IHZpc3VhbGx5IFwibGluZWFyXCJcbiAgICAgIG9wYWNpdHk6IE1hdGgucG93KHRoaXMucHJvcHMub3BhY2l0eSB8fCAwLjgsIDEgLyAyLjIpXG4gICAgfSk7XG4gIH1cblxuICAvLyBMQVlFUiBNQU5BR0VSIEFQSVxuXG4gIC8vIENhbGxlZCBieSBsYXllciBtYW5hZ2VyIHdoZW4gYSBuZXcgbGF5ZXIgaXMgZm91bmRcbiAgaW5pdGlhbGl6ZUxheWVyKHtnbH0pIHtcbiAgICBhc3NlcnQoZ2wpO1xuICAgIHRoaXMuc3RhdGUgPSB7Z2x9O1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBzdGF0ZSBvbmx5IG9uY2VcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXI6IG5ldyBBdHRyaWJ1dGVNYW5hZ2VyKHtpZDogdGhpcy5wcm9wcy5pZH0pLFxuICAgICAgbW9kZWw6IG51bGwsXG4gICAgICBuZWVkc1JlZHJhdzogdHJ1ZSxcbiAgICAgIGRhdGFDaGFuZ2VkOiB0cnVlXG4gICAgfSk7XG5cbiAgICBjb25zdCB7YXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuICAgIC8vIEFsbCBpbnN0YW5jZWQgbGF5ZXJzIGdldCBwaWNraW5nQ29sb3JzIGF0dHJpYnV0ZSBieSBkZWZhdWx0XG4gICAgLy8gVGhlaXIgc2hhZGVycyBjYW4gdXNlIGl0IHRvIHJlbmRlciBhIHBpY2tpbmcgc2NlbmVcbiAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZChBVFRSSUJVVEVTLCB7XG4gICAgICBwaWNraW5nQ29sb3JzOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVBpY2tpbmdDb2xvcnN9XG4gICAgfSk7XG5cbiAgICB0aGlzLnNldFZpZXdwb3J0KCk7XG4gICAgdGhpcy5pbml0aWFsaXplU3RhdGUoKTtcbiAgICBhc3NlcnQodGhpcy5zdGF0ZS5tb2RlbCwgJ01vZGVsIG11c3QgYmUgc2V0IGluIGluaXRpYWxpemVTdGF0ZScpO1xuICAgIHRoaXMuc2V0Vmlld3BvcnQoKTtcblxuICAgIC8vIEFkZCBhbnkgcHJpbWl0aXZlIGF0dHJpYnV0ZXNcbiAgICB0aGlzLl9pbml0aWFsaXplUHJpbWl0aXZlQXR0cmlidXRlcygpO1xuXG4gICAgLy8gVE9ETyAtIHRoZSBhcHAgbXVzdCBiZSBhYmxlIHRvIG92ZXJyaWRlXG5cbiAgICAvLyBBZGQgYW55IHN1YmNsYXNzIGF0dHJpYnV0ZXNcbiAgICB0aGlzLnVwZGF0ZUF0dHJpYnV0ZXModGhpcy5wcm9wcyk7XG4gICAgdGhpcy51cGRhdGVCYXNlVW5pZm9ybXMoKTtcbiAgICB0aGlzLnN0YXRlLm1vZGVsLnNldEluc3RhbmNlQ291bnQodGhpcy5nZXROdW1JbnN0YW5jZXMoKSk7XG5cbiAgICAvLyBDcmVhdGUgYSBtb2RlbCBmb3IgdGhlIGxheWVyXG4gICAgdGhpcy5fdXBkYXRlTW9kZWwoe2dsfSk7XG5cbiAgICAvLyBDYWxsIGxpZmUgY3ljbGUgbWV0aG9kXG4gICAgdGhpcy5kaWRNb3VudCgpO1xuICB9XG5cbiAgLy8gQ2FsbGVkIGJ5IGxheWVyIG1hbmFnZXIgd2hlbiBleGlzdGluZyBsYXllciBpcyBnZXR0aW5nIG5ldyBwcm9wc1xuICB1cGRhdGVMYXllcihvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICAvLyBDYWxjdWxhdGUgc3RhbmRhcmQgY2hhbmdlIGZsYWdzXG4gICAgdGhpcy5jaGVja1Byb3BzKG9sZFByb3BzLCBuZXdQcm9wcyk7XG5cbiAgICAvLyBDaGVjayBpZiBhbnkgcHJvcHMgaGF2ZSBjaGFuZ2VkXG4gICAgaWYgKHRoaXMuc2hvdWxkVXBkYXRlKG9sZFByb3BzLCBuZXdQcm9wcykpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLnZpZXdwb3J0Q2hhbmdlZCkge1xuICAgICAgICB0aGlzLnNldFZpZXdwb3J0KCk7XG4gICAgICB9XG5cbiAgICAgIC8vIExldCB0aGUgc3ViY2xhc3MgbWFyayB3aGF0IGlzIG5lZWRlZCBmb3IgdXBkYXRlXG4gICAgICB0aGlzLndpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKTtcbiAgICAgIC8vIFJ1biB0aGUgYXR0cmlidXRlIHVwZGF0ZXJzXG4gICAgICB0aGlzLnVwZGF0ZUF0dHJpYnV0ZXMobmV3UHJvcHMpO1xuICAgICAgLy8gVXBkYXRlIHRoZSB1bmlmb3Jtc1xuICAgICAgdGhpcy51cGRhdGVCYXNlVW5pZm9ybXMoKTtcblxuICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5zZXRJbnN0YW5jZUNvdW50KHRoaXMuZ2V0TnVtSW5zdGFuY2VzKCkpO1xuICAgIH1cblxuICAgIHRoaXMuc3RhdGUuZGF0YUNoYW5nZWQgPSBmYWxzZTtcbiAgICB0aGlzLnN0YXRlLnZpZXdwb3J0Q2hhbmdlZCA9IGZhbHNlO1xuICB9XG5cbiAgLy8gQ2FsbGVkIGJ5IG1hbmFnZXIgd2hlbiBsYXllciBpcyBhYm91dCB0byBiZSBkaXNwb3NlZFxuICAvLyBOb3RlOiBub3QgZ3VhcmFudGVlZCB0byBiZSBjYWxsZWQgb24gYXBwbGljYXRpb24gc2h1dGRvd25cbiAgZmluYWxpemVMYXllcigpIHtcbiAgICB0aGlzLndpbGxVbm1vdW50KCk7XG4gIH1cblxuICBjYWxjdWxhdGVQaWNraW5nQ29sb3JzKGF0dHJpYnV0ZSwgbnVtSW5zdGFuY2VzKSB7XG4gICAgY29uc3Qge3ZhbHVlLCBzaXplfSA9IGF0dHJpYnV0ZTtcbiAgICAvLyBhZGQgMSB0byBpbmRleCB0byBzZXBlcmF0ZSBmcm9tIG5vIHNlbGVjdGlvblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtSW5zdGFuY2VzOyBpKyspIHtcbiAgICAgIGNvbnN0IHBpY2tpbmdDb2xvciA9IHRoaXMuZW5jb2RlUGlja2luZ0NvbG9yKGkpO1xuICAgICAgdmFsdWVbaSAqIHNpemUgKyAwXSA9IHBpY2tpbmdDb2xvclswXTtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMV0gPSBwaWNraW5nQ29sb3JbMV07XG4gICAgICB2YWx1ZVtpICogc2l6ZSArIDJdID0gcGlja2luZ0NvbG9yWzJdO1xuICAgIH1cbiAgfVxuXG4gIGRlY29kZVBpY2tpbmdDb2xvcihjb2xvcikge1xuICAgIGFzc2VydChjb2xvciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpO1xuICAgIGNvbnN0IFtpMSwgaTIsIGkzXSA9IGNvbG9yO1xuICAgIC8vIDEgd2FzIGFkZGVkIHRvIHNlcGVyYXRlIGZyb20gbm8gc2VsZWN0aW9uXG4gICAgY29uc3QgaW5kZXggPSBpMSArIGkyICogMjU2ICsgaTMgKiA2NTUzNiAtIDE7XG4gICAgcmV0dXJuIGluZGV4O1xuICB9XG5cbiAgZW5jb2RlUGlja2luZ0NvbG9yKGkpIHtcbiAgICByZXR1cm4gW1xuICAgICAgKGkgKyAxKSAlIDI1NixcbiAgICAgIE1hdGguZmxvb3IoKGkgKyAxKSAvIDI1NikgJSAyNTYsXG4gICAgICBNYXRoLmZsb29yKChpICsgMSkgLyAyNTYgLyAyNTYpICUgMjU2XG4gICAgXTtcbiAgfVxuXG4gIC8vIE92ZXJyaWRlIHRvIGFkZCBvciBtb2RpZnkgaW5mbyBpbiBzdWJsYXllclxuICAvLyBUaGUgc3VibGF5ZXIgbWF5IGtub3cgd2hhdCBsYXQsbG9uIGNvcnJlc3BvbmRzIHRvIHVzaW5nIG1hdGggZXRjXG4gIC8vIGV2ZW4gd2hlbiBwaWNraW5nIGRvZXMgbm90IHdvcmtcbiAgb25HZXRIb3ZlckluZm8oaW5mbykge1xuICAgIGNvbnN0IHtjb2xvcn0gPSBpbmZvO1xuICAgIGluZm8uaW5kZXggPSB0aGlzLmRlY29kZVBpY2tpbmdDb2xvcihjb2xvcik7XG4gICAgaW5mby5nZW9Db29yZHMgPSB0aGlzLnVucHJvamVjdCh7eDogaW5mby54LCB5OiBpbmZvLnl9KTtcbiAgICByZXR1cm4gaW5mbztcbiAgfVxuXG4gIG9uSG92ZXIoaW5mbykge1xuICAgIGNvbnN0IHtjb2xvcn0gPSBpbmZvO1xuICAgIGNvbnN0IHNlbGVjdGVkUGlja2luZ0NvbG9yID0gbmV3IEZsb2F0MzJBcnJheSgzKTtcbiAgICBzZWxlY3RlZFBpY2tpbmdDb2xvclswXSA9IGNvbG9yWzBdO1xuICAgIHNlbGVjdGVkUGlja2luZ0NvbG9yWzFdID0gY29sb3JbMV07XG4gICAgc2VsZWN0ZWRQaWNraW5nQ29sb3JbMl0gPSBjb2xvclsyXTtcbiAgICB0aGlzLnNldFVuaWZvcm1zKHtzZWxlY3RlZFBpY2tpbmdDb2xvcn0pO1xuXG4gICAgaW5mbyA9IHRoaXMub25HZXRIb3ZlckluZm8oaW5mbyk7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMub25Ib3ZlcihpbmZvKTtcbiAgfVxuXG4gIG9uQ2xpY2soaW5mbykge1xuICAgIGluZm8gPSB0aGlzLm9uR2V0SG92ZXJJbmZvKGluZm8pO1xuICAgIHJldHVybiB0aGlzLnByb3BzLm9uQ2xpY2soaW5mbyk7XG4gIH1cblxuICAvLyBJTlRFUk5BTCBNRVRIT0RTXG5cbiAgLy8gU2V0IHVwIGF0dHJpYnV0ZXMgcmVsYXRpbmcgdG8gdGhlIHByaW1pdGl2ZSBpdHNlbGYgKG5vdCB0aGUgaW5zdGFuY2VzKVxuICBfaW5pdGlhbGl6ZVByaW1pdGl2ZUF0dHJpYnV0ZXMoKSB7XG4gICAgY29uc3Qge2dsLCBtb2RlbCwgYXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuXG4gICAgLy8gVE9ETyAtIHRoaXMgdW5wYWNrcyBhbmQgcmVwYWNrcyB0aGUgYXR0cmlidXRlcywgc2VlbXMgdW5uZWNlc3NhcnlcbiAgICBpZiAobW9kZWwuZ2VvbWV0cnkuaGFzQXR0cmlidXRlKCd2ZXJ0aWNlcycpKSB7XG4gICAgICBjb25zdCB2ZXJ0aWNlcyA9IG1vZGVsLmdlb21ldHJ5LmdldEFycmF5KCd2ZXJ0aWNlcycpO1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5hZGRWZXJ0aWNlcyh2ZXJ0aWNlcyk7XG4gICAgfVxuXG4gICAgaWYgKG1vZGVsLmdlb21ldHJ5Lmhhc0F0dHJpYnV0ZSgnbm9ybWFscycpKSB7XG4gICAgICBjb25zdCBub3JtYWxzID0gbW9kZWwuZ2VvbWV0cnkuZ2V0QXJyYXkoJ25vcm1hbHMnKTtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkTm9ybWFscyhub3JtYWxzKTtcbiAgICB9XG5cbiAgICBpZiAobW9kZWwuZ2VvbWV0cnkuaGFzQXR0cmlidXRlKCdpbmRpY2VzJykpIHtcbiAgICAgIGNvbnN0IGluZGljZXMgPSBtb2RlbC5nZW9tZXRyeS5nZXRBcnJheSgnaW5kaWNlcycpO1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbmRpY2VzKGluZGljZXMsIGdsKTtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlTW9kZWwoe2dsfSkge1xuICAgIGNvbnN0IHttb2RlbCwgYXR0cmlidXRlTWFuYWdlciwgdW5pZm9ybXN9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGFzc2VydChtb2RlbCk7XG4gICAgbW9kZWwuc2V0QXR0cmlidXRlcyhhdHRyaWJ1dGVNYW5hZ2VyLmdldEF0dHJpYnV0ZXMoKSk7XG4gICAgbW9kZWwuc2V0VW5pZm9ybXModW5pZm9ybXMpO1xuICAgIC8vIHdoZXRoZXIgY3VycmVudCBsYXllciByZXNwb25kcyB0byBtb3VzZSBldmVudHNcbiAgICBtb2RlbC5zZXRQaWNrYWJsZSh0aGlzLnByb3BzLmlzUGlja2FibGUpO1xuICB9XG5cbiAgY2hlY2tQcm9wKHByb3BlcnR5LCBwcm9wZXJ0eU5hbWUpIHtcbiAgICBpZiAoIXByb3BlcnR5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3BlcnR5ICR7cHJvcGVydHlOYW1lfSB1bmRlZmluZWQgaW4gbGF5ZXIgJHt0aGlzLmlkfWApO1xuICAgIH1cbiAgfVxuXG4gIC8vIE1BUCBMQVlFUiBGVU5DVElPTkFMSVRZXG5cbiAgc2V0Vmlld3BvcnQoKSB7XG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHQsIGxhdGl0dWRlLCBsb25naXR1ZGUsIHpvb219ID0gdGhpcy5wcm9wcztcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHZpZXdwb3J0OiBuZXcgZmxhdFdvcmxkLlZpZXdwb3J0KHdpZHRoLCBoZWlnaHQpLFxuICAgICAgbWVyY2F0b3I6IFZpZXdwb3J0TWVyY2F0b3Ioe1xuICAgICAgICB3aWR0aCwgaGVpZ2h0LCBsYXRpdHVkZSwgbG9uZ2l0dWRlLCB6b29tLFxuICAgICAgICB0aWxlU2l6ZTogNTEyXG4gICAgICB9KVxuICAgIH0pO1xuICAgIGNvbnN0IHt4LCB5fSA9IHRoaXMuc3RhdGUudmlld3BvcnQ7XG4gICAgdGhpcy5zZXRVbmlmb3Jtcyh7XG4gICAgICB2aWV3cG9ydDogW3gsIHksIHdpZHRoLCBoZWlnaHRdLFxuICAgICAgbWFwVmlld3BvcnQ6IFtsb25naXR1ZGUsIGxhdGl0dWRlLCB6b29tLCBmbGF0V29ybGQuc2l6ZV1cbiAgICB9KTtcbiAgICBsb2coMywgdGhpcy5zdGF0ZS52aWV3cG9ydCwgbGF0aXR1ZGUsIGxvbmdpdHVkZSwgem9vbSk7XG4gIH1cblxuICAvKipcbiAgICogUG9zaXRpb24gY29udmVyc2lvbiBpcyBkb25lIGluIHNoYWRlciwgc28gaW4gbWFueSBjYXNlcyB0aGVyZSBpcyBubyBuZWVkXG4gICAqIGZvciB0aGlzIGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBsYXRMbmcgLSBFaXRoZXIgW2xhdCxsbmddIG9yIHtsYXQsIGxvbn1cbiAgICogQHJldHVybiB7T2JqZWN0fSAtIHgsIHlcbiAgICovXG4gIHByb2plY3QobGF0TG5nKSB7XG4gICAgY29uc3Qge21lcmNhdG9yfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgW3gsIHldID0gQXJyYXkuaXNBcnJheShsYXRMbmcpID9cbiAgICAgIG1lcmNhdG9yLnByb2plY3QoW2xhdExuZ1sxXSwgbGF0TG5nWzBdXSkgOlxuICAgICAgbWVyY2F0b3IucHJvamVjdChbbGF0TG5nLmxvbiwgbGF0TG5nLmxhdF0pO1xuICAgIHJldHVybiB7eCwgeX07XG4gIH1cblxuICB1bnByb2plY3QoeHkpIHtcbiAgICBjb25zdCB7bWVyY2F0b3J9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBbbG9uLCBsYXRdID0gQXJyYXkuaXNBcnJheSh4eSkgP1xuICAgICAgbWVyY2F0b3IudW5wcm9qZWN0KHh5KSA6XG4gICAgICBtZXJjYXRvci51bnByb2plY3QoW3h5LngsIHh5LnldKTtcbiAgICByZXR1cm4ge2xhdCwgbG9ufTtcbiAgfVxuXG4gIHNjcmVlblRvU3BhY2Uoe3gsIHl9KSB7XG4gICAgY29uc3Qge3ZpZXdwb3J0fSA9IHRoaXMuc3RhdGU7XG4gICAgcmV0dXJuIHZpZXdwb3J0LnNjcmVlblRvU3BhY2Uoe3gsIHl9KTtcbiAgfVxuXG59XG4iXX0=