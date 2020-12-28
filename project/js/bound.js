(function() {
    function getRawArea(data) {
        const feature = _.find(data.features, o=>o.geometry.coordinates.length == 5);

        const result = { type: 'FeatureCollection', features: [] };
        let index = 1;
        for (const geometry of data.geometries) {
            if (geometry.type == 'Polygon') {
                const intersect = turf.intersect(geometry, feature);
                if (intersect && intersect.geometry.coordinates[0].length == geometry.coordinates[0].length) {
                    result.features.push({
                        type: 'Feature',
                        geometry: { type: 'Polygon', coordinates: geometry.coordinates },
                        properties: { name: index++ },
                    });
                }
            } else {
                let _coordinates = geometry.coordinates;
                for (const coordinates of _coordinates) {
                    const intersect = turf.intersect(turf.polygon(coordinates), feature);
                    if (intersect && intersect.geometry.coordinates[0].length == geometry.coordinates[0].length) {
                        result.features.push({
                            type: 'Feature',
                            geometry: { type: 'Polygon', coordinates },
                            properties: { name: index++ },
                        });
                    }
                }
            }
        }
        return result;
    }
    window.getRawArea = getRawArea;
})();
