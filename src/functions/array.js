Array.prototype.last = function () {
  return this[this.length - 1]
}

Array.prototype.remove = function (elem) {
  const i = this.indexOf(elem)
  this.splice(i, 1)
}

Array.prototype.insertAfter = function (aboutElem, newElem) {
  const idx = this.indexOf(aboutElem)
  this.splice(idx + 1, 0, newElem)
}

Array.prototype.insertBefore = function (aboutElem, newElem) {
  const idx = this.indexOf(aboutElem)
  this.splice(idx, 0, newElem)
}
