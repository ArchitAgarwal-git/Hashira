function decodeValue(base, value) {
    return parseInt(value, base);
}

function extractXY(jsonData) {
    const { n, k } = jsonData.keys;
    let xValues = [], yValues = [];
    for (let key in jsonData) {
        if (key !== "keys") {
            xValues.push(parseInt(key));
            yValues.push(decodeValue(parseInt(jsonData[key].base), jsonData[key].value));
        }
    }
    return { n, k, xValues, yValues };
}

function lagrangeInterpolation(xValues, yValues) {
    const n = xValues.length;
    let coeffs = Array(n).fill(0);

    for (let i = 0; i < n; i++) {
        let basis = [1];
        let denom = 1;

        for (let j = 0; j < n; j++) {
            if (i !== j) {
                denom *= (xValues[i] - xValues[j]);
                basis = multiplyPolynomial(basis, [-xValues[j], 1]);
            }
        }

        basis = basis.map(c => c * yValues[i] / denom);
        coeffs = addPolynomials(coeffs, basis);
    }
    return coeffs;
}

function multiplyPolynomial(p1, p2) {
    let result = Array(p1.length + p2.length - 1).fill(0);
    for (let i = 0; i < p1.length; i++) {
        for (let j = 0; j < p2.length; j++) {
            result[i + j] += p1[i] * p2[j];
        }
    }
    return result;
}

function addPolynomials(p1, p2) {
    let maxLen = Math.max(p1.length, p2.length);
    let result = Array(maxLen).fill(0);
    for (let i = 0; i < maxLen; i++) {
        result[i] = (p1[i] || 0) + (p2[i] || 0);
    }
    return result;
}

function calculateConstant() {
    const fileName = document.getElementById("jsonSelect").value;
    const resultDiv = document.getElementById("result");

    if (!fileName) {
        resultDiv.textContent = "Please select a JSON file.";
        return;
    }

    fetch(fileName)
    .then(res => res.json())
    .then(json => {
        let { xValues, yValues } = extractXY(json);
        let coeffs = lagrangeInterpolation(xValues, yValues);
        resultDiv.textContent = "Constant c: " + Math.round(coeffs[0]);
    })
    .catch(err => {
        console.error(err);
        resultDiv.textContent = "Error loading JSON.";
    });
}