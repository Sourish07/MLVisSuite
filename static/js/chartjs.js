const ctx = $('#myChart');

let url = $(location).attr('href');
let algoName = url.split('/').pop();

let datasets;
if (algoName === "linreg") {
    datasets = [
        {
            type: 'scatter',
            pointStyle: 'point',
            data: [],
            backgroundColor: "#FF0000",
            radius: 5,
        },
        {
            type: 'line',
            data: [],
            radius: 0
        }
    ]
} else if (algoName === "logreg") {
    datasets = [
        {
            type: 'scatter',
            pointStyle: 'point',
            data: [],
            backgroundColor: "#FF0000",
            radius: 5,
        },
        {
            type: 'scatter',
            pointStyle: 'point',
            data: [],
            backgroundColor: "#0000FF",
            radius: 5
        },
        {
            type: 'line',
            data: [],
            pointRadius: 0
        }
    ]
} else if (algoName === "kmeans") {
    datasets = [
        {
            type: 'scatter',
            pointStyle: 'point',
            data: [],
            backgroundColor: "#FF0000",
            radius: 5,
        },
        {
            type: 'scatter',
            pointStyle: 'star',
            data: [],
            backgroundColor: "#FF0000",
            radius: 15,
            borderWidth: 5
        },
        {
            type: 'scatter',
            pointStyle: 'point',
            data: [],
            backgroundColor: "#0000FF",
            radius: 5,
        },
        {
            type: 'line',
            data: [],
            pointRadius: 0
        }
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

            switch (algoName) {
                case "linreg":
                    linearRegression(new_point)
                    break;
                case "logreg":
                    logisticRegression(new_point)
                    break;
            }


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

function linearRegression(new_point) {
    const ajax_data = new_point;
    ajax_data["class"] = 'r'

    $.ajax({
        type: "POST",
        url: "add-point",
        data: JSON.stringify(ajax_data),
        contentType: "application/json"
    }).done(function (data) {
    }).fail(function (data) {
        alert("POST failed");
    });

    chart.data.datasets[0].data.push(new_point)
}

function logisticRegression(new_point) {
    const ajax_data = new_point;
    ajax_data["class"] = $("input[name='class']:checked").val();

    $.ajax({
        type: "POST",
        url: "add-point",
        data: JSON.stringify(ajax_data),
        contentType: "application/json"
    }).done(function (data) {
    }).fail(function (data) {
        alert("POST failed");
    });

    if (ajax_data['class'] === 'r') {
        chart.data.datasets[0].data.push(new_point)
    } else if (ajax_data['class'] === 'b') {
        chart.data.datasets[1].data.push(new_point)
    }
}