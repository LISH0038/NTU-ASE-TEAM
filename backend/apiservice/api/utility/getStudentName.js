const data = require('../data.json');
module.exports = function getStudentName(studentId){
    const studentName = data.students.filter(c => c.student_id === studentId);
    return studentName[0].name;
}