const { request } = require('express');
const express = require('express')
var bodyParser = require('body-parser')
const app = express()
const port = 3000


var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const {Client} = require('pg');

app.post('/student.add', jsonParser, async (req, res) => {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'flower12',
    port: 5432,
  })
  client.connect();
  
  //TODO: Need to check the cases for unvalid inputs
  let dbResponse = {};
  const {name, token} = req.body;
  let insertStatement  = `insert into student(student_name, student_courses) VALUES ('${name}', 0);`
  let getLastInsertedRow = `select * from student order by student_id desc LIMIT 1`
  try{
     dbResponse  = await client.query(insertStatement);
    dbResponse  = await client.query(getLastInsertedRow);
  }
  catch(e){
      console.log(e);
  }
  finally
  {  
  client.end()
  }
  res.send({"student_id": dbResponse.rows[0].student_id});
})

app.post('/course.create', jsonParser, async (req, res) => {
 
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'flower12',
    port: 5432,
  })
  client.connect();
  //TODO: Need to check the cases for unvalid inputs
  let dbResponse = {};
  const {name, credits,type} = req.body;
  let insertStatement  =  `INSERT INTO public.course(course_name, course_credits, course_type)
  VALUES ( '${name}', ${credits}, ${type})`
  let getLastInsertedRow = `select * from course order by course_id desc LIMIT 1`
  try{
     dbResponse  = await client.query(insertStatement);
    dbResponse  = await client.query(getLastInsertedRow);
  }
  catch(e){
      console.log(e);
  }
  finally
  {  
  client.end()
  }
  res.send({"course_id": dbResponse.rows[0].course_id});
})

app.post('/course.addOffering', jsonParser, async (req, res) => {
 
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'flower12',
    port: 5432,
  })

  client.connect();
//TODO: [CUB-6] ADD FUNCTIONALITY of an instructor adding more than 5 courses.
  //TODO: Need to check the cases for unvalid inputs
  let dbResponse = {};
  const {course_id, instructor_id,year,term,days,time,capacity,token} = req.body;
  
  let insertStatement  =  `INSERT INTO course_offering(course_id, instructor_id,capacity) VALUES (${course_id}, ${instructor_id},${capacity})`
  let getLastInsertedRow = `select * from course_offering order by course_offering_id desc LIMIT 1`
  try{
     dbResponse  = await client.query(insertStatement);
    dbResponse  = await client.query(getLastInsertedRow);
  }
  catch(e){
      console.log(e);
  }
  finally
  {  
  client.end()
  }
  res.send({"course_offering_id": dbResponse.rows[0].course_offering_id});
})

app.get('/course.getOfferings', async (req, res) => {
  let finalStatus  = 200;
  let response = {};
  console.log(req.query.course_id);
  if(req.query.course_id === undefined){
    finalStatus = 403;
    response.message = "course_id not provided"
  }
  else{
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: 'flower12',
      port: 5432,
    })
  
    client.connect();

    let course_id = req.query.course_id;
    //TODO: Need to check the cases for unvalid inputs
    let dbResponse;
    let queryStatement = `select course_offering_id,instructor_name, course_name, course_credits from instructor as instructorA right join (select * from course as a left join course_offering as b on a.course_id = b.course_id where b.course_id = ${course_id}) as course_list on instructorA.instructor_id = course_list.instructor_id`;
    try{
       dbResponse  = await client.query(queryStatement);
    }
    catch(e){
        console.log(e);
    }
    finally
    {  
    client.end()
    }
    response.course_list = [];
    response.course_list.push(dbResponse.rows);
  }
  res.status(finalStatus).send(response);
})

app.post('/instructor.add', jsonParser, async (req, res) => {
  //{"name": "Dr. Mario", "token": "z8675309q"}
 
   const client = new Client({
     user: 'postgres',
     host: 'localhost',
     database: 'postgres',
     password: 'flower12',
     port: 5432,
   });
 
   client.connect();
 
   //TODO: Need to check the cases for unvalid inputs
   let dbResponse = {};
   const {name,token} = req.body;
   
   let insertStatement  =  `INSERT INTO instructor(instructor_name) VALUES ('${name}')`
   let getLastInsertedRow = `select * from instructor order by instructor_id desc LIMIT 1`
   try{
      dbResponse  = await client.query(insertStatement);
     dbResponse  = await client.query(getLastInsertedRow);
   }
   catch(e){
       console.log(e);
        next(e);
   }
   finally
   {  
   client.end()
   }
   res.send({"instructor_id": dbResponse.rows[0].instructor_id});
 })
 

app.post('/course.enroll', jsonParser, async (req, res, next) => {

  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'flower12',
    port: 5432,
  });

  client.connect();

  //TODO: Need to check the cases for unvalid inputs
  let dbResponse = {};
  const {course_offering_id,student_id} = req.body;
  // get current enrollment in a certian course offering
  // get the capacity of the course offering
  //subtract and see if we can proceede to enroll the person
  //else return an error message


  let getEnrollCount  =
  `select c.capacity-a.enrollCount as count from
  (select COUNT(*) as enrollCount from enrollment where course_offering_id = ${course_offering_id}) as a,
  (select capacity from course_offering where course_offering_id = ${course_offering_id})as c`;
  try{
     dbResponse  = await client.query(getEnrollCount);
     console.log(dbResponse);
     if(dbResponse.rows.length >= 1){
      let enrollCount = dbResponse.rows[0].count;
        if(enrollCount <= 5 && enrollCount >= 0){
          let createEnrollment  = `INSERT INTO enrollment (student_id, course_offering_id) VALUES(${student_id},${course_offering_id})`
          dbResponse  = await client.query(createEnrollment);
          let getLastInsertedRow = `select * from enrollment order by enrollment_id desc LIMIT 1`
          dbResponse  = await client.query(getLastInsertedRow);
        }
        else{
            throw new Error('unable to create a new enrollment < 5');
        }
     }
     else{
       throw new Error('unable to create a new enrollment');
     }
  }
  catch(e){
      console.log(e.message);
      next(e);
      res.status(404).send({"err": e.message});
      return;
  }
  finally
  {  
  client.end()
  }
  res.send({"enrollment_id": dbResponse.rows[0].enrollment_id});
})



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})



// `curl localhost:8080/api/student.add -d '{"name": "Yoshi", "token": "z8675309q"}'`
// return student id
// `curl localhost:8080/api/course.create -d '{"name": "COMP200", "credits": 3, "type": "lab", "token": "z8675309q"}'`
//return course id

// `curl localhost:8080/api/instructor.add -d '{"name": "Dr. Mario", "token": "z8675309q"}'`
// returns instructor id

// `curl localhost:8080/api/course.addOffering -d '{"course_id": 1, "instructor_id": 2, "year": 2018, "term": "Spring", "days": "MWF", "time": "9:00", "capacity": 10, "token": "z8675309q"}'`
// returns 200 ok

// `curl localhost:8080/api/course.getOfferings -d '{"course_id": "1", "token": "z8675309q"}'`

// `curl localhost:8080/api/course.enroll -d '{"course_offering_id": "1", "student_id": 1, "token": "z8675309q"}'`
// return 200 OK