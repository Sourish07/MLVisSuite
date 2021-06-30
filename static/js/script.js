$("#more-info").on("click", function (e) {
    $("#info-modal").fadeIn()
})

$("#modal-close").on("click", function (e) {
    $("#info-modal").fadeOut()
})

$(window).on("click", function (e) {
    if (e.target.id === "info-modal") {
        $("#info-modal").fadeOut()
    }
})


// function addPoint(color) {
//     alert("hello")
//     if (!color) {
//         color = $("input[name='class']:checked").val()
//     }
//     const point = $(".mpld3-coordinates").text();
//     let coordinates = point.matchAll("-?\\d+\\.?\\d+");
//     coordinates = Array.from(coordinates)
//     if (coordinates.length === 0) {
//         return
//     }
//     const x = parseFloat(coordinates[0][0]);
//     const y = parseFloat(coordinates[1][0]);
//
//     $.ajax({
//         type: "POST",
//         url: "add-point",
//         data: JSON.stringify({"x": x, "y": y, "class": color}),
//         contentType: "application/json"
//     }).done(function (data) {
//         $("#graph").html(data)
//     }).fail(function (data) {
//         alert("POST failed");
//     });
// }

function gradDesc(numOfIterations, algoName) {
    const numOfDegrees = $("input[name='degree']:checked").val()
    $.ajax({
        type: "POST",
        url: algoName,
        data: JSON.stringify({
            "num_of_iterations": numOfIterations,
            "degree": numOfDegrees
        }),
        contentType: "application/json"
    }).done(function (data) {
        if (algoName === "linreg-grad-desc") {
            $("#equation").html(addLinRegEquation(data['coefficients']))

        } else if (algoName === "logreg-grad-desc") {
            $("#equation").html(addLogRegEquation(data['coefficients']))
        }
        //$("#graph").html(data['graph'])

        //console.log(chart.data.datasets[1].data)
        //chart.data.datasets[1].data.pop()
        if (data['line_points'].length) {
            chart.data.datasets[1].data.length = 0
            chart.data.datasets[1].data.push(...data['line_points'])
            chart.update()
        }

        $("#converged").text(data['converged'])
        $("#cost").text(data['cost'])
    }).fail(function (data) {
        //console.log(chart)
        alert("POST failed");
    });
}

function addLinRegEquation(coefficients) {
    if (coefficients.length === 0) {
        return "0"
    }

    let html = ""
    for (let i = 0; i < coefficients.length; i++) {
        if (coefficients[i] === 0)
            continue

        if (i === 0) {
            if (coefficients[i] < 0) {
                html = coefficients[i] + html
            } else {
                html = "+" + coefficients[i] + html
            }
        } else if (i === 1 && coefficients[i] !== -1 && coefficients[i] !== 1) {
            if (coefficients[i] < 0) {
                html = coefficients[i] + "x" + html
            } else {
                html = "+" + coefficients[i] + "x" + html
            }
        } else if (i === 1 && (coefficients[i] !== -1 || coefficients[i] !== 1)) {
            if (coefficients[i] < 0) {
                html = "-x" + html
            } else {
                html = "+" + "x" + html
            }
        } else if (i > 1 && coefficients[i] !== -1 && coefficients[i] !== 1) {
            if (coefficients[i] < 0) {
                html = coefficients[i] + "x" + "<sup>" + i + "</sup>" + html
            } else {
                html = "+" + coefficients[i] + "x" + "<sup>" + i + "</sup>" + html
            }
        } else if (i > 1 && (coefficients[i] !== -1 || coefficients[i] !== 1)) {
            if (coefficients[i] < 0) {
                html = "x" + "<sup>" + i + "</sup>" + html
            } else {
                html = "+" + "x" + "<sup>" + i + "</sup>" + html
            }
        }
    }
    if (html.charAt(0) === '+') {
        html = html.substring(1)
    }
    return html
}

function addLogRegEquation(coefficients) {
    if (coefficients.length === 0) {
        return "0"
    }
    let html = ""
    for (let i = 0; i < coefficients.length; i++) {
        if (coefficients[i] === 0)
            continue

        const exponent = Math.ceil(i / 2);

        let xVar = ""
        if (Number.isInteger(i / 2)) {
            xVar = "x" + "<sub>1</sub>"
        } else {
            xVar = "x" + "<sub>2</sub>"
        }

        if (exponent === 0) {
            if (coefficients[i] < 0) {
                html = coefficients[i] + html
            } else {
                html = "+" + coefficients[i] + html
            }
        } else if (exponent === 1 && coefficients[i] !== -1 && coefficients[i] !== 1) {
            if (coefficients[i] < 0) {
                html = coefficients[i] + xVar + html
            } else {
                html = "+" + coefficients[i] + xVar + html
            }
        } else if (exponent === 1 && (coefficients[i] !== -1 || coefficients[i] !== 1)) {
            if (coefficients[i] < 0) {
                html = "-" + xVar + html
            } else {
                html = "+" + xVar + html
            }
        } else if (exponent > 1 && coefficients[i] !== -1 && coefficients[i] !== 1) {
            if (coefficients[i] < 0) {
                html = coefficients[i] + xVar + "<sup>" + exponent + "</sup>" + html
            } else {
                html = "+" + coefficients[i] + xVar + "<sup>" + exponent + "</sup>" + html
            }
        } else if (exponent > 1 && (coefficients[i] !== -1 || coefficients[i] !== 1)) {
            if (coefficients[i] < 0) {
                html = xVar + "<sup>" + exponent + "</sup>" + html
            } else {
                html = "+" + xVar + "<sup>" + exponent + "</sup>" + html
            }
        }
    }
    if (html.charAt(0) === '+') {
        html = html.substring(1)
    }
    return html
}

function kMeans(numOfIterations) {
    const numOfClusters = $("input[name='clusters']:checked").val()
    $.ajax({
        type: "POST",
        url: 'kmeans-iteration',
        data: JSON.stringify({
            "num_of_iterations": numOfIterations,
            "num_of_clusters": numOfClusters
        }),
        contentType: "application/json"
    }).done(updateKMeansInfo).fail(function (data) {
        alert("POST failed");
    });
}

function reinitializeCentroids() {
    const numOfClusters = $("input[name='clusters']:checked").val()
    $.ajax({
        type: "POST",
        url: 'kmeans-reinitialize',
        data: JSON.stringify({
            "num_of_clusters": numOfClusters
        }),
        contentType: "application/json"
    }).done(updateKMeansInfo).fail(function (data) {
        alert("POST failed");
    });
}

function updateKMeansInfo(data) {
    $("#graph").html(data['graph'])
    $("#converged").text(data['converged'])
    $("#next_step").text(data['next_step'])
}
