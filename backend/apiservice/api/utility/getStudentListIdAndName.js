const data = require('../data.json');
module.exports = function getStudentList(studentsInClass){
    const studentList = []
    studentsInClass.forEach(studentInClass=> {
        const student_info = data.students.filter(c => c.student_id === studentInClass.student_id);
        studentList.push({
            id: student_info[0].student_id,
            name: student_info[0].name
        })
    });
    return studentList;
}
