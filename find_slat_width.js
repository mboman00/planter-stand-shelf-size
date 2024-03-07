// This program calculates slats for 3 platforms with given lengths
// The slats should be equal in size and space, as close to 40mm as possible.
// All variables are hardcoded, but should be easy to change.


// Function to create a range of numbers similar to Python's range function
function range(start, end, step = 1) {
  let arr = []
  for (let i = start; i <= end; i += step) {
    arr.push(i)
  }
  return arr
}

// Function to find slat width for a single given platform length
// The function returns an array of valid slat widths and number of slats
function findSlatWidth(
  platformLength,
  startSlatWidth = 35,
  endSlatWidth = 45,
  stepSlatWidth = 0.1
) {
  let validSlatWidths = []
  let validNumSlats = []
  for (
    let slatWidth = startSlatWidth;
    slatWidth <= endSlatWidth;
    slatWidth += stepSlatWidth
  ) {
    let numSlats = (platformLength - slatWidth) / (2 * slatWidth)
    if (Math.abs(numSlats - Math.round(numSlats)) > 0.1) {
      continue
    }
    let totalCalculatedLength = numSlats * (2 * slatWidth) + slatWidth
    if (Math.abs(totalCalculatedLength - platformLength) < 0.1) {
      validSlatWidths.push(slatWidth)
      validNumSlats.push(numSlats)
    }
  }
  return [validSlatWidths, validNumSlats]
}

// Function to adjust the slat width for all platforms
// While maintaing the platform lengths, the function finds the best slat width(s)
// for each platform, and returns an array of the best slat widths for each platform
function adjustPlatforms(platformLengths) {
  let results = []
  for (let i = 0; i < platformLengths.length; i++) {
    let platformLength = platformLengths[i]
    for (let adjustedLength of range(
      platformLength - slatWidthPlusOrMinus,
      platformLength + slatWidthPlusOrMinus + slatStepSize,
      slatStepSize
    )) {
      let [slatWidths, numSlats] = findSlatWidth(adjustedLength, 35, 45, 0.1)
      if (slatWidths.length > 0) {
        for (let j = 0; j < slatWidths.length; j++) {
          let width = slatWidths[j]
          let slats = numSlats[j]
          let otherPlatforms = platformLengths
            .slice(0, i)
            .concat(platformLengths.slice(i + 1))
          let otherWidthsAndSlats = otherPlatforms.map((platLen) =>
            findSlatWidth(
              platLen,
              width - slatWidthPlusOrMinus,
              width + slatWidthPlusOrMinus,
              slatStepSize
            )
          )
          for (let [otherWidths, otherSlats] of otherWidthsAndSlats) {
            if (otherWidths.length > 0) {
              for (let k = 0; k < otherWidths.length; k++) {
                let otherWidth = otherWidths[k]
                if (Math.abs(otherWidth - width) <= 2) {
                  results.push([adjustedLength, width, slats])
                }
              }
            }
          }
        }
      }
    }
  }
  return results
}

let platformLengths = [1000, 720, 439]
let slatWidthPlusOrMinus = 5
let slatStepSize = 0.5

let matrixPlatforms = []
let rangeI = 2
let rangeJ = 2
let rangeK = 2

// Create a matrix of platform lengths to test
for (let i of range(platformLengths[0] - rangeI, platformLengths[0] + rangeI)) {
  for (let j of range(
    platformLengths[1] - rangeJ,
    platformLengths[1] + rangeJ
  )) {
    for (let k of range(platformLengths[2], platformLengths[2] + rangeK)) {
      matrixPlatforms.push([i, j, k])
    }
  }
}

// Find the best slat width for each row in the matrix
let bestResults = []
for (let platformLengths of matrixPlatforms) {
  let results = []
  results.push(adjustPlatforms(platformLengths))
  let platformResults = []
  for (let i = 0; i < platformLengths.length; i++) {
    let platformLength = platformLengths[i]
    let best = [platformLength, 40, (platformLength - 40) / 80]
    let filteredResults = results[results.length - 1].filter(
      (result) => result[0] === platformLength
    )
    if (filteredResults.length > 0) {
      best = filteredResults.reduce((prev, curr) =>
        Math.abs(curr[0] - platformLength) < Math.abs(prev[0] - platformLength)
          ? curr
          : prev
      )
    }
    platformResults.push(best)
  }
  bestResults.push(platformResults)
}

let minSet = [];
let minCloseness = 500;
for (let i = 0; i < bestResults.length; i++) {
  let result = bestResults[i].map(([PlatformLength, SlatWidth, SlatCount]) => ({
    PlatformLength: parseFloat(PlatformLength.toFixed(2)),
    SlatWidth: parseFloat(SlatWidth.toFixed(2)),
    SlatCount: parseFloat(SlatCount.toFixed(2))
  }));
  if (i === 0) {
    minSet = result;
  } else {
    let minA = result[0].SlatWidth;
    let minB = result[1].SlatWidth;
    let minC = result[2].SlatWidth;
    let closeness = Math.abs(minA - minB) + Math.abs(minA - minC) + Math.abs(minB - minC);
    if (closeness < minCloseness) {
      minCloseness = closeness;
      minSet = result;
    }
  }
}

console.table(minSet);
