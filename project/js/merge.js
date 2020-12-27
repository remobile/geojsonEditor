(function() {
    function merge(data, index1, index2) {
        const features = data.features;
        const union = turf.union(features[index1], features[index2]);
        union.properties.name = features[index1].properties.name || features[index2].properties.name;
        features[index1] = union;
        features.splice(index2, 1);
        return data;
    }
    function mergeAll(data) {
        const lines = _.filter(data.features, o=>o.geometry.type == 'LineString');
        data.features = _.filter(data.features, o=>o.geometry.type === 'Polygon');

        for (const line of lines) {
            const coords = turf.getCoords(line);
            const point0 = _.first(coords);
            const point1 = _.first(coords);

            let index1, index2;
            for (const i in data.features) {
                const polygon = data.features[i];
                if (turf.booleanPointInPolygon(point0, polygon)) {
                    index1 = i;
                } else if (turf.booleanPointInPolygon(point1, polygon)) {
                    index2 = i;
                }
                if (index1 !== undefined && index2 !== undefined) {
                    merge(data, index1, index2);
                }
            }
        }
        return data;
    }

    window mergePolygon = mergeAll;
})();
