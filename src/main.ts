import Extent from "esri/geometry/Extent";
import EsriMap from "esri/Map";
import MapView from "esri/views/MapView";
import Search from "esri/widgets/Search";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Locator from "esri/tasks/Locator";
import RouteTask from "esri/tasks/RouteTask";
import SimpleMarkerSymbol from "esri/symbols/SimpleMarkerSymbol";

const geocodeServiceUrl =
  "https://data.wsdot.wa.gov/ArcGIS/rest/services/Shared/MultinetLocator/GeocodeServer";

const routingUrl =
  "https://utility.arcgis.com/usrsvcs/appservices/RFfbgeFrGyw0fQnJ/rest/services/World/Route/NAServer/Route_World/solve";

const locator = new Locator({
  url: geocodeServiceUrl,
});

const routeTask = new RouteTask({
  url: routingUrl,
});

const intersectionsLayer = new GraphicsLayer({
  title: "Intersections",
  id: "intersections",
});

const map = new EsriMap({
  basemap: "topo-vector",
  layers: [intersectionsLayer],
});

/**
 * The extent of WA.
 * @see {https://epsg.io/1416-area}
 */
const waExtent = new Extent({
  xmin: -124.79,
  ymin: 45.54,
  xmax: -116.91,
  ymax: 49.05,
});

const view = new MapView({
  container: "viewDiv",
  map,
  extent: waExtent,
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
          "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
      },
      filter: {
        geometry: waExtent,
      } as __esri.SearchSourceFilter,
      countryCode: "US",
    } as __esri.LocatorSearchSource,
  ],
  popupEnabled: true,
});

view.ui.add(search, "top-right");

const intersectionSymbol = new SimpleMarkerSymbol({
  color: "red",
  size: 10,
});

function addressCandidateToGraphic(addressCandidate: __esri.AddressCandidate) {
  const graphic = new Graphic({
    attributes: addressCandidate.attributes,
    geometry: addressCandidate.location,
    symbol: intersectionSymbol,
  });

  return graphic;
}

window.addEventListener("locate-error", (evt) => {
  if (evt instanceof CustomEvent) {
    const error = evt.detail as Error;
    alert(`Location error: ${error.message}`);
  }
});

view.on("click", async (clickEvent) => {
  let addressCandidate: __esri.AddressCandidate | undefined;
  try {
    addressCandidate = await locator.locationToAddress({
      location: clickEvent.mapPoint,
      locationType: "street",
    });
    console;
  } catch (err) {
    const customEvent = new CustomEvent("locate-error", {
      detail: err,
    });
    window.dispatchEvent(customEvent);
  }

  const graphic = addressCandidateToGraphic(addressCandidate);

  intersectionsLayer.add(graphic);
});
