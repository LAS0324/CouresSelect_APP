const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require("./serviceAccountKey.json");

// 1. 初始化 Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 💡 取得指令傳入的參數 (例如: node import-data.js 114-1)
const targetSemester = process.argv[2] || 'MustCourse';

if (!targetSemester) {
    console.error("❌ 錯誤：請提供目標學期名稱！");
    console.log("用法示例：node import-data.js 114-1");
    process.exit(1);
}

/**
 * 2. 讀取 JSON 資料
 * 這裡設定檔名規則為：courses_學期名稱.json
 * 例如：node import-data.js 114-1 -> 就會去讀 courses_114-1.json
 */
const fileName = `./courses_${targetSemester}.json`;

if (!fs.existsSync(fileName)) {
    console.error(`❌ 找不到檔案：${fileName}`);
    console.log(`請確認檔名是否正確（格式需為 courses_學期.json）`);
    process.exit(1);
}

console.log(`📖 正在讀取檔案：${fileName}...`);
const rawContent = fs.readFileSync(fileName, 'utf8');
const rawData = JSON.parse(rawContent.replace(/^\uFEFF/, ''));

// 指令可以帶學期參數，例如: node import-data.js 115-1


/**
 * 3. 時間轉換機：把 "四(05,06,07)" 轉成 ["4-05", "4-06", "4-07"]
 */
function parseTimeSlots(timeStr) {
    if (!timeStr || timeStr === "無" || typeof timeStr !== 'string') return [];

    const dayMap = { '一': '1', '二': '2', '三': '3', '四': '4', '五': '5', '六': '6', '日': '7' };
    const dayChar = timeStr[0];
    const day = dayMap[dayChar];

    const slots = timeStr.match(/[0-9A-Za-z]+/g);
    if (!day || !slots) return [];

    const validSlots = slots.filter(s => s.length > 0 && s !== dayChar);
    return validSlots.map(s => `${day}-${s.padStart(2, '0')}`);
}

/**
 * 4. 核心匯入函式
 */
async function upload() {
    console.log(`🚀 開始匯入至 Firebase 目標路徑：Semesters/${targetSemester}/Courses`);
    console.log(`📦 總計筆數：${rawData.length} 筆`);

    let batch = db.batch();
    let count = 0;
    const courseRef = db.collection('Semesters').doc(targetSemester).collection('Courses');

    for (const course of rawData) {
        const newDoc = courseRef.doc(); // 自動產生 Firestore ID

        batch.set(newDoc, {
            courseId: course.courseId,
            title: course.title,
            teacher: course.teacher || "未定",
            time: course.time || "未定",
            location: course.location || "未定",
            timeSlots: parseTimeSlots(course.time),
            type: course.electiveType || "選修",
            credits: `${course.credits}學分`,
            department: course.department || "",
            className: course.className || "",
            registeredCount: course.registeredCount || 0,
            maxStudents: course.maxStudents || 0,
            semester: course.semester || targetSemester
        });

        count++;

        // 每 500 筆 commit 一次
        if (count % 500 === 0) {
            await batch.commit();
            batch = db.batch();
            console.log(`✅ 已成功匯入前 ${count} 筆...`);
        }
    }

    if (count % 500 !== 0) {
        await batch.commit();
    }

    console.log(`\n🎉 任務完成！學期 [${targetSemester}] 的 ${count} 門課程已全數上傳。`);
}

// 執行
upload().catch(err => {
    console.error("\n❌ 發生嚴重錯誤：", err);
});