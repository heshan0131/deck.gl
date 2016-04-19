'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

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

var HexagonLayer = function (_Layer) {
  _inherits(HexagonLayer, _Layer);

  /**
   * @classdesc
   * HexagonLayer
   *
   * @class
   * @param {object} opts
   *
   * @param {number} opts.dotRadius - hexagon radius
   * @param {number} opts.elevation - hexagon height
   *
   * @param {function} opts.onHexagonHovered(index, e) - popup selected index
   * @param {function} opts.onHexagonClicked(index, e) - popup selected index
   */

  function HexagonLayer(opts) {
    _classCallCheck(this, HexagonLayer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(HexagonLayer).call(this, _extends({
      dotRadius: 10,
      elevation: 101
    }, opts)));
  }

  _createClass(HexagonLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      var _state = this.state;
      var gl = _state.gl;
      var attributeManager = _state.attributeManager;


      this.setState({
        model: this.getModel(gl)
      });

      attributeManager.addInstanced(ATTRIBUTES, {
        positions: { update: this.calculatePositions },
        colors: { update: this.calculateColors }
      });

      this.calculateRadiusAndAngle();
    }
  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(oldProps, newProps) {
      _get(Object.getPrototypeOf(HexagonLayer.prototype), 'willReceiveProps', this).call(this, oldProps, newProps);

      var _state2 = this.state;
      var dataChanged = _state2.dataChanged;
      var viewportChanged = _state2.viewportChanged;
      var attributeManager = _state2.attributeManager;


      if (dataChanged || viewportChanged) {
        attributeManager.invalidate('positions');
        this.calculateRadiusAndAngle();
      }
      if (dataChanged) {
        attributeManager.invalidate('colors');
      }
    }
  }, {
    key: 'getModel',
    value: function getModel(gl) {
      var NUM_SEGMENTS = 6;
      var PI2 = Math.PI * 2;

      var vertices = [];
      for (var i = 0; i < NUM_SEGMENTS; i++) {
        vertices = [].concat(_toConsumableArray(vertices), [Math.cos(PI2 * i / NUM_SEGMENTS), Math.sin(PI2 * i / NUM_SEGMENTS), 0]);
      }

      return new _luma.Model({
        program: new _luma.Program(gl, {
          vs: glslify('./hexagon-layer-vertex.glsl'),
          fs: glslify('./hexagon-layer-fragment.glsl'),
          id: 'hexagon'
        }),
        geometry: new _luma.Geometry({
          id: this.props.id,
          drawMode: 'TRIANGLE_FAN',
          vertices: new Float32Array(vertices)
        }),
        instanced: true
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
          var hexagon = _step.value;

          value[i + 0] = hexagon.centroid.x;
          value[i + 1] = hexagon.centroid.y;
          value[i + 2] = this.props.elevation;
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

      var i = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var hexagon = _step2.value;

          value[i + 0] = hexagon.color[0];
          value[i + 1] = hexagon.color[1];
          value[i + 2] = hexagon.color[2];
          i += 3;
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

    // TODO this is the only place that uses hexagon vertices
    // consider move radius and angle calculation to the shader

  }, {
    key: 'calculateRadiusAndAngle',
    value: function calculateRadiusAndAngle() {
      var data = this.props.data;

      if (!data || data.length === 0) {
        return;
      }

      var vertices = data[0].vertices;
      var vertex0 = vertices[0];
      var vertex3 = vertices[3];

      // transform to space coordinates
      var spaceCoord0 = this.project({ lat: vertex0[1], lon: vertex0[0] });
      var spaceCoord3 = this.project({ lat: vertex3[1], lon: vertex3[0] });

      // map from space coordinates to screen coordinates
      var screenCoord0 = this.screenToSpace(spaceCoord0);
      var screenCoord3 = this.screenToSpace(spaceCoord3);

      // distance between two close centroids
      var dx = screenCoord0.x - screenCoord3.x;
      var dy = screenCoord0.y - screenCoord3.y;
      var dxy = Math.sqrt(dx * dx + dy * dy);

      this.setUniforms({
        // Calculate angle that the perpendicular hexagon vertex axis is tilted
        angle: Math.acos(dx / dxy) * -Math.sign(dy),
        // Allow user to fine tune radius
        radius: dxy / 2 * Math.min(1, this.props.dotRadius)
      });
    }
  }]);

  return HexagonLayer;
}(_layer2.default);

exports.default = HexagonLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvaGV4YWdvbi1sYXllci9oZXhhZ29uLWxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JBLElBQU0sVUFBVSxRQUFRLFNBQVIsQ0FBVjs7QUFFTixJQUFNLGFBQWE7QUFDakIsYUFBVyxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssR0FBTCxFQUFVLEtBQUssR0FBTCxFQUFVLEtBQUssUUFBTCxFQUF6QztBQUNBLFVBQVEsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLEtBQUwsRUFBWSxLQUFLLE9BQUwsRUFBYyxLQUFLLE1BQUwsRUFBNUM7Q0FGSTs7SUFLZTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFjbkIsV0FkbUIsWUFjbkIsQ0FBWSxJQUFaLEVBQWtCOzBCQWRDLGNBY0Q7O2tFQWRDO0FBZ0JmLGlCQUFXLEVBQVg7QUFDQSxpQkFBVyxHQUFYO09BQ0csUUFKVztHQUFsQjs7ZUFkbUI7O3NDQXNCRDttQkFDZSxLQUFLLEtBQUwsQ0FEZjtVQUNULGVBRFM7VUFDTCwyQ0FESzs7O0FBR2hCLFdBQUssUUFBTCxDQUFjO0FBQ1osZUFBTyxLQUFLLFFBQUwsQ0FBYyxFQUFkLENBQVA7T0FERixFQUhnQjs7QUFPaEIsdUJBQWlCLFlBQWpCLENBQThCLFVBQTlCLEVBQTBDO0FBQ3hDLG1CQUFXLEVBQUMsUUFBUSxLQUFLLGtCQUFMLEVBQXBCO0FBQ0EsZ0JBQVEsRUFBQyxRQUFRLEtBQUssZUFBTCxFQUFqQjtPQUZGLEVBUGdCOztBQVloQixXQUFLLHVCQUFMLEdBWmdCOzs7O3FDQWVELFVBQVUsVUFBVTtBQUNuQyxpQ0F0Q2lCLDhEQXNDTSxVQUFVLFNBQWpDLENBRG1DOztvQkFHc0IsS0FBSyxLQUFMLENBSHRCO1VBRzVCLGtDQUg0QjtVQUdmLDBDQUhlO1VBR0UsNENBSEY7OztBQUtuQyxVQUFJLGVBQWUsZUFBZixFQUFnQztBQUNs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UUFBUSxDQUFSLENBQUwsRUFBaUIsS0FBSyxRQUFRLENBQVIsQ0FBTCxFQUEvQixDQUFkOzs7QUFaa0IsVUFlbEIsZUFBZSxLQUFLLGFBQUwsQ0FBbUIsV0FBbkIsQ0FBZixDQWZrQjtBQWdCeEIsVUFBTSxlQUFlLEtBQUssYUFBTCxDQUFtQixXQUFuQixDQUFmOzs7QUFoQmtCLFVBbUJsQixLQUFLLGFBQWEsQ0FBYixHQUFpQixhQUFhLENBQWIsQ0FuQko7QUFvQnhCLFVBQU0sS0FBSyxhQUFhLENBQWIsR0FBaUIsYUFBYSxDQUFiLENBcEJKO0FBcUJ4QixVQUFNLE1BQU0sS0FBSyxJQUFMLENBQVUsS0FBSyxFQUFMLEdBQVUsS0FBSyxFQUFMLENBQTFCLENBckJrQjs7QUF1QnhCLFdBQUssV0FBTCxDQUFpQjs7QUFFZixlQUFPLEtBQUssSUFBTCxDQUFVLEtBQUssR0FBTCxDQUFWLEdBQXNCLENBQUMsS0FBSyxJQUFMLENBQVUsRUFBVixDQUFEOztBQUU3QixnQkFBUSxNQUFNLENBQU4sR0FBVSxLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksS0FBSyxLQUFMLENBQVcsU0FBWCxDQUF0QjtPQUpWLEVBdkJ3Qjs7OztTQTFHUCIsImZpbGUiOiJoZXhhZ29uLWxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IExheWVyIGZyb20gJy4uLy4uL2xheWVyJztcbmltcG9ydCB7TW9kZWwsIFByb2dyYW0sIEdlb21ldHJ5fSBmcm9tICdsdW1hLmdsJztcbmNvbnN0IGdsc2xpZnkgPSByZXF1aXJlKCdnbHNsaWZ5Jyk7XG5cbmNvbnN0IEFUVFJJQlVURVMgPSB7XG4gIHBvc2l0aW9uczoge3NpemU6IDMsICcwJzogJ3gnLCAnMSc6ICd5JywgJzInOiAndW51c2VkJ30sXG4gIGNvbG9yczoge3NpemU6IDMsICcwJzogJ3JlZCcsICcxJzogJ2dyZWVuJywgJzInOiAnYmx1ZSd9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZXhhZ29uTGF5ZXIgZXh0ZW5kcyBMYXllciB7XG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIEhleGFnb25MYXllclxuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdHNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9wdHMuZG90UmFkaXVzIC0gaGV4YWdvbiByYWRpdXNcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9wdHMuZWxldmF0aW9uIC0gaGV4YWdvbiBoZWlnaHRcbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3B0cy5vbkhleGFnb25Ib3ZlcmVkKGluZGV4LCBlKSAtIHBvcHVwIHNlbGVjdGVkIGluZGV4XG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9wdHMub25IZXhhZ29uQ2xpY2tlZChpbmRleCwgZSkgLSBwb3B1cCBzZWxlY3RlZCBpbmRleFxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIHN1cGVyKHtcbiAgICAgIGRvdFJhZGl1czogMTAsXG4gICAgICBlbGV2YXRpb246IDEwMSxcbiAgICAgIC4uLm9wdHNcbiAgICB9KTtcbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBjb25zdCB7Z2wsIGF0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbW9kZWw6IHRoaXMuZ2V0TW9kZWwoZ2wpXG4gICAgfSk7XG5cbiAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZChBVFRSSUJVVEVTLCB7XG4gICAgICBwb3NpdGlvbnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUG9zaXRpb25zfSxcbiAgICAgIGNvbG9yczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVDb2xvcnN9XG4gICAgfSk7XG5cbiAgICB0aGlzLmNhbGN1bGF0ZVJhZGl1c0FuZEFuZ2xlKCk7XG4gIH1cblxuICB3aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIHN1cGVyLndpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKTtcblxuICAgIGNvbnN0IHtkYXRhQ2hhbmdlZCwgdmlld3BvcnRDaGFuZ2VkLCBhdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBpZiAoZGF0YUNoYW5nZWQgfHwgdmlld3BvcnRDaGFuZ2VkKSB7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGUoJ3Bvc2l0aW9ucycpO1xuICAgICAgdGhpcy5jYWxjdWxhdGVSYWRpdXNBbmRBbmdsZSgpO1xuICAgIH1cbiAgICBpZiAoZGF0YUNoYW5nZWQpIHtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZSgnY29sb3JzJyk7XG4gICAgfVxuICB9XG5cbiAgZ2V0TW9kZWwoZ2wpIHtcbiAgICBjb25zdCBOVU1fU0VHTUVOVFMgPSA2O1xuICAgIGNvbnN0IFBJMiA9IE1hdGguUEkgKiAyO1xuXG4gICAgbGV0IHZlcnRpY2VzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBOVU1fU0VHTUVOVFM7IGkrKykge1xuICAgICAgdmVydGljZXMgPSBbXG4gICAgICAgIC4uLnZlcnRpY2VzLFxuICAgICAgICBNYXRoLmNvcyhQSTIgKiBpIC8gTlVNX1NFR01FTlRTKSxcbiAgICAgICAgTWF0aC5zaW4oUEkyICogaSAvIE5VTV9TRUdNRU5UUyksXG4gICAgICAgIDBcbiAgICAgIF07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBNb2RlbCh7XG4gICAgICBwcm9ncmFtOiBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICB2czogZ2xzbGlmeSgnLi9oZXhhZ29uLWxheWVyLXZlcnRleC5nbHNsJyksXG4gICAgICAgIGZzOiBnbHNsaWZ5KCcuL2hleGFnb24tbGF5ZXItZnJhZ21lbnQuZ2xzbCcpLFxuICAgICAgICBpZDogJ2hleGFnb24nXG4gICAgICB9KSxcbiAgICAgIGdlb21ldHJ5OiBuZXcgR2VvbWV0cnkoe1xuICAgICAgICBpZDogdGhpcy5wcm9wcy5pZCxcbiAgICAgICAgZHJhd01vZGU6ICdUUklBTkdMRV9GQU4nLFxuICAgICAgICB2ZXJ0aWNlczogbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcylcbiAgICAgIH0pLFxuICAgICAgaW5zdGFuY2VkOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICBjYWxjdWxhdGVQb3NpdGlvbnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IGhleGFnb24gb2YgZGF0YSkge1xuICAgICAgdmFsdWVbaSArIDBdID0gaGV4YWdvbi5jZW50cm9pZC54O1xuICAgICAgdmFsdWVbaSArIDFdID0gaGV4YWdvbi5jZW50cm9pZC55O1xuICAgICAgdmFsdWVbaSArIDJdID0gdGhpcy5wcm9wcy5lbGV2YXRpb247XG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBoZXhhZ29uIG9mIGRhdGEpIHtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IGhleGFnb24uY29sb3JbMF07XG4gICAgICB2YWx1ZVtpICsgMV0gPSBoZXhhZ29uLmNvbG9yWzFdO1xuICAgICAgdmFsdWVbaSArIDJdID0gaGV4YWdvbi5jb2xvclsyXTtcbiAgICAgIGkgKz0gMztcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPIHRoaXMgaXMgdGhlIG9ubHkgcGxhY2UgdGhhdCB1c2VzIGhleGFnb24gdmVydGljZXNcbiAgLy8gY29uc2lkZXIgbW92ZSByYWRpdXMgYW5kIGFuZ2xlIGNhbGN1bGF0aW9uIHRvIHRoZSBzaGFkZXJcbiAgY2FsY3VsYXRlUmFkaXVzQW5kQW5nbGUoKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoIWRhdGEgfHwgZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB2ZXJ0aWNlcyA9IGRhdGFbMF0udmVydGljZXM7XG4gICAgY29uc3QgdmVydGV4MCA9IHZlcnRpY2VzWzBdO1xuICAgIGNvbnN0IHZlcnRleDMgPSB2ZXJ0aWNlc1szXTtcblxuICAgIC8vIHRyYW5zZm9ybSB0byBzcGFjZSBjb29yZGluYXRlc1xuICAgIGNvbnN0IHNwYWNlQ29vcmQwID0gdGhpcy5wcm9qZWN0KHtsYXQ6IHZlcnRleDBbMV0sIGxvbjogdmVydGV4MFswXX0pO1xuICAgIGNvbnN0IHNwYWNlQ29vcmQzID0gdGhpcy5wcm9qZWN0KHtsYXQ6IHZlcnRleDNbMV0sIGxvbjogdmVydGV4M1swXX0pO1xuXG4gICAgLy8gbWFwIGZyb20gc3BhY2UgY29vcmRpbmF0ZXMgdG8gc2NyZWVuIGNvb3JkaW5hdGVzXG4gICAgY29uc3Qgc2NyZWVuQ29vcmQwID0gdGhpcy5zY3JlZW5Ub1NwYWNlKHNwYWNlQ29vcmQwKTtcbiAgICBjb25zdCBzY3JlZW5Db29yZDMgPSB0aGlzLnNjcmVlblRvU3BhY2Uoc3BhY2VDb29yZDMpO1xuXG4gICAgLy8gZGlzdGFuY2UgYmV0d2VlbiB0d28gY2xvc2UgY2VudHJvaWRzXG4gICAgY29uc3QgZHggPSBzY3JlZW5Db29yZDAueCAtIHNjcmVlbkNvb3JkMy54O1xuICAgIGNvbnN0IGR5ID0gc2NyZWVuQ29vcmQwLnkgLSBzY3JlZW5Db29yZDMueTtcbiAgICBjb25zdCBkeHkgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuXG4gICAgdGhpcy5zZXRVbmlmb3Jtcyh7XG4gICAgICAvLyBDYWxjdWxhdGUgYW5nbGUgdGhhdCB0aGUgcGVycGVuZGljdWxhciBoZXhhZ29uIHZlcnRleCBheGlzIGlzIHRpbHRlZFxuICAgICAgYW5nbGU6IE1hdGguYWNvcyhkeCAvIGR4eSkgKiAtTWF0aC5zaWduKGR5KSxcbiAgICAgIC8vIEFsbG93IHVzZXIgdG8gZmluZSB0dW5lIHJhZGl1c1xuICAgICAgcmFkaXVzOiBkeHkgLyAyICogTWF0aC5taW4oMSwgdGhpcy5wcm9wcy5kb3RSYWRpdXMpXG4gICAgfSk7XG5cbiAgfVxuXG59XG4iXX0=