console.log(
    "%cAPI ile oynaşmamız bittiyse çıkalım da kasmasın he aşkım :)",
    "color: white; font-style: bold; background-color: red;padding: 2px"
    );
  

function updateCharts() {
    // Fetch data from Anadolu Ajansı and Anka Haber Ajansı
    const current_time = new Date(Date.now())
    const hours = current_time.getHours().toString().padStart(2, '0');
    const minutes = current_time.getMinutes().toString().padStart(2, '0');
    const seconds = current_time.getSeconds().toString().padStart(2, '0');
    const current_time_string = hours + ":" + minutes + ":" + seconds;
    fetch("https://pharmagen.ga")
        .then(response => response.json())
        .then(resultData => {
                    // Get the necessary data from the response objects
                    const erdoganAA = resultData.aa_data.CB.YurtIciDisi.c[0].r;
                    const kilicdarogluAA = resultData.aa_data.CB.YurtIciDisi.c[1].r;
                    const kilicdarogluAnka = resultData.anka_data.Sonuclar[0].ITOyOrani;
                    const erdoganAnka = resultData.anka_data.Sonuclar[1].ITOyOrani;

                    // Update the chart elements with the data
                    updateChart("chart1", "Recep Tayyip Erdoğan", erdoganAA, "Anadolu Ajansı");
                    updateChart("chart2", "Recep Tayyip Erdoğan", erdoganAnka, "Anka Haber Ajansı");
                    document.getElementById("update-time").innerText = "Güncelleme zamanı: " + current_time_string;
                    document.getElementById("aa-source").innerText = kilicdarogluAA + " / " + erdoganAA;
                    document.getElementById("anka-source").innerText = kilicdarogluAnka + " / " + erdoganAnka;
            
        });
}

function updateChart(chartId, candidateName, votePercentage, source) {
    const chartElement = document.getElementById(chartId);

    // Clear previous chart if it exists
    if (chartElement && chartElement.chart) {
        chartElement.chart.destroy();
    }

    // Create new chart
    const ctx = chartElement.getContext("2d");
    chartElement.chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: [candidateName, "Kemal Kılıçdaroğlu"],
            datasets: [{
                data: [votePercentage, 100 - votePercentage],
                backgroundColor: ["#ffa726", "#ff030a"]
            }]
        },
        options: {
            responsive: true,
            legend: {
                display: true,
                position: "bottom"
            },
            title: {
                display: true,
                text: `${candidateName} - ${source}`
            }
        }
    });
}

// Update the charts every 3 seconds
setInterval(updateCharts, 3000);
