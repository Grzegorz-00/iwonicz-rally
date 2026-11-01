# Map data

`src/data/zdrojowa.json` and its downloadable copy `public/data/zdrojowa.json` contain a derivative database from OpenStreetMap, © OpenStreetMap contributors, retrieved 2026-11-01.

The derivative database is available under the Open Database License (ODbL) 1.0:

https://opendatacommons.org/licenses/odbl/1-0/

Attribution and contributor information:

https://www.openstreetmap.org/copyright

The JSON includes source metadata and OSM way IDs. The import and projection are documented in `scripts/import-osm.py` and `docs/research/zdrojowa.md`. No Geoportal imagery or Mapillary photos are redistributed in this project.

## Elevation data

`src/data/terrain.json` and `public/data/terrain.json` are resampled GUGiK / Geoportal NMT GRID1 elevation data, PL-KRON86-NH. The WCS GetCapabilities declares `accessConstraints: none` and `fees: none`. Source service and SHA256 are retained in JSON metadata; processing is described in `docs/research/zdrojowa.md`. These data were acquired separately from the OSM derivative database.
