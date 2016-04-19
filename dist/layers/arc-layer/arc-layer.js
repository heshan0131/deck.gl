'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

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
  positions: { size: 4, '0': 'x0', '1': 'y0', '2': 'x1', '3': 'y1' }
};

var ArcLayer = function (_Layer) {
  _inherits(ArcLayer, _Layer);

  /**
   * @classdesc
   * ArcLayer
   *
   * @class
   * @param {object} opts
   */

  function ArcLayer(opts) {
    _classCallCheck(this, ArcLayer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ArcLayer).call(this, opts));
  }

  _createClass(ArcLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      var _state = this.state;
      var gl = _state.gl;
      var attributeManager = _state.attributeManager;


      this.setState({
        model: this.createModel(gl)
      });

      attributeManager.addInstanced(ATTRIBUTES, {
        positions: { update: this.calculatePositions }
      });

      this.updateColors();
    }
  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(oldProps, nextProps) {
      _get(Object.getPrototypeOf(ArcLayer.prototype), 'willReceiveProps', this).call(this, oldProps, nextProps);
      this.updateColors();
    }
  }, {
    key: 'createModel',
    value: function createModel(gl) {
      var vertices = [];
      var NUM_SEGMENTS = 50;
      for (var i = 0; i < NUM_SEGMENTS; i++) {
        vertices = [].concat(_toConsumableArray(vertices), [i, i, i]);
      }

      return new _luma.Model({
        program: new _luma.Program(gl, {
          vs: glslify('./arc-layer-vertex.glsl'),
          fs: glslify('./arc-layer-fragment.glsl'),
          id: 'arc'
        }),
        geometry: new _luma.Geometry({
          id: 'arc',
          drawMode: 'LINE_STRIP',
          vertices: new Float32Array(vertices)
        }),
        instanced: true
      });
    }
  }, {
    key: 'updateColors',
    value: function updateColors() {
      // Get colors from first object
      var object = this.getFirstObject();
      if (object) {
        this.setUniforms({
          color0: object.colors.c0,
          color1: object.colors.c1
        });
      }
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
          var arc = _step.value;

          value[i + 0] = arc.position.x0;
          value[i + 1] = arc.position.y0;
          value[i + 2] = arc.position.x1;
          value[i + 3] = arc.position.y1;
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
  }]);

  return ArcLayer;
}(_layer2.default);

exports.default = ArcLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvYXJjLWxheWVyL2FyYy1sYXllci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkEsSUFBTSxVQUFVLFFBQVEsU0FBUixDQUFWOztBQUVOLElBQU0sYUFBYTtBQUNqQixhQUFXLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxJQUFMLEVBQVcsS0FBSyxJQUFMLEVBQVcsS0FBSyxJQUFMLEVBQVcsS0FBSyxJQUFMLEVBQXREO0NBREk7O0lBSWU7Ozs7Ozs7Ozs7O0FBUW5CLFdBUm1CLFFBUW5CLENBQVksSUFBWixFQUFrQjswQkFSQyxVQVFEOztrRUFSQyxxQkFTWCxPQURVO0dBQWxCOztlQVJtQjs7c0NBWUQ7bUJBQ2UsS0FBSyxLQUFMLENBRGY7VUFDVCxlQURTO1VBQ0wsMkNBREs7OztBQUdoQixXQUFLLFFBQUwsQ0FBYztBQUNaLGVBQU8sS0FBSyxXQUFMLENBQWlCLEVBQWpCLENBQVA7T0FERixFQUhnQjs7QUFPaEIsdUJBQWlCLFlBQWpCLENBQThCLFVBQTlCLEVBQTBDO0FBQ3hDLG1CQUFXLEVBQUMsUUFBUSxLQUFLLGtCQUFMLEVBQXBCO09BREYsRUFQZ0I7O0FBV2hCLFdBQUssWUFBTCxHQVhnQjs7OztxQ0FjRCxVQUFVLFdBQVc7QUFDcEMsaUNBM0JpQiwwREEyQk0sVUFBVSxVQUFqQyxDQURvQztBQUVwQyxXQUFLLFlBQUwsR0FGb0M7Ozs7Z0NBSzFCLElBQUk7QUFDZCxVQUFJLFdBQVcsRUFBWCxDQURVO0FBRWQsVUFBTSxlQUFlLEVBQWYsQ0FGUTtBQUdkLFdBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLFlBQUosRUFBa0IsR0FBbEMsRUFBdUM7QUFDckMsZ0RBQWUsWUFBVSxHQUFHLEdBQUcsR0FBL0IsQ0FEcUM7T0FBdkM7O0FBSUEsYUFBTyxnQkFBVTtBQUNmLGlCQUFTLGtCQUFZLEVBQVosRUFBZ0I7QUFDdkIsY0FBSSxRQUFRLHlCQUFSLENBQUo7QUFDQSxjQUFJLFFBQVEsMkJBQVIsQ0FBSjtBQUNBLGNBQUksS0FBSjtTQUhPLENBQVQ7QUFLQSxrQkFBVSxtQkFBYTtBQUNyQixjQUFJLEtBQUo7QUFDQSxvQkFBVSxZQUFWO0FBQ0Esb0JBQVUsSUFBSSxZQUFKLENBQWlCLFFBQWpCLENBQVY7U0FIUSxDQUFWO0FBS0EsbUJBQVcsSUFBWDtPQVhLLENBQVAsQ0FQYzs7OzttQ0FzQkQ7O0FBRWIsVUFBTSxTQUFTLEtBQUssY0FBTCxFQUFULENBRk87QUFHYixVQUFJLE1BQUosRUFBWTtBQUNWLGFBQUssV0FBTCxDQUFpQjtBQUNmLGtCQUFRLE9BQU8sTUFBUCxDQUFjLEVBQWQ7QUFDUixrQkFBUSxPQUFPLE1BQVAsQ0FBYyxFQUFkO1NBRlYsRUFEVTtPQUFaOzs7O3VDQVFpQixXQUFXO1VBQ3JCLE9BQVEsS0FBSyxLQUFMLENBQVIsS0FEcUI7VUFFckIsUUFBZSxVQUFmLE1BRnFCO1VBRWQsT0FBUSxVQUFSLEtBRmM7O0FBRzVCLFVBQUksSUFBSSxDQUFKLENBSHdCOzs7Ozs7QUFJNUIsNkJBQWtCLDhCQUFsQixvR0FBd0I7Y0FBYixrQkFBYTs7QUFDdEIsZ0JBQU0sSUFBSSxDQUFKLENBQU4sR0FBZSxJQUFJLFFBQUosQ0FBYSxFQUFiLENBRE87QUFFdEIsZ0JBQU0sSUFBSSxDQUFKLENBQU4sR0FBZSxJQUFJLFFBQUosQ0FBYSxFQUFiLENBRk87QUFHdEIsZ0JBQU0sSUFBSSxDQUFKLENBQU4sR0FBZSxJQUFJLFFBQUosQ0FBYSxFQUFiLENBSE87QUFJdEIsZ0JBQU0sSUFBSSxDQUFKLENBQU4sR0FBZSxJQUFJLFFBQUosQ0FBYSxFQUFiLENBSk87QUFLdEIsZUFBSyxJQUFMLENBTHNCO1NBQXhCOzs7Ozs7Ozs7Ozs7OztPQUo0Qjs7OztTQWhFWCIsImZpbGUiOiJhcmMtbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgTGF5ZXIgZnJvbSAnLi4vLi4vbGF5ZXInO1xuaW1wb3J0IHtNb2RlbCwgUHJvZ3JhbSwgR2VvbWV0cnl9IGZyb20gJ2x1bWEuZ2wnO1xuY29uc3QgZ2xzbGlmeSA9IHJlcXVpcmUoJ2dsc2xpZnknKTtcblxuY29uc3QgQVRUUklCVVRFUyA9IHtcbiAgcG9zaXRpb25zOiB7c2l6ZTogNCwgJzAnOiAneDAnLCAnMSc6ICd5MCcsICcyJzogJ3gxJywgJzMnOiAneTEnfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXJjTGF5ZXIgZXh0ZW5kcyBMYXllciB7XG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIEFyY0xheWVyXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0c1xuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIHN1cGVyKG9wdHMpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIGNvbnN0IHtnbCwgYXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtb2RlbDogdGhpcy5jcmVhdGVNb2RlbChnbClcbiAgICB9KTtcblxuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKEFUVFJJQlVURVMsIHtcbiAgICAgIHBvc2l0aW9uczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVQb3NpdGlvbnN9XG4gICAgfSk7XG5cbiAgICB0aGlzLnVwZGF0ZUNvbG9ycygpO1xuICB9XG5cbiAgd2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV4dFByb3BzKSB7XG4gICAgc3VwZXIud2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV4dFByb3BzKTtcbiAgICB0aGlzLnVwZGF0ZUNvbG9ycygpO1xuICB9XG5cbiAgY3JlYXRlTW9kZWwoZ2wpIHtcbiAgICBsZXQgdmVydGljZXMgPSBbXTtcbiAgICBjb25zdCBOVU1fU0VHTUVOVFMgPSA1MDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE5VTV9TRUdNRU5UUzsgaSsrKSB7XG4gICAgICB2ZXJ0aWNlcyA9IFsuLi52ZXJ0aWNlcywgaSwgaSwgaV07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBNb2RlbCh7XG4gICAgICBwcm9ncmFtOiBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICB2czogZ2xzbGlmeSgnLi9hcmMtbGF5ZXItdmVydGV4Lmdsc2wnKSxcbiAgICAgICAgZnM6IGdsc2xpZnkoJy4vYXJjLWxheWVyLWZyYWdtZW50Lmdsc2wnKSxcbiAgICAgICAgaWQ6ICdhcmMnXG4gICAgICB9KSxcbiAgICAgIGdlb21ldHJ5OiBuZXcgR2VvbWV0cnkoe1xuICAgICAgICBpZDogJ2FyYycsXG4gICAgICAgIGRyYXdNb2RlOiAnTElORV9TVFJJUCcsXG4gICAgICAgIHZlcnRpY2VzOiBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKVxuICAgICAgfSksXG4gICAgICBpbnN0YW5jZWQ6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZUNvbG9ycygpIHtcbiAgICAvLyBHZXQgY29sb3JzIGZyb20gZmlyc3Qgb2JqZWN0XG4gICAgY29uc3Qgb2JqZWN0ID0gdGhpcy5nZXRGaXJzdE9iamVjdCgpO1xuICAgIGlmIChvYmplY3QpIHtcbiAgICAgIHRoaXMuc2V0VW5pZm9ybXMoe1xuICAgICAgICBjb2xvcjA6IG9iamVjdC5jb2xvcnMuYzAsXG4gICAgICAgIGNvbG9yMTogb2JqZWN0LmNvbG9ycy5jMVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlUG9zaXRpb25zKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlLCBzaXplfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBhcmMgb2YgZGF0YSkge1xuICAgICAgdmFsdWVbaSArIDBdID0gYXJjLnBvc2l0aW9uLngwO1xuICAgICAgdmFsdWVbaSArIDFdID0gYXJjLnBvc2l0aW9uLnkwO1xuICAgICAgdmFsdWVbaSArIDJdID0gYXJjLnBvc2l0aW9uLngxO1xuICAgICAgdmFsdWVbaSArIDNdID0gYXJjLnBvc2l0aW9uLnkxO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=