var pt = Map.getCenter()

Map.addLayer(pt, {}, 'center')

var aster = ee.ImageCollection('ASTER/AST_L1T_003')
  .filterBounds(pt)
  .filter(ee.Filter.and(
      ee.Filter.listContains('ORIGINAL_BANDS_PRESENT', 'B01'),
      ee.Filter.listContains('ORIGINAL_BANDS_PRESENT', 'B3N'),
      ee.Filter.listContains('ORIGINAL_BANDS_PRESENT', 'B04')
      ))
      
print('Count: ', aster.aggregate_count('system:id'))      

var list = aster.toList(10, 1);
var first = ee.Image(list.get(0))
var second = ee.Image(list.get(9)) 

var vis = {bands: ['B04', 'B3N', 'B01'], min:7, max:130}
Map.addLayer(first, vis, 'first')
Map.addLayer(second, vis, 'second')


/*
// add a few more
for(var i = 0; i < 3; i++) {
  Map.addLayer(ee.Image(aster.toList(1, i).get(0)), {bands: ['B04', 'B3N', 'B01'], min:7, max:130}, i)
}
*/


// co-register
var displacementBad = second.unitScale(0, 255).normalizedDifference(['B3N','B02'])
Map.addLayer(displacementBad, {min:-0.5, max:0.5}, 'displaycement target (bad)', false)

var displacementGood = first.unitScale(0, 255).normalizedDifference(['B3N','B02'])
Map.addLayer(displacementGood, {min:-0.5, max:0.5}, 'displaycement reference', false)

// Determine the displacement by matching only the 'R' bands.
var displacement = displacementBad.displacement({
  referenceImage: displacementGood,
  maxOffset: 60.0,
  patchWidth: 2000.0
});

// Compute image offset and direction.
var offset = displacement.select('dx').hypot(displacement.select('dy'));
var angle = displacement.select('dx').atan2(displacement.select('dy'));

// Display offset distance and angle.
Map.addLayer(offset, {min:0, max: 20}, 'offset');
Map.addLayer(angle, {min: -Math.PI, max: Math.PI}, 'angle');

// Use the computed displacement to register all original bands.
var registered = second.displace(displacement);

// Show the results of co-registering the images.
Map.addLayer(registered, vis, 'second (co-registered)');
