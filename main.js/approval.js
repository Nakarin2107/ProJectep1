const maxRequestsPerPage = 5;
const totalPages = 100;
let currentPage = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; 
    const year = date.getFullYear() + 543; 
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}`;
}

function countBorrowedTimes(studentId) {
    let requests = JSON.parse(localStorage.getItem('requests')) || [];
    return requests.filter(request => request.studentId === studentId).length;
}

function loadRequests(page) {
    const requestsTable = document.getElementById('requestsTable');
    const requests = JSON.parse(localStorage.getItem('requests')) || [];

    // Clear previous rows except the header
    requestsTable.querySelectorAll('tr:not(:first-child)').forEach(row => row.remove());

    // Calculate start and end for pagination
    const start = (page - 1) * maxRequestsPerPage;
    const end = start + maxRequestsPerPage;
    const paginatedRequests = requests.slice(start, end);

    paginatedRequests.forEach(request => {
        const row = requestsTable.insertRow();
        row.className = request.status === 'อนุมัติ' ? 'table-custom-approved' :
                        request.status === 'ปฏิเสธ' ? 'table-custom-denied' :
                        request.status === 'คืนแล้ว' ? 'table-custom-returned' : ''; 
    
        const formattedDateTime = formatDate(request.dateTime);
    
        row.insertCell(0).innerText = (start + paginatedRequests.indexOf(request) + 1);
        row.insertCell(1).innerText = formattedDateTime;
        row.insertCell(2).innerText = request.studentId;
        row.insertCell(3).innerText = request.studentName;
        row.insertCell(4).innerText = request.equipment;
        row.insertCell(5).innerText = request.type;
        row.insertCell(6).innerText = request.status;
    
        const returnDateTime = request.returnDateTime ? formatDate(request.returnDateTime) : '-';
        row.insertCell(7).innerText = returnDateTime;
    
        const actionCell = row.insertCell(8);

        // // Add number of times borrowed
        // const borrowedTimesCell = row.insertCell(9);
        // borrowedTimesCell.innerText = countBorrowedTimes(request.studentId);
    
        // Add buttons based on status
        if (request.status === 'รออนุมัติ') {
            const approveButton = document.createElement('button');
            approveButton.innerText = 'อนุมัติ';
            approveButton.className = 'btn btn-success btn-sm mr-2';
            approveButton.onclick = () => updateRequestStatus(request.id, 'อนุมัติ');
    
            const denyButton = document.createElement('button');
            denyButton.innerText = 'ปฏิเสธ';
            denyButton.className = 'btn btn-danger btn-sm';
            denyButton.onclick = () => updateRequestStatus(request.id, 'ปฏิเสธ');
            
            actionCell.appendChild(approveButton);
            actionCell.appendChild(denyButton);
        } else {
            const editButton = document.createElement('button');
            editButton.innerText = 'แก้ไข';
            editButton.className = 'btn btn-warning btn-sm mr-2';
            editButton.onclick = () => {
                if (request.status !== 'คืนแล้ว') {
                    editRequest(request.id);
                }
            };
            if (request.status === 'คืนแล้ว') {
                editButton.classList.add('disabled');
                editButton.title = 'ไม่สามารถแก้ไขได้';
            }
    
            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'ลบ';
            deleteButton.className = 'btn btn-danger btn-sm';
            deleteButton.onclick = () => deleteRequest(request.id);
    
            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);
        }
    });
    
    // Update pagination buttons
    document.getElementById('prevPage').classList.toggle('disabled', page <= 1);
    document.getElementById('nextPage').classList.toggle('disabled', page >= totalPages);

    document.getElementById('prevPage').onclick = () => {
        if (page > 1) {
            currentPage--;
            loadRequests(currentPage);
        }
    };
    document.getElementById('nextPage').onclick = () => {
        if (page < totalPages) {
            currentPage++;
            loadRequests(currentPage);
        }
    }
}

window.onload = () => loadRequests(currentPage);

// ฟังก์ชันสำหรับอัปเดตสถานะ
function updateRequestStatus(id, status) {
    let requests = JSON.parse(localStorage.getItem('requests')) || [];
    requests = requests.map(request => {
        if (request.id === id) {
            return { ...request, status };
        }
        return request;
    });
    localStorage.setItem('requests', JSON.stringify(requests));
    loadRequests(currentPage);

    // แสดงข้อความแจ้งเตือนหลังจากอัปเดตสถานะ
    Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: `คำขอถูก${status}แล้ว`,
        confirmButtonText: 'ตกลง'
    });
}

// ฟังก์ชันสำหรับแก้ไขคำขอ
function editRequest(id) {
    const modal = new bootstrap.Modal(document.getElementById('statusModal'));
    const statusSelect = document.getElementById('statusSelect');
    const requestId = document.getElementById('requestId');
    
    requestId.value = id;
    statusSelect.value = '';
    modal.show();
}

// ฟังก์ชันสำหรับอัปเดตสถานะใหม่ในคำขอ
function updateStatus() {
    const statusSelect = document.getElementById('statusSelect');
    const requestId = document.getElementById('requestId').value;
    const newStatus = statusSelect.value;

    if (newStatus) {
        let requests = JSON.parse(localStorage.getItem('requests')) || [];
        requests = requests.map(request => {
            if (request.id === parseInt(requestId, 10)) {
                return { ...request, status: newStatus };
            }
            return request;
        });
        localStorage.setItem('requests', JSON.stringify(requests));
        loadRequests(currentPage);
        
        // แสดงข้อความแจ้งเตือนหลังจากอัปเดตสถานะ
        Swal.fire({
            icon: 'success',
            title: 'สำเร็จ!',
            text: 'คำขอถูกแก้ไขแล้ว',
            confirmButtonText: 'ตกลง'
        });
        bootstrap.Modal.getInstance(document.getElementById('statusModal')).hide();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'กรุณาเลือกสถานะที่ถูกต้อง',
            confirmButtonText: 'ตกลง'
        });
    }
}

function updatePaginationInfo(page, totalPages) {
    document.getElementById('pageInfo').innerText = `หน้า ${page} จาก ${totalPages}`;

    // Update pagination buttons
    document.getElementById('prevPage').classList.toggle('disabled', page <= 1);
    document.getElementById('nextPage').classList.toggle('disabled', page >= totalPages);

    document.getElementById('prevPage').onclick = () => {
        if (page > 1) {
            currentPage--;
            loadRequests(currentPage);
            updatePaginationInfo(currentPage, totalPages);
        }
    };

    document.getElementById('nextPage').onclick = () => {
        if (page < totalPages) {
            currentPage++;
            loadRequests(currentPage);
            updatePaginationInfo(currentPage, totalPages);
        }
    };
}

// เรียกใช้ฟังก์ชันเมื่อเริ่มต้นหรือหลังจากเปลี่ยนหน้า
updatePaginationInfo(currentPage, totalPages);


// เมื่อมีการลบคำขอ
function deleteRequest(id) {
    Swal.fire({
        title: 'คุณแน่ใจหรือว่าต้องการลบคำขอนี้?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            let requests = JSON.parse(localStorage.getItem('requests')) || [];
            requests = requests.filter(request => request.id !== id);
            localStorage.setItem('requests', JSON.stringify(requests));
            loadRequests(currentPage);

            // แสดงข้อความแจ้งเตือนหลังจากลบคำขอ
            Swal.fire({
                icon: 'success',
                title: 'ลบสำเร็จ!',
                text: 'คำขอถูกลบแล้ว',
                confirmButtonText: 'ตกลง'
            });
        }
    });
}

// เมื่อมีการลบคำขอทั้งหมดในหน้านี้
function deleteAllRequests() {
    Swal.fire({
        title: 'คุณแน่ใจหรือว่าต้องการลบคำขอทั้งหมดในหน้านี้?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            let requests = JSON.parse(localStorage.getItem('requests')) || [];
            const start = (currentPage - 1) * maxRequestsPerPage;
            const end = start + maxRequestsPerPage;

            // กรองคำขอที่ไม่อยู่ในหน้านี้ออก
            requests = requests.filter((_, index) => index < start || index >= end);

            localStorage.setItem('requests', JSON.stringify(requests));
            loadRequests(currentPage);

            // แสดงข้อความแจ้งเตือนหลังจากลบคำขอทั้งหมดในหน้านี้
            Swal.fire({
                icon: 'success',
                title: 'ลบสำเร็จ!',
                text: 'คำขอทั้งหมดในหน้านี้ถูกลบแล้ว',
                confirmButtonText: 'ตกลง'
            });
        }
    });
}

window.onload = () => loadRequests(currentPage);