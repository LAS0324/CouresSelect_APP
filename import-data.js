const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require("./serviceAccountKey.json");

// 初始化 Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * 1. 讀取並解析 JSON 資料
 * 加入了 .replace(/^\uFEFF/, '') 來剔除可能導致報錯的隱形 BOM 字元
 */
const rawContent = fs.readFileSync('./courses.json', 'utf8');
const rawData = JSON.parse(rawContent.replace(/^\uFEFF/, ''));

// 指令可以帶學期參數，例如: node import-data.js 115-1
const targetSemester = process.argv[2] || '114-2';

/**
 * 2. 時間轉換機：把 "四(05,06,07)" 轉成 ["4-05", "4-06", "4-07"]
 * 這是為了讓 App 的課表渲染邏輯能正確對齊格子
 */
function parseTimeSlots(timeStr) {
    if (!timeStr || timeStr === "無" || typeof timeStr !== 'string') return [];

    const dayMap = { '一': '1', '二': '2', '三': '3', '四': '4', '五': '5', '六': '6', '日': '7' };
    const dayChar = timeStr[0];
    const day = dayMap[dayChar];

    // 使用正則表達式抓取括號內的數字
    const slots = timeStr.match(/\d+/g);

    if (!day || !slots) return [];

    return slots.map(s => `${day}-${s.padStart(2, '0')}`); // 確保是 "4-05" 而不是 "4-5"
}

/**
 * 3. 核心匯入函式
 */
async function upload() {
    console.log(`🚀 目標學期：${targetSemester}`);
    console.log(`📦 準備處理 ${rawData.length} 門課程...`);

    // Firestore 每 500 筆必須 commit 一次，我們設定批次處理
    let batch = db.batch();
    let count = 0;
    const courseRef = db.collection('Semesters').doc(targetSemester).collection('Courses');

    for (const course of rawData) {
        const newDoc = courseRef.doc(); // 自動產生 Firestore ID

        // 映射你的 JSON 欄位到 Firebase
        batch.set(newDoc, {
            courseId: course.courseId,
            title: course.title,
            teacher: course.teacher || "未定",
            time: course.time || "未定",
            location: course.location || "未定",
            timeSlots: parseTimeSlots(course.time), // 執行自動轉換
            type: course.electiveType || "選修",
            credits: `${course.credits}學分`,
            department: course.department || "",
            className: course.className || "",
            registeredCount: course.registeredCount || 0,
            maxStudents: course.maxStudents || 0,
            semester: course.semester
        });

        count++;

        // 每達到 500 筆就執行一次寫入
        if (count % 500 === 0) {
            await batch.commit();
            batch = db.batch(); // 重置一個新的 batch
            console.log(`✅ 已成功匯入前 ${count} 筆課程...`);
        }
    }

    // 處理最後剩下的尾數
    if (count % 500 !== 0) {
        await batch.commit();
    }

    console.log(`\n🎉 任務達成！全部 ${count} 門課程已匯入雲端。`);
    console.log(`🔗 請打開 Firebase Console 或手機 App 查看結果。`);
}

// 執行
upload().catch(err => {
    console.error("\n❌ 發生錯誤：", err);
});