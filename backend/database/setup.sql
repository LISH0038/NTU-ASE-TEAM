USE ase;

/***CREATING ALL TABLES*/
CREATE TABLE class (
  class_index  INT PRIMARY KEY   NOT NULL,
  late_time    INT               NOT NULL   DEFAULT 15,
  absent_time  INT               NOT NULL   DEFAULT 15
)

ENGINE = INNODB;

/* INSERT DATA */
INSERT INTO class (class_index, late_time, absent_time) VALUES
  (10000, 15, 30),
  (10001, 10, 20),
  (10002, 15, 20),
  (10003, 10, 30),
  (10004, 10, 20),
  (10005, 15, 30);

DROP PROCEDURE IF EXISTS get_class;
DELIMITER //
CREATE PROCEDURE get_class(IN class_index INT)
  BEGIN
    SELECT * FROM class WHERE class.class_index = class_index;
  END //
DELIMITER ;






