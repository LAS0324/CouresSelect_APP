const fs = require('fs');
const path = require('path');

const targetTitles = [
    '閱讀與寫作(上)',
    '閱讀與寫作(下)',
    '英文(一)',
    '英文(二)',
    '體育(一)',
    '體育(二)',
    '體育(三)',
    '體育(四)'
];

const file1Path = path.join(__dirname, 'course114-1.json');
const file2Path = path.join(__dirname, 'courses.json');

let allCourses = [];

if (fs.existsSync(file1Path)) {
    try {
        allCourses = allCourses.concat(JSON.parse(fs.readFileSync(file1Path, 'utf8')));
    } catch(e) {
        console.log("Error reading course114-1.json", e);
    }
}

if (fs.existsSync(file2Path)) {
    try {
        allCourses = allCourses.concat(JSON.parse(fs.readFileSync(file2Path, 'utf8')));
    } catch(e) {
        console.log("Error reading courses.json", e);
    }
}

const seen = new Set();
const filtered = [];

for (const c of allCourses) {
    if (c && c.title && targetTitles.includes(c.title.trim())) {
        // 使用序列化確保完整的資料物件不重複
        const key = JSON.stringify(c); 
        if (!seen.has(key)) {
            seen.add(key);
            filtered.push(c);
        }
    }
}

fs.writeFileSync(path.join(__dirname, 'MustCourse.json'), JSON.stringify(filtered, null, 2), 'utf8');
console.log(`Extracted ${filtered.length} courses to MustCourse.json`);
