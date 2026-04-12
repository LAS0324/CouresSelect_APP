import React, { createContext, useContext, useState } from 'react';

// 1. 定義基礎課程型別
interface Course {
    id: string;
    name: string;
    teacher: string;
    timeSlots: string[];
    location: string;
}

// 2. 合併所有的介面定義 (Interface)
interface CourseContextType {
    selectedCourses: Course[];
    addCourse: (course: Course) => void;
    removeCourse: (courseId: string) => void; // 💡 確保這裡有 removeCourse
    currentSemester: string;

    // 學分檢核相關
    passedGeneralCourses: { [key: string]: boolean };
    generalCreditsTotal: number;
    updateGeneralCredits: (courses: { [key: string]: boolean }, totalCredits: number) => void;

    passedMustCourses: { [key: string]: boolean };
    mustCreditsTotal: number;
    updateMustCredits: (courses: { [key: string]: boolean }, totalCredits: number) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

// 3. 唯一的 CourseProvider
export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
    const [currentSemester] = useState("114-2");

    // 學分檢核狀態
    const [passedGeneralCourses, setPassedGeneralCourses] = useState<{ [key: string]: boolean }>({});
    const [generalCreditsTotal, setGeneralCreditsTotal] = useState(0);

    const [passedMustCourses, setPassedMustCourses] = useState<{ [key: string]: boolean }>({});
    const [mustCreditsTotal, setMustCreditsTotal] = useState(0);

    // --- 功能實作 ---
    const addCourse = (course: Course) => {
        setSelectedCourses(prev => {
            // 檢查是否重複（以 ID 為準）
            if (prev.find(c => c.id === course.id)) {
                return prev;
            }
            // 使用 prev 確保抓到的是當前最新籃子裡的課程
            return [...prev, course];
        });
    };

    // 💡 實作刪除邏輯
    const removeCourse = (courseId: string) => {
        setSelectedCourses(prev => prev.filter(c => c.id !== courseId));
    };

    const updateGeneralCredits = (courses: { [key: string]: boolean }, totalCredits: number) => {
        setPassedGeneralCourses(courses);
        setGeneralCreditsTotal(totalCredits);
    };

    const updateMustCredits = (courses: { [key: string]: boolean }, totalCredits: number) => {
        setPassedMustCourses(courses);
        setMustCreditsTotal(totalCredits);
    };

    return (
        <CourseContext.Provider value={{
            selectedCourses,
            addCourse,
            removeCourse, // 💡 記得傳出去
            currentSemester,
            passedGeneralCourses,
            generalCreditsTotal,
            updateGeneralCredits,
            passedMustCourses,
            mustCreditsTotal,
            updateMustCredits
        }}>
            {children}
        </CourseContext.Provider>
    );
};

export const useCourse = () => {
    const context = useContext(CourseContext);
    if (!context) throw new Error('useCourse must be used within a CourseProvider');
    return context;
};