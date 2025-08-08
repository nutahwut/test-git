    const branches = [
        'MEGABANGNA','Icon Siam','Terminal 21','Central Ladprao','Siam Center','Fashion Island',
        'Centralworld','Siam Square','Central Pattaya','Seacon Square','Central Westgate','Central Chiangmai'
    ];
    const times = [
        '10:30','11:00','11:30','12:00','12:30','13:30','14:00','14:30','15:00','15:30',
        '16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00'
    ];
    const dates = Array.from({ length: 31 }, (_, i) => i + 1);
    const today = new Date().getDate() + 1;

    // UI Panel
    const panel = document.createElement('div');
    panel.innerHTML = `
        <div id="auto-booking-ui-r" style="
            position: fixed;
            top: 20px;
            right: 1%;
            z-index: 9999;
            background: black;
            padding: 20px;
            border-radius: 0px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            width: 25%;
            height: 100%;
            font-size: 25px;
            color: white;
        ">
            <h4 style="font-weight: bold; position: fixed; top: 20px; right: 2%;">Auto Booking <span style="font-size: 10px;">(V.1.5)</span></h4><br/>
            <button id="ab-start" style="width:100%;padding:10px 0;margin-top:15px;background:#cf001e;color:#ffffff;border:none;border-radius:0px;font-size:28px;cursor:pointer;font-weight: bold;">Register</button><br/><br/>

            <fieldset style="border:1px solid #fff;padding:10px;border-radius:0px;">
                <legend>เลือกขั้นตอน</legend>
                <label><input type="checkbox" id="step-branch" checked> เลือกสาขา</label><br/>
                <label><input type="checkbox" id="step-date" checked> เลือกวันที่</label><br/>
                <label><input type="checkbox" id="step-time" checked> เลือกเวลา</label><br/>
                <label><input type="checkbox" id="step-confirm" checked> ยืนยันการจอง</label><br/>
                <label><input type="checkbox" id="step-test"> ทดสอบ</label><br/>
            </fieldset>
            <br/>
            <fieldset style="border:1px solid #fff;padding:10px;border-radius:0px;">
                <label style="margin-top:15px;">Branch:</label><br/>
                <select id="ab-branch" style="width:100%;margin-bottom:15px;font-size:20px;">
                    ${branches.map(b => `<option value="${b}">${b}</option>`).join('')}
                </select><br/>

                <label>Date:</label><br/>
                <select id="ab-date" style="width:100%;margin-bottom:15px;font-size:20px;">
                    ${dates.map(d => `<option value="${d}" ${d === today ? 'selected' : ''}>${d}</option>`).join('')}
                </select><br/>

                <label>Time:</label><br/>
                <select id="ab-time" style="width:100%;margin-bottom:15px;font-size:20px;">
                    ${times.map(t => `<option value="${t}">${t}</option>`).join('')}
                </select><br/>
            </fieldset>

            <pre id="ab-log" style="margin-top:15px;font-size:15px;height:30%;overflow-y:auto;background:white;color:black;padding:10px;border-radius:5px;"></pre>
        </div>
    `;
    document.body.appendChild(panel);

    // ฟังก์ชัน log ที่อัปเดตแล้ว พร้อมแสดงเวลา
    const log = (msg) => {
        const el = document.getElementById('ab-log');
        const now = new Date();
        const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        el.textContent += `[${timeStr}] ${msg}\n`;
        el.scrollTop = el.scrollHeight;
    };

    const wait = (ms) => new Promise(res => setTimeout(res, ms));
    const waitFor = async (selectorFn, timeout = 300000) => {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const el = selectorFn();
            if (el) return el;
            await wait(300);
        }
        throw new Error("Timeout waiting for element");
    };

    // ฟังก์ชันสำหรับอัพเดตปุ่มตามสถานะ checkbox
    const updateButtonText = () => {
        const isTestMode = document.getElementById('step-test').checked;
        document.getElementById('ab-start').textContent = isTestMode ? 'Test' : 'Register';
    };

    // event for toggle "Test"
    document.getElementById('step-test').addEventListener('change', (e) => {
        const checked = e.target.checked;
        const stepIds = ['step-branch', 'step-date', 'step-time', 'step-confirm'];
        const dropdownIds = ['ab-branch', 'ab-date', 'ab-time'];

        // อัพเดตข้อความปุ่ม
        updateButtonText();

        // Toggle all step checkboxes
        stepIds.forEach(id => {
            document.getElementById(id).checked = !checked;
            document.getElementById(id).disabled = checked;
        });

        // Toggle all dropdowns
        dropdownIds.forEach(id => {
            document.getElementById(id).disabled = checked;
        });
    });

    // Initialize the step checkboxes and dropdowns
    const stepIds = {
        'step-branch': 'ab-branch',
        'step-date': 'ab-date',
        'step-time': 'ab-time',
        'step-confirm': 'confirm',
    };

    Object.keys(stepIds).forEach(stepId => {
        const input = document.getElementById(stepId);
        const selectId = stepIds[stepId];
        if (selectId !== 'confirm') {
            const select = document.getElementById(selectId);
            select.disabled = !input.checked;

            input.addEventListener('change', () => {
                if (!document.getElementById('step-test').checked) {
                    select.disabled = !input.checked;
                }
            });
        }
    });

    // เรียกฟังก์ชันอัพเดตปุ่มครั้งแรกเมื่อโหลดสคริปต์
    updateButtonText();

    document.getElementById('ab-start').addEventListener('click', async () => {
        document.getElementById('ab-log').textContent = '';
        const selectedBranch = document.getElementById('ab-branch').value;
        const selectedDate = document.getElementById('ab-date').value;
        const selectedTime = document.getElementById('ab-time').value;

        const steps = {
            branch: document.getElementById('step-branch').checked,
            date: document.getElementById('step-date').checked,
            time: document.getElementById('step-time').checked,
            confirm: document.getElementById('step-confirm').checked,
            test: document.getElementById('step-test').checked,
        };

        log("▶️ เริ่มการทำงาน...");

        const goToMyBookings = async () => {
            log("กำลังไปที่ My bookings...");
            const link = await waitFor(() =>
                [...document.querySelectorAll("a[href='/mybooking']")].find(el =>
                    el.innerText.includes("My bookings")
                )
            );
            link.click();
            log("✅ ไปยัง My bookings แล้ว");
            log("หน่วงเวลา 1 วินาที");
            await wait(1000);
        };

        const goToBooking = async () => {
            log("กำลังไปที่ Booking...");
            const link = await waitFor(() =>
                [...document.querySelectorAll("a[href='/booking']")].find(el =>
                    el.innerText.includes("Booking")
                )
            );
            link.click();
            log("✅ ไปยัง Booking แล้ว");
            log("หน่วงเวลา 0.5 วินาที");
            await wait(500);
        };

        const clickRegister = async () => {
            log("กำลังกดปุ่ม Register...");
            const registerDiv = await waitFor(() =>
                [...document.querySelectorAll("div.register")].find(el =>
                    el.textContent.trim() === "Register"
                )
            );
            registerDiv.click();
            await wait(10);
            log("✅ คลิกปุ่ม Register แล้ว");
        };

        const goToMyPro = async () => {
            log("กำลังไปที่ โปรไฟล์...");
            const link = await waitFor(() =>
                [...document.querySelectorAll("a[href='/profile']")].find(el =>
                    el.innerText.includes("โปรไฟล์")
                )
            );
            link.click();
            log("✅ ไปยังโปรไฟล์แล้ว");
            log("หน่วงเวลา 0.1 วินาที");
            await wait(100);
        };

        const selectBranch = async () => {
            log(`กำลังไปที่เลือกสาขา: ${selectedBranch}`);
            const branchEl = await waitFor(() =>
                [...document.querySelectorAll("div")].find(el => el.textContent.trim() === selectedBranch)
            );
            branchEl.click();
            const nextBtn = await waitFor(() =>
                [...document.querySelectorAll("button.next-btn")].find(el => el.textContent.trim().toLowerCase() === "next")
            );
            nextBtn.click();
            log("✅ เลือกสาขาแล้ว");
        };

        const selectDate = async () => {
            log(`กำลังไปที่เลือกวันที่: ${selectedDate}`);
            const dateBtn = await waitFor(() =>
                [...document.querySelectorAll("button")].find(el => el.textContent.includes(selectedDate))
            );
            dateBtn.click();
            log("✅ เลือกวันที่แล้ว");
        };

        const selectTime = async () => {
            log(`กำลังไปที่เลือกเวลา: ${selectedTime}`);
            const timeBtn = await waitFor(() =>
                [...document.querySelectorAll("button")].find(el => el.textContent.includes(selectedTime))
            );
            timeBtn.click();
            await wait(3);
            const confirmBtn = await waitFor(() =>
                [...document.querySelectorAll("button")].find(el => el.textContent.trim().toLowerCase() === "confirm")
            );
            confirmBtn.click();
            log("✅ เลือกและยืนยันเวลาแล้ว");
        };

        const confirmBooking = async () => {
            log("กำลังไปที่ยืนยันการจอง...");
            const confirmBookingBtn = await waitFor(() =>
                [...document.querySelectorAll("button")].find(el => el.textContent.trim().toLowerCase() === "confirm booking")
            );
            confirmBookingBtn.click();
            log("🎉 ยืนยันการจองเสร็จสิ้น!");
        };

        try {
            if (steps.test) {
                await goToMyPro();
                await goToMyBookings();
                await goToBooking();
                log("✅ Test เสร็จสิ้นทุกขั้นตอน!");
            }
            else {
                await clickRegister();
                if (steps.branch) await selectBranch();
                if (steps.date) await selectDate();
                if (steps.time) await selectTime();
                if (steps.confirm) await confirmBooking();
            }
            log("");
            log("✅ เสร็จสิ้น!");
        } catch (err) {
            log("❌ ERROR: " + err.message);
        }
