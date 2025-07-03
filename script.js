let intervalId = null;

window.onload = () => {
  fillOptions("dob-day", 1, 31);
  fillOptions("dob-month", 1, 12, "month");
  fillOptions("dob-year", 1900, new Date().getFullYear());

  fillOptions("ref-day", 1, 31);
  fillOptions("ref-month", 1, 12, "month");
  fillOptions("ref-year", 1900, new Date().getFullYear());

  const today = new Date();
  document.getElementById("ref-day").value = today.getDate();
  document.getElementById("ref-month").value = today.getMonth() + 1;
  document.getElementById("ref-year").value = today.getFullYear();
};

function fillOptions(id, start, end, type = "") {
  const select = document.getElementById(id);
  for (let i = start; i <= end; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = (type === "month") ? getMonthName(i) : i;
    select.appendChild(option);
  }
}

function getMonthName(m) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[m - 1];
}

function startLiveFromReference() {
  clearInterval(intervalId);

  const day1 = +document.getElementById("dob-day").value;
  const month1 = +document.getElementById("dob-month").value;
  const year1 = +document.getElementById("dob-year").value;

  const day2 = +document.getElementById("ref-day").value;
  const month2 = +document.getElementById("ref-month").value;
  const year2 = +document.getElementById("ref-year").value;

  const dob = new Date(year1, month1 - 1, day1);
  const refDate = new Date(year2, month2 - 1, day2);

  if (!day1 || !month1 || !year1 || !day2 || !month2 || !year2) {
    document.getElementById("result").innerHTML = "⚠️ Please select both dates.";
    return;
  }

  if (dob > refDate) {
    document.getElementById("result").innerHTML = "⚠️ Reference date must be after DOB.";
    return;
  }

  const now = new Date();

  let y = year2 - year1;
  let m = month2 - month1;
  let d = day2 - day1;

  if (d < 0) {
    m--;
    const prevMonth = new Date(year2, month2 - 1, 0);
    d += prevMonth.getDate();
  }
  if (m < 0) {
    y--;
    m += 12;
  }

  const refDiff = refDate - dob;
  const totalDays = Math.floor(refDiff / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = Math.floor(refDiff / (1000 * 60 * 60));
  const totalMinutes = Math.floor(refDiff / (1000 * 60));
  const totalSeconds = Math.floor(refDiff / 1000);
  const totalMonths = y * 12 + m;

  let liveStart = refDate.getTime();

  intervalId = setInterval(() => {
    const current = new Date().getTime();
    const liveDiff = current - liveStart;

    const liveSeconds = Math.floor(liveDiff / 1000);
    const liveMinutes = Math.floor(liveSeconds / 60);
    const liveHours = Math.floor(liveMinutes / 60);

    const liveS = liveSeconds % 60;
    const liveM = liveMinutes % 60;
    const liveH = liveHours % 24;

    document.getElementById("result").innerHTML = `
      📊 <b>Age as of ${refDate.toDateString()}:</b><br>
      ➤ ${y} years, ${m} months, ${d} days<br>
      ➤ Total Months: ${totalMonths}<br>
      ➤ Total Weeks: ${totalWeeks}<br>
      ➤ Total Days: ${totalDays}<br>
      ➤ Total Hours: ${totalHours.toLocaleString()}<br>
      ➤ Total Minutes: ${totalMinutes.toLocaleString()}<br>
      ➤ Total Seconds: ${totalSeconds.toLocaleString()}<br><br>

      ⏱️ <b>Live Time Since That Day:</b><br>
      ➤ ${liveH.toString().padStart(2, '0')} hours, 
      ${liveM.toString().padStart(2, '0')} minutes, 
      ${liveS.toString().padStart(2, '0')} seconds
    `;
  }, 1000);
}

function resetFields() {
  clearInterval(intervalId);
  document.getElementById("result").innerHTML = "";
}

function downloadPDF() {
  const element = document.getElementById("result");

  if (!element.innerHTML.trim()) {
    alert("Please calculate age before downloading.");
    return;
  }

  const opt = {
    margin:       0.5,
    filename:     'Age_Calculation_Report.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}
