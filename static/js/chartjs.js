const ctx = $('#myChart');

let url = $(location).attr('href');
let algoName = url.split('/').pop();

let datasets;

function createPointDataset(color) {
    return {
        type: 'scatter',
        pointStyle: 'point',
        data: [],
        backgroundColor: color,
        radius: 5,
    }
}

function createLineDataset() {
    return {
        type: 'line',
        data: [],
        radius: 0
    }
}

function hexToRgb(hex) {
    // This function is from: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


function createStarDataset(color) {
    const rgb_colors = hexToRgb(color);
    return [
        createPointDataset(color),
        {
            type: 'scatter',
            pointStyle: 'star',
            data: [],
            borderColor: "rgba(" + rgb_colors['r'] + ", " + rgb_colors['g'] + ", " + rgb_colors['b'] + ", 0.4)",
            radius: 15,
            borderWidth: 5
        }]
}

if (algoName === "linreg" || algoName === "logreg") {
    datasets = [
        createPointDataset("#FF0000"),
        createLineDataset()
    ]
    if (algoName === "logreg") {
        datasets.splice(1, 0, createPointDataset("#0000FF"))
    }
} else if (algoName === "kmeans") {
    // Use the following indices for the point datasets 1, 3, 5, 7, 9
    // Use the following indices for the star datasets 2, 4, 6, 8, 10
    datasets = [
        createPointDataset("#000000"),
        ...createStarDataset("#FF0000"),
        ...createStarDataset("#0000FF"),
        ...createStarDataset("#00FF00"),
        ...createStarDataset("#ad03fc"),
        ...createStarDataset("#fc03eb"),
    ]
}

const chart = new Chart(ctx, {
    data: {
        datasets: datasets
    },
    options: {
        onClick: (e) => {
            const canvasPosition = Chart.helpers.getRelativePosition(e, chart);

            let dataX = chart.scales.xAxis.getValueForPixel(canvasPosition.x).toFixed(2);
            let dataY = chart.scales.yAxis.getValueForPixel(canvasPosition.y).toFixed(2);
            dataX = parseFloat(dataX)
            dataY = parseFloat(dataY)

            const new_point = {
                x: dataX,
                y: dataY
            }

            // switch (algoName) {
            //     case "linreg":
            //         linearRegression(new_point)
            //         break;
            //     case "logreg":
            //         logisticRegression(new_point)
            //         break;
            // }
            addPoint(new_point)


            chart.update();
        },
        scales: {
            xAxis: {
                position: 'center',
                min: -10,
                max: 10
            },
            yAxis: {
                position: 'center',
                min: -10,
                max: 10
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: false
            },
        },
        layout: {
            padding: 20
        },
        events: ['click'],
        animation: false
    }
});

function addPoint(new_point) {
    const ajax_data = new_point;

    if (algoName === 'logreg') {
        ajax_data["class"] = parseInt($("input[name='class']:checked").val());
    } else {
        ajax_data["class"] = 0
    }

    $.ajax({
        type: "POST",
        url: "add-point",
        data: JSON.stringify(ajax_data),
        contentType: "application/json"
    }).fail(function () {
        alert("POST failed");
    });

    chart.data.datasets[ajax_data["class"]].data.push(new_point)
}

// function logisticRegression(new_point) {
//     const ajax_data = new_point;
//     ajax_data["class"] = parseInt($("input[name='class']:checked").val());
//     console.log(ajax_data['class'])
//     $.ajax({
//         type: "POST",
//         url: "add-point",
//         data: JSON.stringify(ajax_data),
//         contentType: "application/json"
//     }).done(function (data) {
//     }).fail(function (data) {
//         alert("POST failed");
//     });
//
//     chart.data.datasets[ajax_data["class"]].data.push(new_point)
// }