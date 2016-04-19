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

var _earcut = require('earcut');

var _earcut2 = _interopRequireDefault(_earcut);

var _lodash = require('lodash.flattendeep');

var _lodash2 = _interopRequireDefault(_lodash);

var _geojsonNormalize = require('geojson-normalize');

var _geojsonNormalize2 = _interopRequireDefault(_geojsonNormalize);

var _luma = require('luma.gl');

var _extrudePolyline = require('extrude-polyline');

var _extrudePolyline2 = _interopRequireDefault(_extrudePolyline);

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
  vertices: { size: 3, '0': 'x', '1': 'y', '2': 'unused' },
  indices: { size: 1, '0': 'index' },
  colors: { size: 3, '0': 'red', '1': 'green', '2': 'blue' },
  // Override picking colors to prevent auto allocation
  pickingColors: { size: 3, '0': 'pickRed', '1': 'pickGreen', '2': 'pickBlue' }
};

var ChoroplethLayer = function (_Layer) {
  _inherits(ChoroplethLayer, _Layer);

  /**
   * @classdesc
   * ChoroplethLayer
   *
   * @class
   * @param {object} props
   * @param {bool} props.drawContour - ? drawContour : drawArea
   * @param {function} props.onChoroplethHovered - provide proerties of the
   * selected choropleth, together with the mouse event when mouse hovered
   * @param {function} props.onChoroplethClicked - provide proerties of the
   * selected choropleth, together with the mouse event when mouse clicked
   */

  function ChoroplethLayer(props) {
    _classCallCheck(this, ChoroplethLayer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ChoroplethLayer).call(this, _extends({
      opacity: 1,
      strokeColor: [0, 0, 0],
      fillColor: [128, 128, 128],
      strokeWidth: 1,
      colorAccessor: undefined
    }, props)));
  }

  _createClass(ChoroplethLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      var _state = this.state;
      var gl = _state.gl;
      var attributeManager = _state.attributeManager;


      attributeManager.addDynamic(ATTRIBUTES, {
        // Primtive attributes
        indices: { update: this.calculateIndices },
        vertices: { update: this.calculateVertices },
        colors: { update: this.calculateColors },
        // Instanced attributes
        pickingColors: { update: this.calculatePickingColors, noAlloc: true }
      });

      this.setUniforms({ opacity: this.props.opacity });
      this.setState({
        numInstances: 0,
        model: this.getModel(gl)
      });

      this.extractChoropleths();
    }
  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(oldProps, newProps) {
      _get(Object.getPrototypeOf(ChoroplethLayer.prototype), 'willReceiveProps', this).call(this, oldProps, newProps);

      var _state2 = this.state;
      var dataChanged = _state2.dataChanged;
      var attributeManager = _state2.attributeManager;

      if (dataChanged) {
        this.extractChoropleths();

        attributeManager.invalidateAll();
      }

      if (oldProps.opacity !== newProps.opacity) {
        this.setUniforms({ opacity: newProps.opacity });
      }
    }
  }, {
    key: 'getModel',
    value: function getModel(gl) {
      var _this2 = this;

      return new _luma.Model({
        program: new _luma.Program(gl, {
          vs: glslify('./choropleth-layer-vertex.glsl'),
          fs: glslify('./choropleth-layer-fragment.glsl'),
          id: 'choropleth'
        }),
        geometry: new _luma.Geometry({
          id: this.props.id,
          //drawMode: this.props.drawContour ? 'LINES' : 'TRIANGLES'
          drawMode: 'TRIANGLES'
        }),
        vertexCount: 0,
        isIndexed: true,
        onBeforeRender: function onBeforeRender() {
          _this2.oldWidth = gl.getParameter(gl.LINE_WIDTH);gl.lineWidth(5);
        },
        onAfterRender: function onAfterRender() {
          gl.lineWidth(_this2.oldWidth);
        }
      });
    }
  }, {
    key: 'calculateVertices',
    value: function calculateVertices(attribute) {
      console.log('calculate Vertices');

      var vertices = this.props.drawContour ? (0, _lodash2.default)(this.state.meshes.map(function (mesh) {
        return mesh.positions.map(function (pos) {
          return [].concat(_toConsumableArray(pos), [100]);
        });
      })) : (0, _lodash2.default)(this.state.groupedVertices);

      attribute.value = new Float32Array(vertices);
      console.log(attribute.value);
    }
  }, {
    key: 'calculateIndices',
    value: function calculateIndices(attribute) {
      console.log('calculate indices');
      // adjust index offset for multiple choropleths
      var offsets = this.props.drawContour ? this.state.meshes.reduce(function (acc, mesh) {
        return [].concat(_toConsumableArray(acc), [acc[acc.length - 1] + mesh.positions.length]);
      }, [0]) : this.state.groupedVertices.reduce(function (acc, vertices) {
        return [].concat(_toConsumableArray(acc), [acc[acc.length - 1] + vertices.length]);
      }, [0]);

      var indices = this.props.drawContour ? this.state.meshes.map(function (mesh, choroplethIndex) {
        return mesh.cells.map(function (cell) {
          return cell.map(function (index) {
            return index + offsets[choroplethIndex];
          });
        });
      }) : this.state.groupedVertices.map(function (vertices, choroplethIndex) {
        return (0, _earcut2.default)((0, _lodash2.default)(vertices), null, 3).map(function (index) {
          return index + offsets[choroplethIndex];
        });
      });

      attribute.value = new Uint16Array((0, _lodash2.default)(indices));
      console.log(attribute.value);
      attribute.bufferType = this.state.gl.ELEMENT_ARRAY_BUFFER;
      this.state.model.setVertexCount(attribute.value.length / attribute.size);
    }
  }, {
    key: 'calculateColors',
    value: function calculateColors(attribute) {
      var _this3 = this;

      var _props = this.props;
      var strokeColor = _props.strokeColor;
      var fillColor = _props.fillColor;
      var colorAccessor = _props.colorAccessor;

      var vColor = undefined;
      var colors = this.props.drawContour ? this.state.meshes.map(function (mesh, i) {
        vColor = colorAccessor ? colorAccessor(_this3.state.choropleths[i]) : strokeColor;
        return mesh.positions.map(function (p) {
          return vColor;
        });
      }) : this.state.groupedVertices.map(function (vertices, i) {
        vColor = colorAccessor ? colorAccessor(_this3.state.choropleths[i]) : fillColor;
        return vertices.map(function (vertex) {
          return vColor;
        });
      });

      attribute.value = new Float32Array((0, _lodash2.default)(colors));
    }

    // Override the default picking colors calculation

  }, {
    key: 'calculatePickingColors',
    value: function calculatePickingColors(attribute) {
      var colors = this.props.drawContour ? this.state.meshes.map(function (mesh, i) {
        return mesh.positions.map(function (pos) {
          return [-1, -1, -1];
        });
      }) : this.state.groupedVertices.map(function (vertices, choroplethIndex) {
        return vertices.map(function (vertex) {
          return [(choroplethIndex + 1) % 256, Math.floor((choroplethIndex + 1) / 256) % 256, Math.floor((choroplethIndex + 1) / 256 / 256) % 256];
        });
      });

      attribute.value = new Float32Array((0, _lodash2.default)(colors));
    }
  }, {
    key: 'extractChoropleths',
    value: function extractChoropleths() {
      var _this4 = this;

      var data = this.props.data;

      console.log(data);
      var normalizedGeojson = (0, _geojsonNormalize2.default)(data);

      this.state.choropleths = normalizedGeojson.features.map(function (choropleth) {
        var coordinates = choropleth.geometry.coordinates[0];
        // flatten nested polygons
        if (coordinates.length === 1 && coordinates[0].length > 2) {
          coordinates = coordinates[0];
        }
        return {
          properties: choropleth.properties,
          coordinates: coordinates
        };
      });

      if (this.props.drawContour) {
        (function () {
          var stroke = (0, _extrudePolyline2.default)({
            thickness: 0.0001 * _this4.props.strokeWidth,
            cap: 'square',
            join: 'miter',
            miterLimit: 0.00005
          });

          _this4.state.meshes = _this4.state.choropleths.map(function (choropleth) {
            return stroke.build(choropleth.coordinates.map(function (coordinate) {
              return [coordinate[0], coordinate[1]];
            }));
          });
          console.log(_this4.state.meshes);
        })();
      } else {
        this.state.groupedVertices = this.state.choropleths.map(function (choropleth) {
          return choropleth.coordinates.map(function (coordinate) {
            return [coordinate[0], coordinate[1], 100];
          });
        });
      }
    }
  }, {
    key: 'calculateContourIndices',
    value: function calculateContourIndices(numVertices) {

      // use vertex pairs for gl.LINES => [0, 1, 1, 2, 2, ..., n-1, n-1, 0]
      var indices = [];
      for (var i = 1; i < numVertices - 1; i++) {
        indices = [].concat(_toConsumableArray(indices), [i, i]);
      }
      return [0].concat(_toConsumableArray(indices), [0]);
    }
  }, {
    key: 'onHover',
    value: function onHover(info) {
      var index = info.index;
      var data = this.props.data;

      var feature = data.features[index];
      this.props.onHover(_extends({}, info, { feature: feature }));
    }
  }, {
    key: 'onClick',
    value: function onClick(info) {
      var index = info.index;
      var data = this.props.data;

      var feature = data.features[index];
      this.props.onClick(_extends({}, info, { feature: feature }));
    }
  }]);

  return ChoroplethLayer;
}(_layer2.default);

exports.default = ChoroplethLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvY2hvcm9wbGV0aC1sYXllci9jaG9yb3BsZXRoLWxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTBCQSxJQUFNLFVBQVUsUUFBUSxTQUFSLENBQVY7O0FBRU4sSUFBTSxhQUFhO0FBQ2pCLFlBQVUsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLEdBQUwsRUFBVSxLQUFLLEdBQUwsRUFBVSxLQUFLLFFBQUwsRUFBeEM7QUFDQSxXQUFTLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxPQUFMLEVBQW5CO0FBQ0EsVUFBUSxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssS0FBTCxFQUFZLEtBQUssT0FBTCxFQUFjLEtBQUssTUFBTCxFQUE1Qzs7QUFFQSxpQkFBZSxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssU0FBTCxFQUFnQixLQUFLLFdBQUwsRUFBa0IsS0FBSyxVQUFMLEVBQTNEO0NBTEk7O0lBUWU7Ozs7Ozs7Ozs7Ozs7Ozs7QUFhbkIsV0FibUIsZUFhbkIsQ0FBWSxLQUFaLEVBQW1COzBCQWJBLGlCQWFBOztrRUFiQTtBQWVmLGVBQVMsQ0FBVDtBQUNBLG1CQUFhLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBQWI7QUFDQSxpQkFBVyxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWCxDQUFYO0FBQ0EsbUJBQWEsQ0FBYjtBQUNBLHFCQUFlLFNBQWY7T0FDRyxTQVBZO0dBQW5COztlQWJtQjs7c0NBd0JEO21CQUNlLEtBQUssS0FBTCxDQURmO1VBQ1QsZUFEUztVQUNMLDJDQURLOzs7QUFHaEIsdUJBQWlCLFVBQWpCLENBQTRCLFVBQTVCLEVBQXdDOztBQUV0QyxpQkFBUyxFQUFDLFFBQVEsS0FBSyxnQkFBTCxFQUFsQjtBQUNBLGtCQUFVLEVBQUMsUUFBUSxLQUFLLGlCQUFMLEVB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dUIsR0FBdkIsQ0FDM0I7aUJBQWMsV0FBVyxXQUFYLENBQXVCLEdBQXZCLENBQ1o7bUJBQWMsQ0FBQyxXQUFXLENBQVgsQ0FBRCxFQUFnQixXQUFXLENBQVgsQ0FBaEIsRUFBK0IsR0FBL0I7V0FBZDtTQURGLENBREYsQ0FESztPQWRQOzs7OzRDQXVCc0IsYUFBYTs7O0FBR25DLFVBQUksVUFBVSxFQUFWLENBSCtCO0FBSW5DLFdBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLGNBQWMsQ0FBZCxFQUFpQixHQUFyQyxFQUEwQztBQUN4QywrQ0FBYyxXQUFTLEdBQUcsR0FBMUIsQ0FEd0M7T0FBMUM7QUFHQSxjQUFRLDZCQUFNLFdBQVMsR0FBdkIsQ0FQbUM7Ozs7NEJBVzdCLE1BQU07VUFDTCxRQUFTLEtBQVQsTUFESztVQUVMLE9BQVEsS0FBSyxLQUFMLENBQVIsS0FGSzs7QUFHWixVQUFNLFVBQVUsS0FBSyxRQUFMLENBQWMsS0FBZCxDQUFWLENBSE07QUFJWixXQUFLLEtBQUwsQ0FBVyxPQUFYLGNBQXVCLFFBQU0sbUJBQTdCLEVBSlk7Ozs7NEJBT04sTUFBTTtVQUNMLFFBQVMsS0FBVCxNQURLO1VBRUwsT0FBUSxLQUFLLEtBQUwsQ0FBUixLQUZLOztBQUdaLFVBQU0sVUFBVSxLQUFLLFFBQUwsQ0FBYyxLQUFkLENBQVYsQ0FITTtBQUlaLFdBQUssS0FBTCxDQUFXLE9BQVgsY0FBdUIsUUFBTSxtQkFBN0IsRUFKWTs7OztTQTNPSyIsImZpbGUiOiJjaG9yb3BsZXRoLWxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IExheWVyIGZyb20gJy4uLy4uL2xheWVyJztcbmltcG9ydCBlYXJjdXQgZnJvbSAnZWFyY3V0JztcbmltcG9ydCBmbGF0dGVuRGVlcCBmcm9tICdsb2Rhc2guZmxhdHRlbmRlZXAnO1xuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICdnZW9qc29uLW5vcm1hbGl6ZSc7XG5pbXBvcnQge01vZGVsLCBQcm9ncmFtLCBHZW9tZXRyeX0gZnJvbSAnbHVtYS5nbCc7XG5pbXBvcnQgRXh0cnVkZVBvbHlsaW5lIGZyb20gJ2V4dHJ1ZGUtcG9seWxpbmUnO1xuY29uc3QgZ2xzbGlmeSA9IHJlcXVpcmUoJ2dsc2xpZnknKTtcblxuY29uc3QgQVRUUklCVVRFUyA9IHtcbiAgdmVydGljZXM6IHtzaXplOiAzLCAnMCc6ICd4JywgJzEnOiAneScsICcyJzogJ3VudXNlZCd9LFxuICBpbmRpY2VzOiB7c2l6ZTogMSwgJzAnOiAnaW5kZXgnfSxcbiAgY29sb3JzOiB7c2l6ZTogMywgJzAnOiAncmVkJywgJzEnOiAnZ3JlZW4nLCAnMic6ICdibHVlJ30sXG4gIC8vIE92ZXJyaWRlIHBpY2tpbmcgY29sb3JzIHRvIHByZXZlbnQgYXV0byBhbGxvY2F0aW9uXG4gIHBpY2tpbmdDb2xvcnM6IHtzaXplOiAzLCAnMCc6ICdwaWNrUmVkJywgJzEnOiAncGlja0dyZWVuJywgJzInOiAncGlja0JsdWUnfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hvcm9wbGV0aExheWVyIGV4dGVuZHMgTGF5ZXIge1xuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBDaG9yb3BsZXRoTGF5ZXJcbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wc1xuICAgKiBAcGFyYW0ge2Jvb2x9IHByb3BzLmRyYXdDb250b3VyIC0gPyBkcmF3Q29udG91ciA6IGRyYXdBcmVhXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IHByb3BzLm9uQ2hvcm9wbGV0aEhvdmVyZWQgLSBwcm92aWRlIHByb2VydGllcyBvZiB0aGVcbiAgICogc2VsZWN0ZWQgY2hvcm9wbGV0aCwgdG9nZXRoZXIgd2l0aCB0aGUgbW91c2UgZXZlbnQgd2hlbiBtb3VzZSBob3ZlcmVkXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IHByb3BzLm9uQ2hvcm9wbGV0aENsaWNrZWQgLSBwcm92aWRlIHByb2VydGllcyBvZiB0aGVcbiAgICogc2VsZWN0ZWQgY2hvcm9wbGV0aCwgdG9nZXRoZXIgd2l0aCB0aGUgbW91c2UgZXZlbnQgd2hlbiBtb3VzZSBjbGlja2VkXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICBzdHJva2VDb2xvcjogWzAsIDAsIDBdLFxuICAgICAgZmlsbENvbG9yOiBbMTI4LCAxMjgsIDEyOF0sXG4gICAgICBzdHJva2VXaWR0aDogMSxcbiAgICAgIGNvbG9yQWNjZXNzb3I6IHVuZGVmaW5lZCxcbiAgICAgIC4uLnByb3BzXG4gICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgY29uc3Qge2dsLCBhdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZER5bmFtaWMoQVRUUklCVVRFUywge1xuICAgICAgLy8gUHJpbXRpdmUgYXR0cmlidXRlc1xuICAgICAgaW5kaWNlczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbmRpY2VzfSxcbiAgICAgIHZlcnRpY2VzOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVZlcnRpY2VzfSxcbiAgICAgIGNvbG9yczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVDb2xvcnN9LFxuICAgICAgLy8gSW5zdGFuY2VkIGF0dHJpYnV0ZXNcbiAgICAgIHBpY2tpbmdDb2xvcnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUGlja2luZ0NvbG9ycywgbm9BbGxvYzogdHJ1ZX1cbiAgICB9KTtcblxuICAgIHRoaXMuc2V0VW5pZm9ybXMoe29wYWNpdHk6IHRoaXMucHJvcHMub3BhY2l0eX0pO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbnVtSW5zdGFuY2VzOiAwLFxuICAgICAgbW9kZWw6IHRoaXMuZ2V0TW9kZWwoZ2wpXG4gICAgfSk7XG5cbiAgICB0aGlzLmV4dHJhY3RDaG9yb3BsZXRocygpO1xuICB9XG5cbiAgd2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBzdXBlci53aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXdQcm9wcyk7XG5cbiAgICBjb25zdCB7ZGF0YUNoYW5nZWQsIGF0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoZGF0YUNoYW5nZWQpIHtcbiAgICAgIHRoaXMuZXh0cmFjdENob3JvcGxldGhzKCk7XG5cbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZUFsbCgpO1xuICAgIH1cblxuICAgIGlmIChvbGRQcm9wcy5vcGFjaXR5ICE9PSBuZXdQcm9wcy5vcGFjaXR5KSB7XG4gICAgICB0aGlzLnNldFVuaWZvcm1zKHtvcGFjaXR5OiBuZXdQcm9wcy5vcGFjaXR5fSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0TW9kZWwoZ2wpIHtcbiAgICByZXR1cm4gbmV3IE1vZGVsKHtcbiAgICAgIHByb2dyYW06IG5ldyBQcm9ncmFtKGdsLCB7XG4gICAgICAgIHZzOiBnbHNsaWZ5KCcuL2Nob3JvcGxldGgtbGF5ZXItdmVydGV4Lmdsc2wnKSxcbiAgICAgICAgZnM6IGdsc2xpZnkoJy4vY2hvcm9wbGV0aC1sYXllci1mcmFnbWVudC5nbHNsJyksXG4gICAgICAgIGlkOiAnY2hvcm9wbGV0aCdcbiAgICAgIH0pLFxuICAgICAgZ2VvbWV0cnk6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgICAvL2RyYXdNb2RlOiB0aGlzLnByb3BzLmRyYXdDb250b3VyID8gJ0xJTkVTJyA6ICdUUklBTkdMRVMnXG4gICAgICAgIGRyYXdNb2RlOiAnVFJJQU5HTEVTJ1xuICAgICAgfSksXG4gICAgICB2ZXJ0ZXhDb3VudDogMCxcbiAgICAgIGlzSW5kZXhlZDogdHJ1ZSxcbiAgICAgIG9uQmVmb3JlUmVuZGVyOiAoKSA9PiB7XG4gICAgICAgIHRoaXMub2xkV2lkdGggPSBnbC5nZXRQYXJhbWV0ZXIoZ2wuTElORV9XSURUSCk7IGdsLmxpbmVXaWR0aCg1KTtcbiAgICAgIH0sXG4gICAgICBvbkFmdGVyUmVuZGVyOiAoKSA9PiB7XG4gICAgICAgIGdsLmxpbmVXaWR0aCh0aGlzLm9sZFdpZHRoKTtcbiAgICAgIH1cbiAgICAgfSk7XG4gIH1cblxuICBjYWxjdWxhdGVWZXJ0aWNlcyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zb2xlLmxvZygnY2FsY3VsYXRlIFZlcnRpY2VzJylcblxuICAgIGNvbnN0IHZlcnRpY2VzID0gdGhpcy5wcm9wcy5kcmF3Q29udG91ciA/XG4gICAgICBmbGF0dGVuRGVlcCh0aGlzLnN0YXRlLm1lc2hlcy5tYXAobWVzaCA9PlxuICAgICAgICBtZXNoLnBvc2l0aW9ucy5tYXAocG9zID0+IFsuLi5wb3MsIDEwMF0pKSkgOlxuICAgICAgZmxhdHRlbkRlZXAodGhpcy5zdGF0ZS5ncm91cGVkVmVydGljZXMpO1xuXG4gICAgYXR0cmlidXRlLnZhbHVlID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcyk7XG4gICAgY29uc29sZS5sb2coYXR0cmlidXRlLnZhbHVlKTtcblxuICB9XG5cbiAgY2FsY3VsYXRlSW5kaWNlcyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zb2xlLmxvZygnY2FsY3VsYXRlIGluZGljZXMnKVxuICAgIC8vIGFkanVzdCBpbmRleCBvZmZzZXQgZm9yIG11bHRpcGxlIGNob3JvcGxldGhzXG4gICAgY29uc3Qgb2Zmc2V0cyA9IHRoaXMucHJvcHMuZHJhd0NvbnRvdXIgP1xuICAgICAgdGhpcy5zdGF0ZS5tZXNoZXMucmVkdWNlKFxuICAgICAgICAoYWNjLCBtZXNoKSA9PiBbLi4uYWNjLCBhY2NbYWNjLmxlbmd0aCAtIDFdICsgbWVzaC5wb3NpdGlvbnMubGVuZ3RoXSxcbiAgICAgICAgWzBdXG4gICAgICApIDpcblxuICAgICAgdGhpcy5zdGF0ZS5ncm91cGVkVmVydGljZXMucmVkdWNlKFxuICAgICAgICAoYWNjLCB2ZXJ0aWNlcykgPT4gWy4uLmFjYywgYWNjW2FjYy5sZW5ndGggLSAxXSArIHZlcnRpY2VzLmxlbmd0aF0sXG4gICAgICAgIFswXVxuICAgICAgKTtcblxuXG4gICAgY29uc3QgaW5kaWNlcyA9IHRoaXMucHJvcHMuZHJhd0NvbnRvdXIgP1xuICAgICAgdGhpcy5zdGF0ZS5tZXNoZXMubWFwKFxuICAgICAgICAobWVzaCwgY2hvcm9wbGV0aEluZGV4KSA9PiBtZXNoLmNlbGxzLm1hcChcbiAgICAgICAgICBjZWxsID0+IGNlbGwubWFwKFxuICAgICAgICAgICAgaW5kZXggPT4gaW5kZXggKyAgb2Zmc2V0c1tjaG9yb3BsZXRoSW5kZXhdXG4gICAgICAgICAgKVxuICAgICAgICApKSA6XG4gICAgICB0aGlzLnN0YXRlLmdyb3VwZWRWZXJ0aWNlcy5tYXAoXG4gICAgICAgICh2ZXJ0aWNlcywgY2hvcm9wbGV0aEluZGV4KSA9PlxuICAgICAgICAgIGVhcmN1dChmbGF0dGVuRGVlcCh2ZXJ0aWNlcyksIG51bGwsIDMpLm1hcChcbiAgICAgICAgICAgIGluZGV4ID0+IGluZGV4ICsgb2Zmc2V0c1tjaG9yb3BsZXRoSW5kZXhdXG4gICAgICAgICAgKVxuICAgICAgKTtcblxuICAgIGF0dHJpYnV0ZS52YWx1ZSA9IG5ldyBVaW50MTZBcnJheShmbGF0dGVuRGVlcChpbmRpY2VzKSk7XG4gICAgY29uc29sZS5sb2coYXR0cmlidXRlLnZhbHVlKTtcbiAgICBhdHRyaWJ1dGUuYnVmZmVyVHlwZSA9IHRoaXMuc3RhdGUuZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVI7XG4gICAgdGhpcy5zdGF0ZS5tb2RlbC5zZXRWZXJ0ZXhDb3VudChhdHRyaWJ1dGUudmFsdWUubGVuZ3RoIC8gYXR0cmlidXRlLnNpemUpO1xuICB9XG5cbiAgY2FsY3VsYXRlQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtzdHJva2VDb2xvciwgZmlsbENvbG9yLCBjb2xvckFjY2Vzc29yfSA9IHRoaXMucHJvcHM7XG4gICAgbGV0IHZDb2xvcjtcbiAgICBjb25zdCBjb2xvcnMgPSB0aGlzLnByb3BzLmRyYXdDb250b3VyID9cbiAgICAgIHRoaXMuc3RhdGUubWVzaGVzLm1hcChcbiAgICAgICAgKG1lc2gsIGkpID0+IHtcbiAgICAgICAgICB2Q29sb3IgPSBjb2xvckFjY2Vzc29yID8gY29sb3JBY2Nlc3Nvcih0aGlzLnN0YXRlLmNob3JvcGxldGhzW2ldKVxuICAgICAgICAgICAgOiBzdHJva2VDb2xvcjtcbiAgICAgICAgICByZXR1cm4gbWVzaC5wb3NpdGlvbnMubWFwKFxuICAgICAgICAgICAgcCA9PiB2Q29sb3JcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgICkgOlxuICAgICAgdGhpcy5zdGF0ZS5ncm91cGVkVmVydGljZXMubWFwKFxuICAgICAgICAodmVydGljZXMsIGkpID0+IHtcbiAgICAgICAgICB2Q29sb3IgPSBjb2xvckFjY2Vzc29yID8gY29sb3JBY2Nlc3Nvcih0aGlzLnN0YXRlLmNob3JvcGxldGhzW2ldKVxuICAgICAgICAgICAgOiBmaWxsQ29sb3I7XG4gICAgICAgICAgcmV0dXJuIHZlcnRpY2VzLm1hcChcbiAgICAgICAgICAgIHZlcnRleCA9PiB2Q29sb3JcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgRmxvYXQzMkFycmF5KGZsYXR0ZW5EZWVwKGNvbG9ycykpO1xuICB9XG5cbiAgLy8gT3ZlcnJpZGUgdGhlIGRlZmF1bHQgcGlja2luZyBjb2xvcnMgY2FsY3VsYXRpb25cbiAgY2FsY3VsYXRlUGlja2luZ0NvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCBjb2xvcnMgPSB0aGlzLnByb3BzLmRyYXdDb250b3VyID9cbiAgICAgIHRoaXMuc3RhdGUubWVzaGVzLm1hcChcbiAgICAgICAgKG1lc2gsIGkpID0+IG1lc2gucG9zaXRpb25zLm1hcChcbiAgICAgICAgICBwb3MgPT4gWy0xLCAtMSwgLTFdXG4gICAgICAgIClcbiAgICAgICkgOlxuICAgICAgdGhpcy5zdGF0ZS5ncm91cGVkVmVydGljZXMubWFwKFxuICAgICAgICAodmVydGljZXMsIGNob3JvcGxldGhJbmRleCkgPT4gdmVydGljZXMubWFwKFxuICAgICAgICAgIHZlcnRleCA9PiBbXG4gICAgICAgICAgICAoY2hvcm9wbGV0aEluZGV4ICsgMSkgJSAyNTYsXG4gICAgICAgICAgICBNYXRoLmZsb29yKChjaG9yb3BsZXRoSW5kZXggKyAxKSAvIDI1NikgJSAyNTYsXG4gICAgICAgICAgICBNYXRoLmZsb29yKChjaG9yb3BsZXRoSW5kZXggKyAxKSAvIDI1NiAvIDI1NikgJSAyNTZdXG4gICAgICAgIClcbiAgICAgICk7XG5cbiAgICBhdHRyaWJ1dGUudmFsdWUgPSBuZXcgRmxvYXQzMkFycmF5KGZsYXR0ZW5EZWVwKGNvbG9ycykpO1xuICB9XG5cbiAgZXh0cmFjdENob3JvcGxldGhzKCkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgY29uc3Qgbm9ybWFsaXplZEdlb2pzb24gPSBub3JtYWxpemUoZGF0YSk7XG5cbiAgICB0aGlzLnN0YXRlLmNob3JvcGxldGhzID0gbm9ybWFsaXplZEdlb2pzb24uZmVhdHVyZXMubWFwKGNob3JvcGxldGggPT4ge1xuICAgICAgbGV0IGNvb3JkaW5hdGVzID0gY2hvcm9wbGV0aC5nZW9tZXRyeS5jb29yZGluYXRlc1swXTtcbiAgICAgIC8vIGZsYXR0ZW4gbmVzdGVkIHBvbHlnb25zXG4gICAgICBpZiAoY29vcmRpbmF0ZXMubGVuZ3RoID09PSAxICYmIGNvb3JkaW5hdGVzWzBdLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgY29vcmRpbmF0ZXMgPSBjb29yZGluYXRlc1swXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHByb3BlcnRpZXM6IGNob3JvcGxldGgucHJvcGVydGllcyxcbiAgICAgICAgY29vcmRpbmF0ZXNcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5kcmF3Q29udG91cikge1xuICAgICAgY29uc3Qgc3Ryb2tlID0gRXh0cnVkZVBvbHlsaW5lKHtcbiAgICAgICAgdGhpY2tuZXNzOiAwLjAwMDEgKiB0aGlzLnByb3BzLnN0cm9rZVdpZHRoLFxuICAgICAgICBjYXA6ICdzcXVhcmUnLFxuICAgICAgICBqb2luOiAnbWl0ZXInLFxuICAgICAgICBtaXRlckxpbWl0OiAwLjAwMDA1XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zdGF0ZS5tZXNoZXMgPSB0aGlzLnN0YXRlLmNob3JvcGxldGhzLm1hcChcbiAgICAgICAgY2hvcm9wbGV0aCA9PiBzdHJva2UuYnVpbGQoY2hvcm9wbGV0aC5jb29yZGluYXRlcy5tYXAoXG4gICAgICAgICAgY29vcmRpbmF0ZSA9PiBbY29vcmRpbmF0ZVswXSwgY29vcmRpbmF0ZVsxXV1cbiAgICAgICAgKSlcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLnN0YXRlLm1lc2hlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RhdGUuZ3JvdXBlZFZlcnRpY2VzID0gdGhpcy5zdGF0ZS5jaG9yb3BsZXRocy5tYXAoXG4gICAgICAgIGNob3JvcGxldGggPT4gY2hvcm9wbGV0aC5jb29yZGluYXRlcy5tYXAoXG4gICAgICAgICAgY29vcmRpbmF0ZSA9PiBbY29vcmRpbmF0ZVswXSwgY29vcmRpbmF0ZVsxXSwgMTAwXVxuICAgICAgICApXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUNvbnRvdXJJbmRpY2VzKG51bVZlcnRpY2VzKSB7XG5cbiAgICAvLyB1c2UgdmVydGV4IHBhaXJzIGZvciBnbC5MSU5FUyA9PiBbMCwgMSwgMSwgMiwgMiwgLi4uLCBuLTEsIG4tMSwgMF1cbiAgICBsZXQgaW5kaWNlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbnVtVmVydGljZXMgLSAxOyBpKyspIHtcbiAgICAgIGluZGljZXMgPSBbLi4uaW5kaWNlcywgaSwgaV07XG4gICAgfVxuICAgIHJldHVybiBbMCwgLi4uaW5kaWNlcywgMF07XG5cbiAgfVxuXG4gIG9uSG92ZXIoaW5mbykge1xuICAgIGNvbnN0IHtpbmRleH0gPSBpbmZvO1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgZmVhdHVyZSA9IGRhdGEuZmVhdHVyZXNbaW5kZXhdO1xuICAgIHRoaXMucHJvcHMub25Ib3Zlcih7Li4uaW5mbywgZmVhdHVyZX0pO1xuICB9XG5cbiAgb25DbGljayhpbmZvKSB7XG4gICAgY29uc3Qge2luZGV4fSA9IGluZm87XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBmZWF0dXJlID0gZGF0YS5mZWF0dXJlc1tpbmRleF07XG4gICAgdGhpcy5wcm9wcy5vbkNsaWNrKHsuLi5pbmZvLCBmZWF0dXJlfSk7XG4gIH1cblxufVxuIl19