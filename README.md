# Test app: Access routing proxy URL

A test of using [route service][Route service with synchronous execution] via [proxy services][Working with Proxy Services]

## Build

```terminal
npm install
```

## Test

Requires [dotnet-serve] to be installed.

```terminal
npm serve
```

Click two intersections. Once points have been drawn, double click to find route between them.

### Doesn't currently work

Currently, a dialog will appear prompting for login, which should not happen.

[dotnet-serve]:https://github.com/natemcmaster/dotnet-serve
[Working with Proxy Services]:https://developers.arcgis.com/documentation/core-concepts/security-and-authentication/working-with-proxies/
[Route service with synchronous execution]:https://developers.arcgis.com/rest/network/api-reference/route-synchronous-service.htm