USE ase;

/***CREATING ALL TABLES*/
CREATE TABLE class (
  class_index  INT PRIMARY KEY   NOT NULL,
  late_time    INT               NOT NULL   DEFAULT 15,
  absent_time  INT               NOT NULL   DEFAULT 15
) ENGINE = INNODB;

CREATE TABLE student (
  student_id    CHAR(10) PRIMARY KEY   NOT NULL,
  student_name  VARCHAR(50)            NOT NULL,
  email         VARCHAR(50)            NOT NULL
) ENGINE = INNODB;

CREATE TABLE student_class (
  class_index  INT        NOT NULL,
  student_id   CHAR(10)   NOT NULL,
  FOREIGN KEY (class_index) REFERENCES class(class_index),
  FOREIGN KEY (student_id) REFERENCES student(student_id)
) ENGINE = INNODB;

CREATE TABLE class_session (
  session_id   INT PRIMARY KEY   NOT NULL,
  class_index  INT               NOT NULL,
  start_time   TIMESTAMP         NOT NULL,
  FOREIGN KEY (class_index) REFERENCES class(class_index)
) ENGINE = INNODB;

CREATE TABLE report (
  session_id    INT        NOT NULL,
  student_id    CHAR(10)   NOT NULL,
  arrival_time  TIMESTAMP,
  attend_status ENUM('on-time', 'late', 'absent') NOT NULL,
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
  ('U0000001J', 'Harry Cao', 'harry@e.ntu.edu.sg'),
  ('U0000002J', 'Zeng Jinpo', 'zeng@e.ntu.edu.sg');

INSERT INTO student_class (class_index, student_id) VALUES
  (10001, 'U0000001J'),
  (10001, 'U0000002J'),
  (10002, 'U0000002J');

INSERT INTO class_session (class_index, session_id, start_time) VALUES
  (10001, 1, 1570176000),
  (10001, 2, 1570374781),
  (10002, 3, 1570574000);

INSERT INTO report (session_id, student_id, arrival_time, attend_status) VALUES
  (1, 'U0000001J', 1570176000, 'on-time')
  (1, 'U0000002J', NULL, 'absent'),
  (2, 'U0000001J', 1570375934, 'late'),
  (2, 'U0000002J', NULL, 'absent'),
  (3, 'U0000002J', NULL, 'absent');


DROP PROCEDURE IF EXISTS get_class;
DELIMITER //
CREATE PROCEDURE get_class(IN class_index INT)
  BEGIN
    SELECT * FROM class WHERE class.class_index = class_index;
  END //
DELIMITER ;






