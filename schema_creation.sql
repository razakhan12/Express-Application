-- - Add courses and course offerings
-- - Link instructors to course offerings
-- - Add students
-- - Enroll students in course offerings
--   - Course offerings have limited capacity
--   - Students also have limited capacity - no single student can enroll in more than five course offerings per semester
-- Extended 
-- an instructor can add a maximum be teaching 5 course offerings

create table course(
    course_id serial primary key,
    course_name varchar(255), 
    course_credits int, 
    course_type int
);

create table student(
    student_id serial primary key,
    student_name varchar(50),
    student_courses int
); 


create table instructor(
    instructor_id serial primary key,
    instructor_name varchar(50)
);

create table course_offering(
    course_offering_id serial primary key,
    course_id references int course (course_id),
    instructor_id  references int instructor (instructor_id)
);

create table course_offering(
    course_offering_id serial primary key,
    course_id int references  course(course_id),
    instructor_id int references  instructor (instructor_id)
);

create table enrollment(
    enrollment_id serial primary key,
    student_id int references student(student_id),  
    course_offering_id int references course_offering(course_offering_id)  
);


Relations:
1. A course can have many course offerings course - M course_offerinngs
2. Many stuents can be enrolled into of many course offerings
3. One instructor can be part of many course offerings 