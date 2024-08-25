document.getElementById('borrowForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form values
    const borrowDate = document.getElementById('borrowDate').value;
    const studentId = document.getElementById('studentId').value;
    const studentName = document.getElementById('studentName').value;
    const equipment = document.getElementById('equipment').value;

    // สร้างออบเจ็กต์คำขอ
    const request = {
        id: Date.now(), // สร้าง ID ไม่ซ้ำกัน
        dateTime: borrowDate,
        studentId,
        studentName,
        equipment,
        type: 'ยืม',
        status: 'รออนุมัติ'
    };

    // ดึงคำขอทั้งหมดจาก Local Storage
    let requests = JSON.parse(localStorage.getItem('requests')) || [];

    // เช็คจำนวนคำขอ
    const maxRequestsPerPage = 4;
    const totalPages = 100;

    // ค้นหาหน้าปัจจุบัน
    let currentPage = Math.floor(requests.length / maxRequestsPerPage) + 1;

    if (requests.length >= maxRequestsPerPage * totalPages) {
        Swal.fire({
            icon: 'error',
            title: 'ไม่สามารถบันทึกคำขอได้อีกต่อไป',
            text: 'จำนวนคำขอเต็มแล้ว',
            confirmButtonText: 'ตกลง'
        });
        return;
    }

    // เพิ่มคำขอใหม่เข้าไป
    requests.push(request);

    // บันทึกกลับไปที่ Local Storage
    localStorage.setItem('requests', JSON.stringify(requests));

    // แสดงการโหลดขณะส่งคำขอ
    Swal.fire({
        title: 'กำลังส่งคำขอ...',
        text: 'กรุณารอสักครู่',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Send data to Google Sheets via Apps Script Web App
    fetch('https://script.google.com/macros/s/AKfycbxvtdP0WK9IHDy06cMDoHrBWW1-yliO8pVXVK66TKhTWubSQwBPkOjKuHUONTpQQIjb/exec', {
        method: 'POST',
        body: new URLSearchParams({ 
            dateTime: borrowDate,
            studentId: studentId,
            studentName: studentName,
            equipment: equipment 
        }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
        .then(response => response.text())
        .then(data => {
            console.log(data); // For debugging purposes
            Swal.fire({
                icon: 'success',
                title: 'สำเร็จ!',
                text: 'คำขอยืมถูกส่งแล้ว',
                confirmButtonText: 'ตกลง'
            }).then(() => {
                // หลังจากกดตกลง ให้ทำการล้างข้อมูลในฟอร์ม
                document.getElementById('borrowForm').reset();
            });
        })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'กรุณาลองใหม่',
            confirmButtonText: 'ตกลง'
        });
    });
});
