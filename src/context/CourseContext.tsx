import React, { createContext, useState, useContext } from 'react';

// 定義課程資料型別
interface Course {
    id: string;
    name: string;
    teacher: string;
    timeSlots: string[]; // 格式如 ["1-02", "1-03"] 代表週一第2,3節
    location: string;
}

interface CourseContextType {
    selectedCourses: Course[];
    addCourse: (course: Course) => void;
    currentSemester: string;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
    const [currentSemester, setCurrentSemester] = useState("114-2"); // 預設學期

    const addCourse = (course: Course) => {
        // 檢查是否已經選過（避免重複加入同一門課，但允許衝堂）
        if (!selectedCourses.find(c => c.id === course.id)) {
            setSelectedCourses([...selectedCourses, course]);
        }
    };

    return (
        <CourseContext.Provider value={{ selectedCourses, addCourse, currentSemester }}>
            {children}
        </CourseContext.Provider>
    );
};

export const useCourse = () => {
    const context = useContext(CourseContext);
    if (!context) throw new Error('useCourse must be used within a CourseProvider');
    return context;
};