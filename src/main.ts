import Extent from "esri/geometry/Extent";
import EsriMap from "esri/Map";
import FeatureSet from "esri/tasks/support/FeatureSet";
import MapView from "esri/views/MapView";
import Search from "esri/widgets/Search";
import Graphic from "esri/Graphic";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import Locator from "esri/tasks/Locator";
import RouteTask from "esri/tasks/RouteTask";
import RouteParameters from "esri/tasks/support/RouteParameters";
import SimpleMarkerSymbol from "esri/symbols/SimpleMarkerSymbol";

const geocodeServiceUrl =
  "https://data.wsdot.wa.gov/ArcGIS/rest/services/Shared/MultinetLocator/GeocodeServer";

const routingUrl =
  "https://utility.arcgis.com/usrsvcs/appservices/AZZsdPDHci63zVOA/rest/services/World/Route/NAServer/Route_World";

const locator = new Locator({
  url: geocodeServiceUrl,
  requestOptions: {
    returnIntersection: true,
  },
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
  console.group("map click event");
  try {
    // TODO: Locate nearest intersection.
    const addressCandidate = await locator.locationToAddress({
      location: clickEvent.mapPoint,
      locationType: "street",
    });
    console.debug("address candidate", addressCandidate);
    const graphic = addressCandidateToGraphic(addressCandidate);

    intersectionsLayer.add(graphic);
  } catch (err) {
    const customEvent = new CustomEvent("locate-error", {
      detail: err,
    });
    window.dispatchEvent(customEvent);
  }
  console.groupEnd();
});

view.on("double-click", async (evt) => {
  if (intersectionsLayer.graphics.length < 2) {
    console.debug("not enough intersections");
    return;
  }

  const featureSet = new FeatureSet({
    features: intersectionsLayer.graphics.toArray(),
  });

  const routeParameters = new RouteParameters({
    stops: featureSet,
    returnDirections: false,
    returnRoutes: true,
    directionsLengthUnits: "miles",
    outSpatialReference: view.spatialReference,
    restrictionAttributes: [
      "Avoid Carpool Roads",
      "Avoid Limited Access Roads",
      "Avoid Express Lanes",
    ],
    doNotLocateOnRestrictedElements: true,
    ignoreInvalidLocations: true,
  });

  try {
    const routeResult = await routeTask.solve(routeParameters);

    console.debug("route result", routeResult);
  } catch (err) {
    console.error("route task error", err);
  }
});
