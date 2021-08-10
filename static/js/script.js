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

///////////////////////////////////////////
const nav = $(".mobile-sidebar-nav");

$(".hamburger-icon").on("click", function (e) {
    nav.css("width", "300px");
});

nav.on("click", function (e) {
    e.stopPropagation();
})

$(document).on("click", function (e) {

    if (nav.css("width") !== "0px") {
        nav.css("width", 0);
    }
});

$(".close-sidebar-nav").on("click", function () {
    nav.css("width", 0);
})
///////////////////////////////////////////

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
        var indexOfLineDataset;
        if (algoName === "linreg-grad-desc") {
            $("#equation").html(addLinRegEquation(data['coefficients']))
            indexOfLineDataset = 1;

        } else if (algoName === "logreg-grad-desc") {
            $("#equation").html(addLogRegEquation(data['coefficients']))
            indexOfLineDataset = 2;
        }

        if (data['line_points'].length) {
            chart.data.datasets[indexOfLineDataset].data.length = 0
            chart.data.datasets[indexOfLineDataset].data.push(...data['line_points'])
            chart.update()
        }

        $("#converged").text(data['converged'])
        $("#cost").text(data['cost'])
    }).fail(failedPost);
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
    }).done(updateKMeansInfo).fail(failedPost);
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
    }).done(updateKMeansInfo).fail(failedPost);
}

function updateKMeansInfo(data) {
    chart.data.datasets[0].data.length = 0
    for (let i = 0; i < 5; i++) {
        chart.data.datasets[i * 2 + 1].data.length = 0
        chart.data.datasets[i * 2 + 2].data.length = 0

        chart.data.datasets[i * 2 + 1].data.push(...data['data_points'][i])
        chart.data.datasets[i * 2 + 2].data.push(data['centroids_coords'][i])

    }
    chart.update()

    $("#converged").text(data['converged'])
    $("#next_step").text(data['next_step'])
}

function failedPost() {
    alert("POST failed");
}