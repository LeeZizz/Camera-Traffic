// Hàm tạo biểu đồ
function createChart(ctx, type, label, labels, data, bgColor, borderColor) {
  console.log(`Creating chart: ${label} with data:`, data);
  if (!data || data.length === 0 || data.every(val => val === 0)) {
    console.warn(`No valid data for chart: ${label}`);
    return null;
  }
  return new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [
        {
          label: label,
          data: data,
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderWidth: 1,
          fill: type === 'line' ? false : true, // Chỉ fill cho biểu đồ cột
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

// Hàm lấy dữ liệu từ API và cập nhật FE
function loadData() {
  console.log("Fetching data from http://localhost:3000/vehicles...");
  fetch('http://localhost:3000/vehicles')
    .then(res => {
      console.log("Fetch response status:", res.status);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log("Data received:", data);

      // Nếu không có dữ liệu, hiển thị "No data"
      if (!data || data.length === 0) {
        console.warn("No data received from API");
        document.getElementById('motorbikeCount').textContent = "No data";
        document.getElementById('carCount').textContent = "No data";
        document.getElementById('busCount').textContent = "No data";
        document.getElementById('truckCount').textContent = "No data";
        return;
      }

      // Sắp xếp dữ liệu theo id giảm dần và lấy bản ghi mới nhất
      const sortedData = data.sort((a, b) => b.id - a.id);
      const latestRecord = sortedData[0];
      console.log("Latest record:", latestRecord);

      // Kiểm tra key trong latestRecord
      console.log("Keys in latestRecord:", Object.keys(latestRecord));

      // Cập nhật card với bản ghi mới nhất
      console.log("Updating cards with latest record...");
      document.getElementById('motorbikeCount').textContent = latestRecord.motobike || 0;
      document.getElementById('carCount').textContent = latestRecord.car || 0;
      document.getElementById('busCount').textContent = latestRecord.bus || 0;
      document.getElementById('truckCount').textContent = latestRecord.truck || 0;

      // Chuẩn bị dữ liệu cho các biểu đồ (lấy 10 bản ghi mới nhất)
      const recentData = sortedData.slice(0, 10); // Lấy 10 bản ghi mới nhất
      const labels = recentData.map(record => `Record ${record.id}`);
      const motorbikeData = recentData.map(record => parseInt(record.motobike || 0));
      const carData = recentData.map(record => parseInt(record.car || 0));
      const busData = recentData.map(record => parseInt(record.bus || 0));
      const truckData = recentData.map(record => parseInt(record.truck || 0));

      console.log("Chart data:", { motorbikeData, carData, busData, truckData });

      // Cập nhật biểu đồ Traffic Flow (chỉ hiển thị Motorbike)
      console.log("Updating Traffic Flow chart (Motorbike)...");
      if (window.trafficFlowChart) window.trafficFlowChart.destroy();
      const trafficFlowCtx = document.getElementById('trafficFlow');
      if (trafficFlowCtx) {
        window.trafficFlowChart = createChart(
          trafficFlowCtx.getContext('2d'),
          'line',
          'Motorbike',
          labels,
          motorbikeData,
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 99, 132, 1)'
        );
      } else {
        console.error("Canvas element 'trafficFlow' not found");
      }

      // Cập nhật biểu đồ Traffic Analysis (chỉ hiển thị Car)
      console.log("Updating Traffic Analysis chart (Car)...");
      if (window.trafficAnalysisChart) window.trafficAnalysisChart.destroy();
      const trafficAnalysisCtx = document.getElementById('trafficAnalysis');
      if (trafficAnalysisCtx) {
        window.trafficAnalysisChart = createChart(
          trafficAnalysisCtx.getContext('2d'),
          'bar',
          'Car',
          labels,
          carData,
          'rgba(54, 162, 235, 0.2)',
          'rgba(54, 162, 235, 1)'
        );
      } else {
        console.error("Canvas element 'trafficAnalysis' not found");
      }

      // Cập nhật biểu đồ Collision Near Miss (chỉ hiển thị Bus)
      console.log("Updating Collision Near Miss chart (Bus)...");
      if (window.collisionNearMissChart) window.collisionNearMissChart.destroy();
      const collisionNearMissCtx = document.getElementById('collisionNearMiss');
      if (collisionNearMissCtx) {
        window.collisionNearMissChart = createChart(
          collisionNearMissCtx.getContext('2d'),
          'line',
          'Bus',
          labels,
          busData,
          'rgba(75, 192, 192, 0.2)',
          'rgba(75, 192, 192, 1)'
        );
      } else {
        console.error("Canvas element 'collisionNearMiss' not found");
      }

      // Cập nhật biểu đồ Collision Analysis (chỉ hiển thị Truck)
      console.log("Updating Collision Analysis chart (Truck)...");
      if (window.collisionAnalysisChart) window.collisionAnalysisChart.destroy();
      const collisionAnalysisCtx = document.getElementById('collisionAnalysis');
      if (collisionAnalysisCtx) {
        window.collisionAnalysisChart = createChart(
          collisionAnalysisCtx.getContext('2d'),
          'bar',
          'Truck',
          labels,
          truckData,
          'rgba(153, 102, 255, 0.2)',
          'rgba(153, 102, 255, 1)'
        );
      } else {
        console.error("Canvas element 'collisionAnalysis' not found");
      }
    })
    .catch(err => {
      console.error('Lỗi khi lấy dữ liệu:', err);
      // Hiển thị "Error" nếu có lỗi
      document.getElementById('motorbikeCount').textContent = "Error";
      document.getElementById('carCount').textContent = "Error";
      document.getElementById('busCount').textContent = "Error";
      document.getElementById('truckCount').textContent = "Error";
    });
}

// document.addEventListener('DOMContentLoaded', function () {
//   console.log("DOM fully loaded, calling loadData...");
//   // Gọi loadData khi trang được tải
//   loadData();
//   // Tự động làm mới dữ liệu mỗi 5 giây
//   setInterval(() => {
//     console.log("setInterval triggered, calling loadData...");
//     loadData();
//   }, 5000);

//   // Webcam access
//   console.log("Accessing webcam...");
//   const video = document.getElementById('cameraFeed');
//   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//     navigator.mediaDevices
//       .getUserMedia({ video: true })
//       .then(function (stream) {
//         console.log("Webcam stream obtained");
//         video.srcObject = stream;
//         video.play();
//       })
//       .catch(function (error) {
//         console.error('Error accessing webcam:', error);
//       });
//   } else {
//     console.error('getUserMedia not supported');
//   }
// });

document.addEventListener('DOMContentLoaded', function () {
  console.log("DOM fully loaded, calling loadData...");
  loadData();
  setInterval(() => {
    console.log("setInterval triggered, calling loadData...");
    loadData();
  }, 5000);

  // Stream video từ Flask backend - KHỐI NÀY SẼ ĐƯỢC VÔ HIỆU HÓA
  // console.log("Accessing video stream from Flask backend...");
  // const videoContainer = document.querySelector('.stream');
  // if (videoContainer) {
  //   const img = document.createElement('img');
  //   img.src = 'http://localhost:5000/video_feed';
  //   img.style.width = '100%';
  //   img.style.height = '100%';
  //   img.style.objectFit = 'cover';
  //   img.style.borderRadius = '8px';
  //   videoContainer.innerHTML = ''; // Xóa nội dung cũ
  //   videoContainer.appendChild(img);
  // } else {
  //   console.error("Element '.stream' not found");
  // }

  // Cấu hình cho các camera
  const cameraConfigs = [
    { id: 'cameraFeed', src: 'http://localhost:5000/video_feed', placeholder: '../picture/unnamed.png' }, // Thêm cameraFeed cho trang index
    { id: 'camera1', src: 'http://localhost:5000/video_feed', placeholder: '../picture/unnamed.png' },
    { id: 'camera2', src: 'http://localhost:5000/video_feed', placeholder: '../picture/unname2.png' },
    { id: 'camera3', src: 'http://localhost:5000/video_feed', placeholder: '../picture/unnamed.png' },
    { id: 'camera4', src: 'http://localhost:5000/video_feed', placeholder: '../picture/unname2.png' },
    { id: 'camera5', src: 'http://localhost:5000/video_feed', placeholder: '../picture/unnamed.png' },
    { id: 'camera6', src: 'http://localhost:5000/video_feed', placeholder: '../picture/unname2.png' }
  ];

  cameraConfigs.forEach(config => {
    const imgElement = document.getElementById(config.id); // Lấy thẻ <img> bằng ID
    if (imgElement) {
      // Thêm thuộc tính crossOrigin nếu nguồn là từ server khác (Flask)
      if (config.src.startsWith('http')) {
        imgElement.crossOrigin = "Anonymous"; 
      }
      imgElement.src = config.src; // Đặt nguồn cho thẻ <img>
      imgElement.onerror = function() { // Xử lý nếu không tải được src
        this.src = config.placeholder;
        console.error(`Error loading camera feed for ${config.id}. Falling back to placeholder: ${config.placeholder}`);
      };

      // Nếu là cameraFeed trên trang index.html, thiết lập chụp màn hình
      if (config.id === 'cameraFeed' && window.location.pathname.includes('index.html')) {
        let intervalStarted = false; // Cờ để đảm bảo interval chỉ được khởi tạo một lần

        const startScreenshotInterval = () => {
            if (intervalStarted) return; // Nếu đã khởi tạo thì không làm gì cả
            intervalStarted = true;
            console.log("Starting screenshot capture interval for cameraFeed.");
            setInterval(() => {
                captureAndSendScreenshot(imgElement);
            }, 10000); // Chụp mỗi 10 giây
        };

        // Đợi ảnh tải xong rồi mới bắt đầu chụp
        imgElement.onload = () => {
          console.log("Camera feed loaded via onload, attempting to start screenshot interval.");
          startScreenshotInterval();
        };
        // Xử lý trường hợp ảnh đã được cache và onload không được gọi (hoặc đã được gọi trước đó)
        // imgElement.complete có thể true ngay cả khi ảnh chưa thực sự render xong hoàn toàn trong một số trường hợp
        // naturalHeight > 0 là một kiểm tra tốt hơn cho việc ảnh đã có kích thước thực tế
        if (imgElement.complete && imgElement.naturalHeight !== 0) {
            console.log("Camera feed already loaded (cached or complete), attempting to start screenshot interval.");
            startScreenshotInterval();
        } else if (imgElement.complete && imgElement.naturalHeight === 0 && !imgElement.src.startsWith('data:')) {
            // Trường hợp hiếm: complete là true nhưng ảnh chưa có kích thước (ví dụ: src trống ban đầu)
            // Chờ một chút rồi thử lại, hoặc dựa hoàn toàn vào onload
            console.warn("Camera feed is complete but has no natural height. Waiting for onload or potential error.");
        }
      }
    } else {
      // console.error(`Image element with id \'${config.id}\' not found`); // Sửa lại thông báo lỗi nếu cần
    }
  });

  // Hàm chụp ảnh màn hình và gửi lên server
  function captureAndSendScreenshot(imageElement) {
    if (!imageElement || !imageElement.complete || imageElement.naturalHeight === 0) {
        console.warn("Image element not ready for capture or not loaded.");
        return;
    }
    console.log("Attempting to capture screenshot...");
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    const ctx = canvas.getContext('2d');
    
    try {
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/png');
        
        console.log("Screenshot captured, sending to server...");
        fetch('http://localhost:5000/save_screenshot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: dataURL }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error saving screenshot on server:', data.error);
            } else {
                console.log('Screenshot saved successfully on server:', data.filename);
            }
        })
        .catch(error => {
            console.error('Error sending screenshot to server:', error);
        });
    } catch (e) {
        console.error("Error capturing screenshot:", e);
        // Nếu có lỗi CORS khi vẽ ảnh, thử tải lại ảnh với crossOrigin set lại
        if (e.name === 'SecurityError' && imageElement.crossOrigin !== "Anonymous") {
            console.warn("CORS error detected. Attempting to reload image with crossOrigin=Anonymous");
            // Không nên set lại ở đây vì nó sẽ gây vòng lặp nếu server không có CORS header đúng
            // imageElement.crossOrigin = "Anonymous";
            // imageElement.src = imageElement.src; // Tải lại ảnh
        }
    }
  }

  // Global variables for pagination
  let currentPage = 1;
  const itemsPerPage = 24;

  // Nếu đang ở trang output.html, tải và hiển thị screenshots
  if (window.location.pathname.includes('output.html')) {
    loadScreenshots();
  }

  function loadScreenshots() {
    console.log(`Loading screenshots for output.html, page: ${currentPage}`);
    fetch('http://localhost:5000/get_screenshots')
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error('Error fetching screenshots:', data.error);
          const cameraContainer = document.querySelector('.camera-container');
          if (cameraContainer) {
            cameraContainer.innerHTML = '<p style="text-align:center; width:100%;">Error fetching screenshots. Is the Python server running?</p>';
          }
          renderPagination(0, 0); // Render empty pagination
          return;
        }
        const allScreenshots = data.screenshots || [];
        const cameraContainer = document.querySelector('.camera-container');
        
        if (cameraContainer) {
          cameraContainer.innerHTML = ''; // Xóa các ảnh cũ (nếu có)
          if (allScreenshots.length === 0) {
            cameraContainer.innerHTML = '<p style="text-align:center; width:100%;">No screenshots available.</p>';
            renderPagination(0, 0); // Render empty pagination
            return;
          }

          const totalPages = Math.ceil(allScreenshots.length / itemsPerPage);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const screenshotsToDisplay = allScreenshots.slice(startIndex, endIndex);

          screenshotsToDisplay.forEach((filename, index) => {
            const streamWrapper = document.createElement('div');
            streamWrapper.className = 'stream-wrapper';

            const streamHeader = document.createElement('h3');
            streamHeader.className = 'stream-header';
            // Display original index + 1 based on the full list, or page-specific index
            streamHeader.textContent = `Image ${startIndex + index + 1}`; 

            const streamDiv = document.createElement('div');
            streamDiv.className = 'stream';

            const img = document.createElement('img');
            img.src = `http://localhost:5000/screenshots/${filename}`;
            img.alt = `Screenshot ${filename}`;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';
            img.onerror = () => { 
                console.error(`Error loading image: ${filename}`);
                img.alt = "Error loading image";
            };

            streamDiv.appendChild(img);
            streamWrapper.appendChild(streamHeader);
            streamWrapper.appendChild(streamDiv);
            cameraContainer.appendChild(streamWrapper);
          });

          renderPagination(allScreenshots.length, totalPages);

        } else {
          console.error("Element '.camera-container' not found on output.html");
        }
      })
      .catch(error => {
        console.error('Error fetching screenshots:', error);
        const cameraContainer = document.querySelector('.camera-container');
        if (cameraContainer) {
            cameraContainer.innerHTML = '<p style="text-align:center; width:100%;">Error loading screenshots. Is the Python server running?</p>';
        }
        renderPagination(0, 0); // Render empty pagination
      });
  }

  function renderPagination(totalItems, totalPages) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) {
        console.error("Pagination container '.pagination' not found.");
        return;
    }
    paginationContainer.innerHTML = ''; // Clear existing pagination

    if (totalItems === 0) {
        // No items, no pagination needed beyond a message if desired
        // paginationContainer.innerHTML = '<p>No screenshots to paginate.</p>';
        return;
    }
    
    if (totalPages <= 1) {
        // Only one page or no pages, no pagination controls needed
        // You might want to display "Page 1 of 1" if totalItems > 0
        if (totalItems > 0) {
            const pageInfo = document.createElement('span');
            pageInfo.textContent = `Page 1 of 1 (${totalItems} item${totalItems > 1 ? 's' : ''})`;
            pageInfo.style.margin = '0 10px';
            paginationContainer.appendChild(pageInfo);
        }
        return;
    }

    // Previous Button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.className = 'pagination-button';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadScreenshots();
        }
    });
    paginationContainer.appendChild(prevButton);

    // Page Info
    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalItems} item${totalItems > 1 ? 's' : ''})`;
    pageInfo.style.margin = '0 10px';
    paginationContainer.appendChild(pageInfo);

    // Next Button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.className = 'pagination-button';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadScreenshots();
        }
    });
    paginationContainer.appendChild(nextButton);
  }
});