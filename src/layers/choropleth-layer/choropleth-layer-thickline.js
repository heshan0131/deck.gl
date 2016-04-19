// Copyright (c) 2015 Uber Technologies, Inc.
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

import Layer from '../../layer';
import earcut from 'earcut';
import flattenDeep from 'lodash.flattendeep';
import normalize from 'geojson-normalize';
import {Model, Program, Geometry} from 'luma.gl';
import ExtrudePolyline from 'extrude-polyline';
const glslify = require('glslify');

const ATTRIBUTES = {
  vertices: {size: 3, '0': 'x', '1': 'y', '2': 'unused'},
  indices: {size: 1, '0': 'index'},
  colors: {size: 3, '0': 'red', '1': 'green', '2': 'blue'},
  // Override picking colors to prevent auto allocation
  pickingColors: {size: 3, '0': 'pickRed', '1': 'pickGreen', '2': 'pickBlue'}
};

export default class ChoroplethLayer extends Layer {
  /**
   * @classdesc
   * ChoroplethLayer
   *
   * @class
   * @param {object} props
   * @param {bool} props.drawContour - ? drawContour : drawArea
   * @param {function} props.onChoroplethHovered - provide properties of the
   * selected choropleth, together with the mouse event when mouse hovered
   * @param {function} props.onChoroplethClicked - provide properties of the
   * selected choropleth, together with the mouse event when mouse clicked
   */
  constructor(props) {
    super({
      opacity: 1,
      strokeColor: [0, 0, 0],
      fillColor: [128, 128, 128],
      strokeWidth: 1,
      colorAccessor: undefined,
      ...props
    });
  }

  initializeState() {
    const {gl, attributeManager} = this.state;

    attributeManager.addDynamic(ATTRIBUTES, {
      // Primtive attributes
      indices: {update: this.calculateIndices},
      vertices: {update: this.calculateVertices},
      colors: {update: this.calculateColors},
      // Instanced attributes
      pickingColors: {update: this.calculatePickingColors, noAlloc: true}
    });

    this.setUniforms({opacity: this.props.opacity});
    this.setState({
      numInstances: 0,
      model: this.getModel(gl)
    });

    this.extractChoropleths();
  }

  willReceiveProps(oldProps, newProps) {
    super.willReceiveProps(oldProps, newProps);

    const {dataChanged, attributeManager} = this.state;
    if (dataChanged || oldProps.strokeWidth !== newProps.strokeWidth) {
      this.extractChoropleths();

      attributeManager.invalidateAll();
    }

    if (oldProps.opacity !== newProps.opacity) {
      this.setUniforms({opacity: newProps.opacity});
    }
  }

  getModel(gl) {
    return new Model({
      program: new Program(gl, {
        vs: glslify('./choropleth-layer-vertex.glsl'),
        fs: glslify('./choropleth-layer-fragment.glsl'),
        id: 'choropleth'
      }),
      geometry: new Geometry({
        id: this.props.id,
        //drawMode: this.props.drawContour ? 'LINES' : 'TRIANGLES'
        drawMode: 'TRIANGLES'
      }),
      vertexCount: 0,
      isIndexed: true
    });
  }

  calculateVertices(attribute) {

    const vertices = this.props.drawContour ?
      flattenDeep(this.state.meshes.map(mesh =>
        mesh.positions.map(pos => [...pos, 100]))) :
      flattenDeep(this.state.groupedVertices);

    attribute.value = new Float32Array(vertices);
  }

  calculateIndices(attribute) {
    // adjust index offset for multiple choropleths
    const offsets = this.props.drawContour ?
      this.state.meshes.reduce(
        (acc, mesh) => [...acc, acc[acc.length - 1] + mesh.positions.length],
        [0]
      ) :

      this.state.groupedVertices.reduce(
        (acc, vertices) => [...acc, acc[acc.length - 1] + vertices.length],
        [0]
      );

    const indices = this.props.drawContour ?
      this.state.meshes.map(
        (mesh, choroplethIndex) => mesh.cells.map(
          cell => cell.map(
            index => index +  offsets[choroplethIndex]
          )
        )) :
      this.state.groupedVertices.map(
        (vertices, choroplethIndex) =>
          earcut(flattenDeep(vertices), null, 3).map(
            index => index + offsets[choroplethIndex]
          )
      );

    attribute.value = new Uint16Array(flattenDeep(indices));
    attribute.bufferType = this.state.gl.ELEMENT_ARRAY_BUFFER;
    this.state.model.setVertexCount(attribute.value.length / attribute.size);
  }

  calculateColors(attribute) {
    const {strokeColor, fillColor, colorAccessor} = this.props;
    let vColor;
    const colors = this.props.drawContour ?
      this.state.meshes.map(
        (mesh, i) => {
          vColor = colorAccessor ? colorAccessor(this.state.choropleths[i])
            : strokeColor;
          return mesh.positions.map(
            p => vColor
          )
        }
      ) :
      this.state.groupedVertices.map(
        (vertices, i) => {
          vColor = colorAccessor ? colorAccessor(this.state.choropleths[i])
            : fillColor;
          return vertices.map(
            vertex => vColor
          )
        }
      );

    attribute.value = new Float32Array(flattenDeep(colors));
  }

  // Override the default picking colors calculation
  calculatePickingColors(attribute) {
    const colors = this.props.drawContour ?
      this.state.meshes.map(
        (mesh, i) => mesh.positions.map(
          pos => [-1, -1, -1]
        )
      ) :
      this.state.groupedVertices.map(
        (vertices, choroplethIndex) => vertices.map(
          vertex => [
            (choroplethIndex + 1) % 256,
            Math.floor((choroplethIndex + 1) / 256) % 256,
            Math.floor((choroplethIndex + 1) / 256 / 256) % 256]
        )
      );

    attribute.value = new Float32Array(flattenDeep(colors));
  }

  extractChoropleths() {
    const {data} = this.props;
    const normalizedGeojson = normalize(data);

    this.state.choropleths = normalizedGeojson.features.map(choropleth => {
      let coordinates = choropleth.geometry.coordinates[0];
      // flatten nested polygons
      if (coordinates.length === 1 && coordinates[0].length > 2) {
        coordinates = coordinates[0];
      }
      return {
        properties: choropleth.properties,
        coordinates
      };
    });

    if (this.props.drawContour) {
      const stroke = ExtrudePolyline({
        thickness: 0.0001 * this.props.strokeWidth,
        cap: 'butt',
        join: 'bevel',
        miterLimit: 0.005
      });

      this.state.meshes = this.state.choropleths.map(
        choropleth => stroke.build(choropleth.coordinates.map(
          coordinate => [coordinate[0], coordinate[1]]
        ))
      );
    } else {
      this.state.groupedVertices = this.state.choropleths.map(
        choropleth => choropleth.coordinates.map(
          coordinate => [coordinate[0], coordinate[1], 100]
        )
      );
    }
  }

  onHover(info) {
    const {index} = info;
    const {data} = this.props;
    const feature = data.features[index];
    this.props.onHover({...info, feature});
  }

  onClick(info) {
    const {index} = info;
    const {data} = this.props;
    const feature = data.features[index];
    this.props.onClick({...info, feature});
  }

}
