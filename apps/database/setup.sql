USE ase;

/***CREATING ALL TABLES*/
CREATE TABLE class (
  class_index  INT PRIMARY KEY   NOT NULL,
  late_time    INT               NOT NULL   DEFAULT 15,
  absent_time  INT               NOT NULL   DEFAULT 15
) ENGINE = INNODB;

CREATE TABLE student (
  student_id    CHAR(9) PRIMARY KEY    NOT NULL,
  student_name  VARCHAR(50)            NOT NULL,
  email         VARCHAR(50)            NOT NULL
) ENGINE = INNODB;

CREATE TABLE student_class (
  class_index  INT        NOT NULL,
  student_id   CHAR(9)    NOT NULL,
  FOREIGN KEY (class_index) REFERENCES class(class_index),
  FOREIGN KEY (student_id) REFERENCES student(student_id)
) ENGINE = INNODB;

CREATE TABLE class_session (
  session_id   INT PRIMARY KEY   NOT NULL,
  class_index  INT               NOT NULL,
  start_time   INT(11)           NOT NULL,
  FOREIGN KEY (class_index) REFERENCES class(class_index)
) ENGINE = INNODB;

CREATE TABLE report (
  session_id    INT        NOT NULL,
  student_id    CHAR(9)    NOT NULL,
  arrival_time  INT(11),
  attend_status ENUM('on-time', 'late', 'exempted', 'absent') NOT NULL,
  FOREIGN KEY (session_id) REFERENCES class_session(session_id),
  FOREIGN KEY (student_id) REFERENCES student(student_id)
) ENGINE = INNODB;

/* INSERT DATA */
INSERT INTO class (class_index, late_time, absent_time) VALUES
  (10000, 15, 30),
  (10001, 10, 20),
  (10002, 15, 20),
  (10003, 10, 30),
  (10004, 10, 20),
  (10005, 15, 30);

INSERT INTO student (student_id, student_name, email) VALUES
  ('U1620058E', 'Harry Cao', 'harry@e.ntu.edu.sg'),
  ('U1620575J', 'Zeng Jinpo', 'zeng@e.ntu.edu.sg'),
  ('U1721882B','Rajasekara Pandian Akshaya Muthu','akshaya@e.ntu.edu.sg'),
  ('U1721642E','MN Shaanmugam','shaan@e.ntu.edu.sg'),
  ('U1622186B','Li Shanlan','shanlan@e.ntu.edu.sg'),
  ('N1902163K','Simon El Nahas Christensen','simon@e.ntu.edu.sg'),
  ('U1620602A','Lin Beiyi','limbeiyi@e.ntu.edu.sg');

INSERT INTO student_class (class_index, student_id) VALUES
  (10001, 'U1620058E'),
  (10001, 'U1620575J'),
  (10001,'U1721882B'),
  (10001,'U1721642E'),
  (10001,'U1622186B'),
  (10001,'N1902163K'),
  (10001,'U1620602A'),
  (10002, 'U1620058E'),
  (10002, 'U1620575J'),
  (10002,'U1721882B'),
  (10002,'U1721642E'),
  (10002,'U1622186B'),
  (10002,'N1902163K');

INSERT INTO class_session (class_index, session_id, start_time) VALUES
  (10001, 1, 1570176000),
  (10001, 2, 1570374781),
  (10002, 3, 1570574000);

INSERT INTO report (session_id, student_id, arrival_time, attend_status) VALUES
  (1, 'U1620058E',NULL, 'absent'),
  (1, 'U1620575J', NULL, 'absent'),
  (1, 'U1721882B', NULL, 'absent'),
  (1, 'U1721642E', NULL, 'absent'),
  (1, 'U1622186B', NULL, 'absent'),
  (1, 'N1902163K', NULL, 'absent'),
  (1, 'U1620602A', NULL, 'absent'),
  (2, 'U1620058E',NULL, 'absent'),
  (2, 'U1620575J', NULL, 'absent'),
  (2, 'U1721882B', NULL, 'absent'),
  (2, 'U1721642E', NULL, 'absent'),
  (2, 'U1622186B', NULL, 'absent'),
  (2, 'N1902163K', NULL, 'absent'),
  (2, 'U1620602A', NULL, 'absent'),
  (3, 'U1620058E',NULL, 'absent'),
  (3, 'U1620575J', NULL, 'absent'),
  (3, 'U1721882B', NULL, 'absent'),
  (3, 'U1721642E', NULL, 'absent'),
  (3, 'U1622186B', NULL, 'absent'),
  (3, 'N1902163K', NULL, 'absent');

/* class functions*/
DROP PROCEDURE IF EXISTS get_class;
DELIMITER //
CREATE PROCEDURE get_class(IN class_index INT)
  BEGIN
    SELECT * FROM class WHERE class.class_index = class_index;
  END //
DELIMITER ;

/**
  student functions
 */
DROP PROCEDURE IF EXISTS get_student;
DELIMITER //
CREATE PROCEDURE get_student(IN student_id CHAR(9))
  BEGIN
    SELECT * FROM student WHERE student.student_id = student_id;
  END //
DELIMITER ;


/**
  student_class functions
 */
DROP PROCEDURE IF EXISTS get_student_in_class;
DELIMITER //
CREATE PROCEDURE get_student_in_class(IN class_index INT)
  BEGIN
    SELECT student.student_id, student.student_name
    FROM student_class
    INNER JOIN student ON student_class.student_id = student.student_id
     WHERE student_class.class_index = class_index;

  END //
DELIMITER ;

DROP PROCEDURE IF EXISTS get_student_with_id_in_class;
DELIMITER //
CREATE PROCEDURE get_student_with_id_in_class(IN class_index INT, IN student_id CHAR(9))
BEGIN
    SELECT student.student_id, student.student_name
    FROM student_class
    INNER JOIN student ON student_class.student_id = student.student_id
     WHERE student_class.class_index = class_index
     AND student_class.student_id = student_id;
  END //
DELIMITER ;

/**
  class_session functions
 */
DROP PROCEDURE IF EXISTS get_session_at_time;
DELIMITER //
CREATE PROCEDURE get_session_at_time(IN class_index INT, IN at_time INT)
  BEGIN
    SELECT *
    FROM class_session
    WHERE
      class_session.class_index = class_index AND
      at_time - class_session.start_time < 10800 AND
      class_session.start_time - at_time <= 3600;
  END //
DELIMITER ;


DROP PROCEDURE IF EXISTS get_session_on_day;
DELIMITER //
CREATE PROCEDURE get_session_on_day(IN class_index INT, IN on_day INT)
  BEGIN
    SELECT *
    FROM class_session
    WHERE
      class_session.class_index = class_index AND
      class_session.start_time - on_day < 86400 AND
      class_session.start_time - on_day > 0;
  END //
DELIMITER ;

DROP PROCEDURE IF EXISTS get_class_start_late_absent_time;
DELIMITER //
CREATE PROCEDURE get_class_start_late_absent_time(IN session_id INT)
BEGIN
    SELECT class_session.class_index, class_session.start_time, class.late_time, class.absent_time
    FROM class_session INNER JOIN class ON class_session.class_index = class.class_index
    WHERE class_session.session_id = session_id;
END //
DELIMITER ;

/*
 report functions
 */
DROP PROCEDURE IF EXISTS get_report;
DELIMITER //
CREATE PROCEDURE get_report(IN session_id INT)
  BEGIN
    SELECT * FROM report WHERE report.session_id = session_id;
  END //
DELIMITER ;

DROP PROCEDURE IF EXISTS get_complete_report;
DELIMITER //
CREATE PROCEDURE get_complete_report(IN session_id INT)
  BEGIN
    SELECT report.student_id, student.student_name, report.attend_status, student.email
    FROM report INNER JOIN student ON report.student_id = student.student_id
    WHERE report.session_id = session_id;
  END //
DELIMITER ;

DROP PROCEDURE IF EXISTS get_absent_students;
DELIMITER //
CREATE PROCEDURE get_absent_students(IN session_id INT)
BEGIN
    SELECT report.student_id, student.student_name
    FROM report INNER JOIN student ON report.student_id = student.student_id
    WHERE report.session_id = session_id AND report.attend_status = 'absent';
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS get_on_time_students;
DELIMITER //
CREATE PROCEDURE get_on_time_students(IN session_id INT)
BEGIN
    SELECT report.student_id, student.student_name
    FROM report INNER JOIN student ON report.student_id = student.student_id
    WHERE report.session_id = session_id AND report.attend_status = 'on-time'
    ORDER BY report.arrival_time DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS get_late_students;
DELIMITER //
CREATE PROCEDURE get_late_students(IN session_id INT)
BEGIN
    SELECT report.student_id, student.student_name
    FROM report INNER JOIN student ON report.student_id = student.student_id
    WHERE report.session_id = session_id AND report.attend_status = 'late'
    ORDER BY report.arrival_time DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS update_student_status;
DELIMITER //
CREATE PROCEDURE update_student_status(IN session_id INT, IN student_id CHAR(9), IN attend_status ENUM('on-time', 'late', 'exempted', 'absent'), IN arrival_time INT(11))
BEGIN
    update report
    set report.attend_status = attend_status, report.arrival_time = arrival_time
    where report.session_id=session_id and report.student_id = student_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS get_student_status;
DELIMITER //
CREATE PROCEDURE get_student_status(IN session_id INT, IN student_id CHAR(9))
BEGIN
    select student_id, arrival_time, attend_status
    from report
    where report.session_id=session_id and report.student_id = student_id;
END //
DELIMITER ;
