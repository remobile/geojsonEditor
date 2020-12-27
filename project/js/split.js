(function() {
    function lineCoordinatesJoin(line1, line2) {
        line1.geometry.coordinates = line1.geometry.coordinates.concat(line2.geometry.coordinates);
        return line1;
    }
    function lineJoin(line1, line2) {
        const coords1 = turf.getCoords(line1);
        const coords2 = turf.getCoords(line2);
        const point10 = _.first(coords1);
        const point20 = _.first(coords2);
        const point21 = _.last(coords2);
        const len1 = turf.distance(point20, point10);
        const len2 = turf.distance(point21, point10);
        if (len1 < len2) {
            line1.geometry.coordinates = line1.geometry.coordinates.concat(_.reverse([...line2.geometry.coordinates]));
        } else {
            line1.geometry.coordinates = line1.geometry.coordinates.concat(line2.geometry.coordinates);
        }
        return turf.lineToPolygon(line1);
    }
    function split(data) {
        let polygons = _.filter(data.features, o=>o.geometry.type === 'Polygon');
        const lines = _.filter(data.features, o=>o.geometry.type == 'LineString');
        for (const line of lines) {
            const _polygons = [];
            for (const polygon of polygons) {
                const pline = turf.polygonToLine(polygon);
                const intersect = turf.lineIntersect(pline, line);
                if (intersect.features.length !== 2) {
                    _polygons.push(polygon);
                    continue;
                }
                const psplit = turf.lineSplit(pline, line);
                const lsplit = turf.lineSplit(line, pline);
                const polygonLine1 = psplit.features[1];
                const polygonLine2 = lineCoordinatesJoin(psplit.features[2], psplit.features[0]);
                const splitLine = lsplit.features[1];
                const polygon1 = lineJoin(polygonLine1, splitLine);
                const polygon2 = lineJoin(polygonLine2, splitLine);
                _polygons.push(polygon1);
                _polygons.push(polygon2);
            }
            polygons = _polygons;
        }
        return turf.featureCollection(polygons);
    }
    window splitPolygon = split;
})();
