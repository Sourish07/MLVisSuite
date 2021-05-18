function addPoint() {
    var color = $("input[name='class']:checked").val()
    if (!color) {
        color = "r"
    }
    const point = $(".mpld3-coordinates").text();
    let coordinates = point.matchAll("-?\\d+\\.?\\d+");
    coordinates = Array.from(coordinates)
    if (coordinates.length === 0) {
        return
    }
    const x = parseFloat(coordinates[0][0]);
    const y = parseFloat(coordinates[1][0]);

    $.ajax({
        type: "POST",
        url: "add-point",
        data: JSON.stringify({"x": x, "y": y, "class": color}),
        contentType: "application/json"
    }).done(function (data) {
        $("#graph").html(data)
    }).fail(function (data) {
        alert("POST failed");
    });
}

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
        addEquation(data['coefficients'])
        $("#graph").html(data['graph'])
        $("#converged").text(data['converged'])
        $("#cost").text(data['cost'])
    }).fail(function (data) {
        alert("POST failed");
    });
}

function addEquation(coefficients) {
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
        } else {
            alert("oops")
        }
    }
    if (html.charAt(0) === '+') {
        html = html.substring(1)
    }
    $("#equation").html(html)
}

function addPointWithColor() {
    var color = $("input[name='class']:checked").val()
    addPoint(color)
}