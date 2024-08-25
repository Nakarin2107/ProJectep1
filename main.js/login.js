   document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const validUsername = 'admin'; // ตั้ง ID
        const validPassword = '777'; // ตั้ง Password

        fetch('https://script.google.com/macros/s/AKfycbxvtdP0WK9IHDy06cMDoHrBWW1-yliO8pVXVK66TKhTWubSQwBPkOjKuHUONTpQQIjb/exec', {
            method: 'POST',
            body: new URLSearchParams({
                username: username,
                password: password
            }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .then(response => response.json())
        .then(data => {
            if (username === validUsername && password === validPassword) {
                window.location.href = 'borrow.html';
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
                    text: 'กรุณาลองใหม่',
                    confirmButtonText: 'ตกลง'
                });
            }
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