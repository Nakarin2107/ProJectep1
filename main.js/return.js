

document.getElementById('returnForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const studentId = document.getElementById('studentId').value;
    loadBorrowedItems(studentId);
});

function formatThaiDate(dateTime) {
    const date = new Date(dateTime);
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear() + 543; // Convert to Buddhist Year
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    const formattedDate = `${day}-${month}-${year}`;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    return `${formattedDate} ${formattedTime}`;
}

function loadBorrowedItems(studentId) {
    const borrowedItemsDiv = document.getElementById('borrowedItems');
    borrowedItemsDiv.innerHTML = '<h2>รายการอุปกรณ์ที่ยืม</h2>'; // เพิ่มหัวข้อ
    const returnButton = document.getElementById('returnButton');
    returnButton.style.display = 'none';

    let requests = JSON.parse(localStorage.getItem('requests')) || [];
    const borrowedItems = requests.filter(request => request.studentId === studentId && request.type === 'ยืม' && request.status === 'อนุมัติ');

    if (borrowedItems.length > 0) {
        borrowedItems.forEach(item => {
            const p = document.createElement('p');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = item.id;
            p.appendChild(checkbox);
            p.appendChild(document.createTextNode(` ${item.equipment} - ยืมเมื่อ ${formatThaiDate(item.dateTime)}`));
            borrowedItemsDiv.appendChild(p);
        });
        returnButton.style.display = 'block';
    } else {
        borrowedItemsDiv.innerHTML = '<p>ไม่พบรายการอุปกรณ์ที่ยืม</p>';
    }
}

document.getElementById('returnButton').addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('#borrowedItems input[type="checkbox"]:checked');
    let requests = JSON.parse(localStorage.getItem('requests')) || [];
    const now = new Date();
    const returnDateTime = now.toISOString();

    if (checkboxes.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'ไม่พบอุปกรณ์ที่เลือก',
            text: 'กรุณาเลือกอุปกรณ์ที่ต้องการคืน',
            confirmButtonText: 'ตกลง'
        });
        return;
    }

    checkboxes.forEach(checkbox => {
        requests = requests.map(request => {
            if (request.id == checkbox.value) {
                return { ...request, status: 'คืนแล้ว', returnDateTime };
            }
            return request;
        });
    });

    localStorage.setItem('requests', JSON.stringify(requests));

    Swal.fire({
        icon: 'success',
        title: 'คืนอุปกรณ์สำเร็จ',
        text: 'อุปกรณ์ที่เลือกถูกคืนแล้ว',
        confirmButtonText: 'ตกลง'
    }).then(() => {
        // หลังจากคืนอุปกรณ์ ให้โหลดรายการใหม่
        const studentId = document.getElementById('studentId').value;
        loadBorrowedItems(studentId);
    });
});

