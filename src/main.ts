import Extent from "esri/geometry/Extent";
import EsriMap from "esri/Map";
import MapView from "esri/views/MapView";
import Search from "esri/widgets/Search";

const map = new EsriMap({
  basemap: "topo-vector"
});

/**
 * The extent of WA.
 * @see {https://epsg.io/1416-area}
 */
const waExtent = new Extent({
  xmin: -124.79,
  ymin: 45.54,
  xmax: -116.91,
  ymax: 49.05
});

const view = new MapView({
  container: "viewDiv",
  map,
  extent: waExtent
});

const search = new Search({
  view,
  // This search is configured to only search within the extent of WA.
  // To get the default behavior, change "includeDefaultSources" to
  // true and remove the "sources" property.
  includeDefaultSources: false,
  sources: [
    {
      locator: {
        url:
          "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
      },
      filter: {
        geometry: waExtent
      } as __esri.SearchSourceFilter,
      countryCode: "US"
    } as __esri.LocatorSearchSource
  ]
});

view.ui.add(search, "top-right");
