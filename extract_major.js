const fs = require('fs');
const path = require('path');

const file1Path = path.join(__dirname, 'courses', 'course114-1.json');
const file2Path = path.join(__dirname, 'courses', 'courses.json');
const outputPath = path.join(__dirname, 'courses', 'Major_Courses.json');

let allMajorCourses = [];

try {
    const data1 = JSON.parse(fs.readFileSync(file1Path, 'utf8'));
    const major1 = data1.filter(c => c.requirementType === '專門課程');
    allMajorCourses = allMajorCourses.concat(major1);
    console.log(`Found ${major1.length} major courses in course114-1.json`);
} catch (e) {
    console.error("Error reading course114-1.json:", e.message);
}

try {
    const data2 = JSON.parse(fs.readFileSync(file2Path, 'utf8'));
    const major2 = data2.filter(c => c.requirementType === '專門課程');
    allMajorCourses = allMajorCourses.concat(major2);
    console.log(`Found ${major2.length} major courses in courses.json`);
} catch (e) {
    console.error("Error reading courses.json:", e.message);
}

// 寫入到目標檔案前，先根據 className 進行排序
// 排序邏輯：
// 1. 提取科系名稱 (如 "文", "數資", "心諮") 作為第一排序條件
// 2. 提取年級 (一, 二, 1, 2 等) 作為第二排序條件
const gradeMap = {
    '一': 1, '1': 1,
    '二': 2, '2': 2,
    '三': 3, '3': 3,
    '四': 4, '4': 4,
    '五': 5, '5': 5,
    '六': 6, '6': 6
};

allMajorCourses.sort((a, b) => {
    const classA = a.className || "";
    const classB = b.className || "";
    
    // 擷取系名和年級的正規表達式
    // 匹配開頭的非數字與非年級中文字 (作為系名)，接著匹配年級字元
    const regex = /^([^\d一二三四五六]*)([\d一二三四五六])/;
    
    const matchA = classA.match(regex);
    const matchB = classB.match(regex);
    
    // 系名
    const deptA = matchA ? matchA[1].trim() : classA;
    const deptB = matchB ? matchB[1].trim() : classB;
    
    // 如果系名不同，依系名筆畫/字元順序排列
    if (deptA !== deptB) {
        return deptA.localeCompare(deptB, 'zh-TW');
    }
    
    // 若系名相同，比較年級
    const gradeA = matchA ? (gradeMap[matchA[2]] || 99) : 99;
    const gradeB = matchB ? (gradeMap[matchB[2]] || 99) : 99;
    
    if (gradeA !== gradeB) {
        return gradeA - gradeB;
    }
    
    // 若系名和年級都相同，則依班級全名排序 (如 甲, 乙, A, B)
    return classA.localeCompare(classB, 'zh-TW');
});

fs.writeFileSync(outputPath, JSON.stringify(allMajorCourses, null, 2), 'utf8');
console.log(`Successfully wrote a total of ${allMajorCourses.length} major courses to Major_Courses.json`);
