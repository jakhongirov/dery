const formatNumber = (number) => {
   return new Intl.NumberFormat('en-US', { useGrouping: true }).format(number).replace(/,/g, ' ');
}

module.exports = {
   formatNumber,
}