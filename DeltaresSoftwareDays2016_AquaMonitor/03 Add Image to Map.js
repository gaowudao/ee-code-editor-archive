/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var srtm = ee.Image("USGS/SRTMGL1_003");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
print(srtm);

Map.addLayer(srtm, {min:0, max:1000});
