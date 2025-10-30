<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up()
    {
        // create sp_create_student
        DB::unprepared(<<<'SQL'
DROP PROCEDURE IF EXISTS sp_create_student;
CREATE PROCEDURE sp_create_student(
    IN p_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_age INT,
    IN p_tenant_id BIGINT
)
BEGIN
    INSERT INTO students (name, email, age, tenant_id, created_at, updated_at)
    VALUES (p_name, p_email, p_age, p_tenant_id, NOW(), NOW());
    SELECT LAST_INSERT_ID() AS student_id;
END;
SQL
        );

        // create sp_update_student
        DB::unprepared(<<<'SQL'
DROP PROCEDURE IF EXISTS sp_update_student;
CREATE PROCEDURE sp_update_student(
    IN p_id INT,
    IN p_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_age INT
)
BEGIN
    UPDATE students
    SET name = p_name,
        email = p_email,
        age = p_age,
        updated_at = NOW()
    WHERE id = p_id;
END;
SQL
        );

        // create sp_delete_student
        DB::unprepared(<<<'SQL'
DROP PROCEDURE IF EXISTS sp_delete_student;
CREATE PROCEDURE sp_delete_student(
    IN p_id INT
)
BEGIN
    DELETE FROM students WHERE id = p_id;
END;
SQL
        );
    }

    public function down()
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS sp_create_student;');
        DB::unprepared('DROP PROCEDURE IF EXISTS sp_update_student;');
        DB::unprepared('DROP PROCEDURE IF EXISTS sp_delete_student;');
    }
};
