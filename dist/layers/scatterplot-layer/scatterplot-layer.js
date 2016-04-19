'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _layer = require('../../layer');

var _layer2 = _interopRequireDefault(_layer);

var _luma = require('luma.gl');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright (c) 2015 Uber Technologies, Inc.
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

var glslify = require('glslify');

var ATTRIBUTES = {
  positions: { size: 3, '0': 'x', '1': 'y', '2': 'unused' },
  colors: { size: 3, '0': 'red', '1': 'green', '2': 'blue' }
};

var ScatterplotLayer = function (_Layer) {
  _inherits(ScatterplotLayer, _Layer);

  _createClass(ScatterplotLayer, null, [{
    key: 'attributes',
    get: function get() {
      return ATTRIBUTES;
    }

    /*
     * @classdesc
     * ScatterplotLayer
     *
     * @class
     * @param {object} props
     * @param {number} props.radius - point radius
     */

  }]);

  function ScatterplotLayer(props) {
    _classCallCheck(this, ScatterplotLayer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ScatterplotLayer).call(this, props));
  }

  _createClass(ScatterplotLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.state.gl;
      var attributeManager = this.state.attributeManager;


      this.setState({
        model: this.getModel(gl)
      });

      attributeManager.addInstanced(ATTRIBUTES, {
        positions: { update: this.calculatePositions },
        colors: { update: this.calculateColors }
      });
    }
  }, {
    key: 'didMount',
    value: function didMount() {
      this.updateUniforms();
    }
  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(oldProps, newProps) {
      _get(Object.getPrototypeOf(ScatterplotLayer.prototype), 'willReceiveProps', this).call(this, oldProps, newProps);
      this.updateUniforms();
    }
  }, {
    key: 'getModel',
    value: function getModel(gl) {
      var NUM_SEGMENTS = 16;
      var PI2 = Math.PI * 2;

      var vertices = [];
      for (var i = 0; i < NUM_SEGMENTS; i++) {
        vertices = [].concat(_toConsumableArray(vertices), [Math.cos(PI2 * i / NUM_SEGMENTS), Math.sin(PI2 * i / NUM_SEGMENTS), 0]);
      }

      return new _luma.Model({
        program: new _luma.Program(gl, {
          vs: glslify('./scatterplot-layer-vertex.glsl'),
          fs: glslify('./scatterplot-layer-fragment.glsl'),
          id: 'scatterplot'
        }),
        geometry: new _luma.Geometry({
          drawMode: 'TRIANGLE_FAN',
          vertices: new Float32Array(vertices)
        }),
        instanced: true
      });
    }
  }, {
    key: 'updateUniforms',
    value: function updateUniforms() {
      this.calculateRadius();
      var radius = this.state.radius;

      this.setUniforms({
        radius: radius
      });
    }
  }, {
    key: 'calculatePositions',
    value: function calculatePositions(attribute) {
      var data = this.props.data;
      var value = attribute.value;
      var size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var point = _step.value;

          value[i + 0] = point.position.x;
          value[i + 1] = point.position.y;
          value[i + 2] = point.position.z;
          i += size;
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
    }
  }, {
    key: 'calculateColors',
    value: function calculateColors(attribute) {
      var data = this.props.data;
      var value = attribute.value;
      var size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var point = _step2.value;

          value[i + 0] = point.color[0];
          value[i + 1] = point.color[1];
          value[i + 2] = point.color[2];
          i += size;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: 'calculateRadius',
    value: function calculateRadius() {
      // use radius if specified
      if (this.props.radius) {
        this.state.radius = this.props.radius;
        return;
      }

      var pixel0 = this.project({ lon: -122, lat: 37.5 });
      var pixel1 = this.project({ lon: -122, lat: 37.5002 });

      var space0 = this.screenToSpace(pixel0);
      var space1 = this.screenToSpace(pixel1);

      var dx = space0.x - space1.x;
      var dy = space0.y - space1.y;

      this.state.radius = Math.max(Math.sqrt(dx * dx + dy * dy), 2.0);
    }
  }]);

  return ScatterplotLayer;
}(_layer2.default);

exports.default = ScatterplotLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvc2NhdHRlcnBsb3QtbGF5ZXIvc2NhdHRlcnBsb3QtbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JBLElBQU0sVUFBVSxRQUFRLFNBQVIsQ0FBVjs7QUFFTixJQUFNLGFBQWE7QUFDakIsYUFBVyxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssR0FBTCxFQUFVLEtBQUssR0FBTCxFQUFVLEtBQUssUUFBTCxFQUF6QztBQUNBLFVBQVEsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLEtBQUwsRUFBWSxLQUFLLE9BQUwsRUFBYyxLQUFLLE1BQUwsRUFBNUM7Q0FGSTs7SUFLZTs7Ozs7d0JBRUs7QUFDdEIsYUFBTyxVQUFQLENBRHNCOzs7Ozs7Ozs7Ozs7OztBQVl4QixXQWRtQixnQkFjbkIsQ0FBWSxLQUFaLEVBQW1COzBCQWRBLGtCQWNBOztrRUFkQSw2QkFlWCxRQURXO0dBQW5COztlQWRtQjs7c0NBa0JEO1VBQ1QsS0FBTSxLQUFLLEtBQUwsQ0FBTixHQURTO1VBRVQsbUJBQW9CLEtBQUssS0FBTCxDQUFwQixpQkFGUzs7O0FBSWhCLFdBQUssUUFBTCxDQUFjO0FBQ1osZUFBTyxLQUFLLFFBQUwsQ0FBYyxFQUFkLENBQVA7T0FERixFQUpnQjs7QUFRaEIsdUJBQWlCLFlBQWpCLENBQThCLFVBQTlCLEVBQTBDO0FBQ3hDLG1CQUFXLEVBQUMsUUFBUSxLQUFLLGtCQUFMLEVBQXBCO0FBQ0EsZ0JBQVEsRUFBQyxRQUFRLEtBQUssZUFBTCxFQUFqQjtPQUZGLEVBUmdCOzs7OytCQWNQO0FBQ1QsV0FBSyxjQUFMLEdBRFM7Ozs7cUNBSU0sVUFBVSxVQUFVO0FBQ25DLGlDQXJDaUIsa0VBcUNNLFVBQVUsU0FBakMsQ0FEbUM7QUFFbkMsV0FBSyxjQUFMLEdBRm1DOzs7OzZCQUs1QixJQUFJO0FBQ1gsVUFBTSxlQUFlLEVBQWYsQ0FE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T0FBTyxDQUFQLEdBQVcsT0FBTyxDQUFQLENBZE47O0FBZ0JoQixXQUFLLEtBQUwsQ0FBVyxNQUFYLEdBQW9CLEtBQUssR0FBTCxDQUFTLEtBQUssSUFBTCxDQUFVLEtBQUssRUFBTCxHQUFVLEtBQUssRUFBTCxDQUE3QixFQUF1QyxHQUF2QyxDQUFwQixDQWhCZ0I7Ozs7U0FyR0MiLCJmaWxlIjoic2NhdHRlcnBsb3QtbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgTGF5ZXIgZnJvbSAnLi4vLi4vbGF5ZXInO1xuaW1wb3J0IHtNb2RlbCwgUHJvZ3JhbSwgR2VvbWV0cnl9IGZyb20gJ2x1bWEuZ2wnO1xuY29uc3QgZ2xzbGlmeSA9IHJlcXVpcmUoJ2dsc2xpZnknKTtcblxuY29uc3QgQVRUUklCVVRFUyA9IHtcbiAgcG9zaXRpb25zOiB7c2l6ZTogMywgJzAnOiAneCcsICcxJzogJ3knLCAnMic6ICd1bnVzZWQnfSxcbiAgY29sb3JzOiB7c2l6ZTogMywgJzAnOiAncmVkJywgJzEnOiAnZ3JlZW4nLCAnMic6ICdibHVlJ31cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjYXR0ZXJwbG90TGF5ZXIgZXh0ZW5kcyBMYXllciB7XG5cbiAgc3RhdGljIGdldCBhdHRyaWJ1dGVzKCkge1xuICAgIHJldHVybiBBVFRSSUJVVEVTO1xuICB9XG5cbiAgLypcbiAgICogQGNsYXNzZGVzY1xuICAgKiBTY2F0dGVycGxvdExheWVyXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge29iamVjdH0gcHJvcHNcbiAgICogQHBhcmFtIHtudW1iZXJ9IHByb3BzLnJhZGl1cyAtIHBvaW50IHJhZGl1c1xuICAgKi9cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgY29uc3Qge2dsfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbW9kZWw6IHRoaXMuZ2V0TW9kZWwoZ2wpXG4gICAgfSk7XG5cbiAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZChBVFRSSUJVVEVTLCB7XG4gICAgICBwb3NpdGlvbnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUG9zaXRpb25zfSxcbiAgICAgIGNvbG9yczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVDb2xvcnN9XG4gICAgfSk7XG4gIH1cblxuICBkaWRNb3VudCgpIHtcbiAgICB0aGlzLnVwZGF0ZVVuaWZvcm1zKCk7XG4gIH1cblxuICB3aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIHN1cGVyLndpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKTtcbiAgICB0aGlzLnVwZGF0ZVVuaWZvcm1zKCk7XG4gIH1cblxuICBnZXRNb2RlbChnbCkge1xuICAgIGNvbnN0IE5VTV9TRUdNRU5UUyA9IDE2O1xuICAgIGNvbnN0IFBJMiA9IE1hdGguUEkgKiAyO1xuXG4gICAgbGV0IHZlcnRpY2VzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBOVU1fU0VHTUVOVFM7IGkrKykge1xuICAgICAgdmVydGljZXMgPSBbXG4gICAgICAgIC4uLnZlcnRpY2VzLFxuICAgICAgICBNYXRoLmNvcyhQSTIgKiBpIC8gTlVNX1NFR01FTlRTKSxcbiAgICAgICAgTWF0aC5zaW4oUEkyICogaSAvIE5VTV9TRUdNRU5UUyksXG4gICAgICAgIDBcbiAgICAgIF07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBNb2RlbCh7XG4gICAgICBwcm9ncmFtOiBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICB2czogZ2xzbGlmeSgnLi9zY2F0dGVycGxvdC1sYXllci12ZXJ0ZXguZ2xzbCcpLFxuICAgICAgICBmczogZ2xzbGlmeSgnLi9zY2F0dGVycGxvdC1sYXllci1mcmFnbWVudC5nbHNsJyksXG4gICAgICAgIGlkOiAnc2NhdHRlcnBsb3QnXG4gICAgICB9KSxcbiAgICAgIGdlb21ldHJ5OiBuZXcgR2VvbWV0cnkoe1xuICAgICAgICBkcmF3TW9kZTogJ1RSSUFOR0xFX0ZBTicsXG4gICAgICAgIHZlcnRpY2VzOiBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKVxuICAgICAgfSksXG4gICAgICBpbnN0YW5jZWQ6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVVuaWZvcm1zKCkge1xuICAgIHRoaXMuY2FsY3VsYXRlUmFkaXVzKCk7XG4gICAgY29uc3Qge3JhZGl1c30gPSB0aGlzLnN0YXRlO1xuICAgIHRoaXMuc2V0VW5pZm9ybXMoe1xuICAgICAgcmFkaXVzXG4gICAgfSk7XG4gIH1cblxuICBjYWxjdWxhdGVQb3NpdGlvbnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIGRhdGEpIHtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IHBvaW50LnBvc2l0aW9uLng7XG4gICAgICB2YWx1ZVtpICsgMV0gPSBwb2ludC5wb3NpdGlvbi55O1xuICAgICAgdmFsdWVbaSArIDJdID0gcG9pbnQucG9zaXRpb24uejtcbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVDb2xvcnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIGRhdGEpIHtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IHBvaW50LmNvbG9yWzBdO1xuICAgICAgdmFsdWVbaSArIDFdID0gcG9pbnQuY29sb3JbMV07XG4gICAgICB2YWx1ZVtpICsgMl0gPSBwb2ludC5jb2xvclsyXTtcbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVSYWRpdXMoKSB7XG4gICAgLy8gdXNlIHJhZGl1cyBpZiBzcGVjaWZpZWRcbiAgICBpZiAodGhpcy5wcm9wcy5yYWRpdXMpIHtcbiAgICAgIHRoaXMuc3RhdGUucmFkaXVzID0gdGhpcy5wcm9wcy5yYWRpdXM7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGl4ZWwwID0gdGhpcy5wcm9qZWN0KHtsb246IC0xMjIsIGxhdDogMzcuNX0pO1xuICAgIGNvbnN0IHBpeGVsMSA9IHRoaXMucHJvamVjdCh7bG9uOiAtMTIyLCBsYXQ6IDM3LjUwMDJ9KTtcblxuICAgIGNvbnN0IHNwYWNlMCA9IHRoaXMuc2NyZWVuVG9TcGFjZShwaXhlbDApO1xuICAgIGNvbnN0IHNwYWNlMSA9IHRoaXMuc2NyZWVuVG9TcGFjZShwaXhlbDEpO1xuXG4gICAgY29uc3QgZHggPSBzcGFjZTAueCAtIHNwYWNlMS54O1xuICAgIGNvbnN0IGR5ID0gc3BhY2UwLnkgLSBzcGFjZTEueTtcblxuICAgIHRoaXMuc3RhdGUucmFkaXVzID0gTWF0aC5tYXgoTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KSwgMi4wKTtcbiAgfVxuXG59XG4iXX0=