module.exports.hasDuplicates = function (array) {
  return (new Set(array)).size !== array.length;
}
