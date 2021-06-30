var ctx = $('#myChart');
const chart = new Chart(ctx, {
    data: {
        datasets: [
            {
                type: 'scatter',
                data: [],
                pointBackgroundColor: "#FF0000",
                pointRadius: 5
            },
            {
                type: 'line',
                data: [],
                pointRadius: 0
            }
        ]
    },
    options: {
        onClick: (e) => {
            const canvasPosition = Chart.helpers.getRelativePosition(e, chart);

            let dataX = chart.scales.xAxis.getValueForPixel(canvasPosition.x).toFixed(2);
            let dataY = chart.scales.yAxis.getValueForPixel(canvasPosition.y).toFixed(2);
            dataX = parseFloat(dataX)
            dataY = parseFloat(dataY)
            console.log(dataX, dataY)
            console.log(typeof dataX)
            console.log(typeof dataY)

            const new_point = {
                x: dataX,
                y: dataY
            }

            const ajax_data = new_point;
            ajax_data["class"] = 'r'

            $.ajax({
                type: "POST",
                url: "add-point",
                data: JSON.stringify(ajax_data),
                contentType: "application/json"
            }).done(function (data) {
                //$("#graph").html(data)
            }).fail(function (data) {
                alert("POST failed");
            });

            chart.data.datasets[0].data.push(new_point)

            chart.update();
        },
        title: {
            display: true,
            text: "Linear Regression"
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
        animation: false
    }
});