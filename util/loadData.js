const config = require('../config');

module.exports = async data => {
  if(data.length > 0) {
    const name = data[0].name;
    console.log(`Analyzing ${name}`)
    // Analyze Data
    const VOLUME_THRESHOLD = config.VOLUME_THRESHOLD;
    const PERCENT_THRESHOLD = config.PERCENT_THRESHOLD;
    const filterVolumeThreshold = data.filter(el => el.volume > VOLUME_THRESHOLD);
    const sorted = filterVolumeThreshold.slice().sort((a,b) => {
      return a.price - b.price
    });

    // Values
    const highestIndex = sorted.length - 1;
    const lowestIndex = 0;

    const highestPrice = sorted[highestIndex].price;
    const lowestPrice = sorted[lowestIndex].price;

    const highestPriceVolume = sorted[highestIndex].volume;
    const lowestPriceVolume = sorted[lowestIndex].volume;

    const percentDifference = (highestPrice / lowestPrice) - 1;

    if (percentDifference > PERCENT_THRESHOLD) {
      console.log(`-------${name}---------`)
      console.log(filterVolumeThreshold);
      console.log(`Highest: ${highestPrice} - Volume: ${highestPriceVolume}`);
      console.log(`Lowest: ${lowestPrice} - Volume: ${lowestPriceVolume}`);
      console.log(`---------------------------------`)
    }
  }
}