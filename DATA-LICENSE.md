# Map data

`src/data/zdrojowa.json` and its downloadable copy `public/data/zdrojowa.json` contain a derivative database from OpenStreetMap, © OpenStreetMap contributors, retrieved 2026-11-01.

The derivative database is available under the Open Database License (ODbL) 1.0:

https://opendatacommons.org/licenses/odbl/1-0/

Attribution and contributor information:

https://www.openstreetmap.org/copyright

The JSON includes source metadata and OSM way IDs. The import and projection are documented in `scripts/import-osm.py` and `docs/research/zdrojowa.md`. No Geoportal imagery or Mapillary photos are redistributed in this project.

## Elevation data

`src/data/terrain.json` and `public/data/terrain.json` are resampled GUGiK / Geoportal NMT GRID1 elevation data, PL-KRON86-NH. The WCS GetCapabilities declares `accessConstraints: none` and `fees: none`. Source service and SHA256 are retained in JSON metadata; processing is described in `docs/research/zdrojowa.md`. These data were acquired separately from the OSM derivative database.

## Photographic surface materials and lighting

`public/materials/` contains original 1K files from **Poly Haven**, made available under **CC0 1.0** (https://polyhaven.com/license, https://creativecommons.org/publicdomain/zero/1.0/).

- Asphalt 04, White Plaster 02, Roof Slates 02 — Rob Tuytel.
- Herringbone Pavement 02 — Amal Kumar.
- Grass Ground — Charlotte Baglioni.
- Kloofendal 48d Partly Cloudy (Pure Sky) — Greg Zaal.

Complete source URLs, authors, physical dimensions, provider MD5 and downloaded SHA256 checksums are recorded in `public/materials/sources.json`. They are material references and generic sky lighting, not scans or photographs of Zdrojowa. The source files are shipped without image modifications; material tint and normal strength are adjusted at runtime. No Mapillary photograph is included in game textures. Leaf silhouettes, siding and metal seam patterns are original procedural assets.

## Scanned vegetation

`public/vegetation/tree.glb` and `tree-atlas.png` derive from **Tree Small 02**, by **Rico Cilliers**, Poly Haven, **CC0 1.0**: https://polyhaven.com/a/tree_small_02.

The original source files were downloaded with provider MD5 verification. Source URLs, original hashes, reduction settings and derived SHA256 hashes are retained in `public/vegetation/sources.json`. The model was simplified with glTF Transform 4.5.1 and textures resized to 512 px; the four-view atlas was rendered from that reduced model using the game's lighting. This is a generic scanned tree, not a scan of a particular tree on Zdrojowa. The approximately 101 MB originals are not shipped with the game.
