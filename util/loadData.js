const config = require('../config');

module.exports = async data => {
  if(data.length > 0) {
    try {
      const name = data[0].name;
      const symbol = data[0].symbol;
      const rank = data[0].rank;
      console.log(`Analyzing ${name} (Rank ${rank})`)
      // Analyze Data
      const VOLUME_THRESHOLD = config.VOLUME_THRESHOLD;
      const PERCENT_THRESHOLD = config.PERCENT_THRESHOLD;
      const filterVolumeThreshold = data.filter(el => !!el.price && !!el.volume && el.volume > VOLUME_THRESHOLD);
      // Make sure filtered data has data points
      if (filterVolumeThreshold.length > 0) {
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
    
        const highestPricePair = sorted[highestIndex].pairs;
        const lowestPricePair = sorted[lowestIndex].pairs;
    
        const percentDifference = ((highestPrice / lowestPrice) - 1)*100;
    
        if (percentDifference > PERCENT_THRESHOLD) {
          console.log(`-------${name} (${symbol})---------`)
          console.log(`Highest: ${highestPrice} - Volume: ${highestPriceVolume} - Pair: ${highestPricePair}`);
          console.log(`Lowest: ${lowestPrice} - Volume: ${lowestPriceVolume} - Pair: ${lowestPricePair}`);
          console.log(`Percent Difference: ${percentDifference}%`);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
}