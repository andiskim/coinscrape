const config = require('../config');

module.exports = async data => {
    // TODO: Upload data OR analyze Data
    const filterVolumeThreshold = data.filter(el => el.volume > config.VOLUME_THRESHOLD);
    console.log(filterVolumeThreshold);
  }