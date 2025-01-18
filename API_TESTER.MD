
### Users routes:
#### Create a user
`http://localhost:5000/users/create`
```json
{
   {
  "email": "dan@gmail.com",
  "password": "password",
  "role": "student"
}
}
```

<!-- Instructors -->
### Instructor:
#### Create Instructor:
`http://localhost:5000/instructors/create`
```json
  {
    "email": "danielromeo99@gmail.com",
    "password": "password"
}
```


<!-- Courses -->
### Courses routes
#### Create a course:
`http://localhost:5000/courses/create`
```json
{
"title": "Advanced programming",
"shortDescription": "Advanced progrmming course",
"description": "Advanced programming course about code",
"price": 0,
"organisationId": 1,
"createdBy": 5
}
```


<!-- Organisations -->
### Organisation routes:
#### Create organisation:
`http://localhost:5000/organisations/create`
```json
{
   "name": "Spetznaz",
    "description": "Spetznaz school of 3000",
    "shortDescription": "This is spetznaz school of 3000",
  "createdBy": 5
}
```

