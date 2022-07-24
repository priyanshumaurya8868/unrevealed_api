# **Unrevealed Api specs.**
### Authentication Header:[ ](https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints#authentication-header)
You can read the authentication header from the headers of the request

|Authorization: Token jwt.token.here|
| :- |

# CORS
## Considerations for your backend with [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)[ ](https://realworld-docs.netlify.app/docs/specs/backend-specs/cors#considerations-for-your-backend-with-cors)
If the backend is about to run on a different host/port than the frontend, make sure to handle OPTIONS too and return correct Access-Control-Allow-Origin and Access-Control-Allow-Headers (e.g. Content-Type).

# Error Handling
### Errors and Status Codes[ ](https://realworld-docs.netlify.app/docs/specs/backend-specs/error-handling#errors-and-status-codes)
If a request fails any validations, expect a 422 and errors in the following format:

{
  “status” : “Failure”, 

   “message” : “reason why it failed”
}
#### Other status codes:[ ](https://realworld-docs.netlify.app/docs/specs/backend-specs/error-handling#other-status-codes)
401 for Unauthorized requests, when a request requires authentication but it isn't provided

403 for Forbidden requests, when a request may be valid but the user doesn't have permissions to perform the action

404 for Not found requests, when a resource can't be found to fulfill the request

500 for server side error, etc...



1. **Sign up.**

**POST::** /auth/signup

Example **request body**:

{
"user":{
"username": "Jacob",

"gender": "male",
"avatar": "male/male.png",
"password": "jakejake",

“d\_token”: “fcm generated  device token for push notification”
}
}

**No authentication** required, returns a response 

Required fields:  username, password, avatar, gender.

Optional field : d\_token

Example **response body**:

{

"status": "Success",

"message": "Auth successful",

"avatar": "male.male1.png",

"user\_id": "62da50c7907f0e450b12eaa8",

"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MmRhNTBjNzkwN2YwZTQ1MGIxMmVhYTgiLCJ1c2VybmFtZSI6Im5ld3VzZXJfMSIsInBhc3N3b3JkIjoibmV3dXNlcl8xIiwiZ2VuZGVyIjoiTWFsZSIsImlhdCI6MTY1ODQ3NDcwOX0.6UaKf9jStTKwRzCxvw-bFxZDHQ-DrbtBVmSIj8IAEpk",

"username": "newuser\_1",

"gender": "Male"

}



2. **Login.**

**POST::**  /auth/login

Example request body:

{

"username":"newuser\_1",

"password":"passwordofnewuser\_1"

"d\_token":"device token for push notification"

}

No authentication required, returns a response body

Required fields: username, password, 

Optional field : d\_token

{

"status": "Success",

"message": "Auth successful",

"avatar": "male.male1.png",

"user\_id": "62da50c7907f0e450b12eaa8",

"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MmRhNTBjNzkwN2YwZTQ1MGIxMmVhYTgiLCJ1c2VybmFtZSI6Im5ld3VzZXJfMSIsInBhc3N3b3JkIjoibmV3dXNlcl8xIiwiZ2VuZGVyIjoiTWFsZSIsImlhdCI6MTY1ODQ3NDcwOX0.6UaKf9jStTKwRzCxvw-bFxZDHQ-DrbtBVmSIj8IAEpk",

"username": "newuser\_1",

"gender": "Male"

}



3. **Get Male Avatars.**

**GET::**  /avatars/male

No authentication required, returns a response

Example response body:

{

"avatarList": [

"/avatars/male/male\_1.png",

"/avatars/male/male\_2.png",

"/avatars/male/male\_3.png",

"/avatars/male/male\_4.png",

"/avatars/male/male\_5.png",

"/avatars/male/male\_6.png",

"/avatars/male/male\_7.png",

"/avatars/male/male\_8.png",

"/avatars/male/male\_9.png",

"/avatars/male/male\_10.png",

"/avatars/male/male\_11.png",

"/avatars/male/male\_12.png"

],

"count": 12,

"status": "Success",

"message": "map them and add baseUrl as a prefix"

}



4. **Get Male Avatars.**

**GET::** /avatars/female

No authentication required, returns a response

Example response body:

{

"avatarList": [

"/avatars/female/female\_1.png",

"/avatars/female/female\_2.png",

"/avatars/female/female\_3.png",

"/avatars/female/female\_4.png",

"/avatars/female/female\_5.png",

"/avatars/female/female\_6.png",

"/avatars/female/female\_7.png",

"/avatars/female/female\_8.png",

"/avatars/female/female\_9.png",

"/avatars/female/female\_10.png",

"/avatars/female/female\_11.png",

"/avatars/female/female\_12.png"

],

"count": 12,

"status": "Success",

"message": "map them and add baseUrl as a prefix"

}



5. **Deactivate Account.**

**DELETE::** /avatars/male

Authentication required, returns a response

No additional parameters required

{

"status": "Suceess",

"message": "Account deleted Successfully !!"

}



6. **Get Secrets**

**GET::** /secrets

Returns most recent secrets and stories globally by default, provide **tag**, **author\_id, offset** & **limit**  query** parameter to filter results

Query Parameters:

Filter by tag:

**?tag=AngularJS**

Filter by author:

**?author\_id=jake**

Favorited by user:

**?favorited=jake**

Limit number of articles (default is **20**):

**?limit=20**

Offset/skip number of articles (default is **0**):

**?skip=0**

Authentication required.

Response Body:

{

"status": "Success",

"total\_count": 3,

"skip": 0,

"limit": 0,

"tag": "All",

"present\_count": 3,

"secrets": [



{

"\_id": "62dad81c4bfa019c6a26b806",

"author": {

"username": "newuser\_1",

"avatar": "male/male1.png",

"\_id": "62da50c7907f0e450b12eaa8",

"gender": "Male"

},

"tag": "Life",

"content": "this is another secret, that now i'm going to reaveal annoymounsly",

"timestamp": "2022-07-22T17:02:20.804Z",

"views\_count": 0,

"comments\_count": 0

},

{

"\_id": "62dad2c42cd8f8858ee482ff",

"author": {

"username": "newuser\_1",

"avatar": " male/male1.png ",

"\_id": "62da50c7907f0e450b12eaa8",

"gender": "Male"

},

"tag": "Life",

"content": "this is my secret, that now i'm going to reaveal annoymounsly",

"timestamp": "2022-07-22T16:39:32.456Z",

"views\_count": 0,

"comments\_count": 0

},

{

"\_id": "62dad2a02cd8f8858ee482f9",

"author": {

"username": "newuser\_1",

"avatar": " male/male1.png ",

"\_id": "62da50c7907f0e450b12eaa8",

"gender": "Male"

},

"tag": "Relationship",

"content": "this is my secret, that now i'm going to reaveal annoymounsly",

"timestamp": "2022-07-22T16:38:56.870Z",

"views\_count": 0,

"comments\_count": 0

}

]

}



7. **Reveal Secrets.**
### POST:: /secrets
Example request body:

{

"content": "this is another secret, that now I'm going to reaveal annoymounsly",

"tag": "life"

}

Authentication required, will return a response Body

Required fields: content, tag

Response body:

{

"\_id": "62dad81c4bfa019c6a26b806",

"author": {

"username": "newuser\_1",

"avatar": "",

"\_id": "62da50c7907f0e450b12eaa8",

"gender": "Male"

},

"tag": "Life",

"content": "this is another secret, that now i'm going to reaveal annoymounsly",

"timestamp": "2022-07-22T17:02:20.804Z",

"views\_count": 0,

"comments\_count": 0

}



8. **Update Secret.**
### PUT:: /secrets
Example request body:

{

"content":"update the content of the secret my revealing right now with all the user annoymouslanonymously",

"secret\_id": "62dad81c4bfa019c6a26b806",

"tag":"something"

}

Authentication required, will return a response Body

Required fields: content, tag, secret\_id

Response Body:

{

"\_id": "62dad81c4bfa019c6a26b806",

"author": {

"username": "newuser\_1",

"avatar": "",

"\_id": "62da50c7907f0e450b12eaa8",

"gender": "Male"

},

"tag": "somthing",

"content": "update the content of the secret my revealing right now with all the user annoymouslanonymously",

"timestamp": "2022-07-22T17:02:20.804Z",

"views\_count": 0,

"comments\_count": 0

}



9.   **Delete Secret**
### DELETE:: /secrets/*:secret\_id*

Required Param : **secret\_id**

Authentication required, will return a response Body

Response Body : 

{

"status": "Success",

"message": "Secret Deleted!"

}



10. **Read full Secret By Id**

GET:: /secrets/*:secret\_id*

Read or view complete secrets, and this view would be count.

Authentication required, will return a response Body

Response Body:

{

"\_id": "62dad2c42cd8f8858ee482ff",

"author": {

"username": "newuser\_1",

"avatar": "",

"\_id": "62da50c7907f0e450b12eaa8",

"gender": "Male"

},

"tag": "life",

"content": "love encompasses a range of strong and positive emotional and mental states, from the most sublime virtue or good habit, the deepest interpersonal affection, to the simplest pleasure.[1][2] An example of this range of meanings is that the love of a mother differs from the love of a spouse, which differs from the love for food. Most commonly, love refers to a feeling of a strong attraction and emotional attachment",

"timestamp": "2022-07-22T16:39:32.456Z",

"views\_count": 1,

"comments\_count": 0

}



11. **Get My Secrets.**

GET::  /secrets/my\_secrets

Returns most recent secrets and stories return by you, provide **skip** & **limit**  query** parameter to filter results

Query Parameters:

Filter by tag:

**?limit=20**

Offset/skip number of comments (default is **0**):

**?skip=0**

Authentication required.

Response Body:

{

"status": "Success",

"count": 2,

"secrets": [

{

"\_id": "62dad2c42cd8f8858ee482ff",

"author": {

"username": "newuser\_1",

"avatar": "",

"\_id": "62da50c7907f0e450b12eaa8",

"gender": "Male"

},

"tag": "Life",

"content": "this is my secret, that now i'm going to reaveal annoymounsly",

"timestamp": "2022-07-22T16:39:32.456Z",

"views\_count": 1,

"comments\_count": 2

},

{

"\_id": "62dad2a02cd8f8858ee482f9",

"author": {

"username": "newuser\_1",

"avatar": "",

"\_id": "62da50c7907f0e450b12eaa8",

"gender": "Male"

},

"tag": "Relationship",

"content": "this is my secret, that now i'm going to reaveal annoymounsly",

"timestamp": "2022-07-22T16:38:56.870Z",

"views\_count": 0,

"comments\_count": 0

}

]

}






12. **Get Comments by Secret By Id**

GET::  /comments/secrets/*:secret\_id*

Returns most recent comments  by default, provide **skip** & **limit**  query** parameter to filter results

Query Parameters:

Filter by tag:

**?limit=20**

Offset/skip number of comments (default is **0**):

**?skip=0**

Authentication required.

Response Body:

{

"status": "Success",

"total\_count": 2,

"skip": 0,

"limit": 20,

"present\_count": 2,

"comments": [

{

"\_id": "62daf5f6fd0c70d2eba56ef0",

"content": "this is comment 1 ",

"secret\_id": "62dad2c42cd8f8858ee482ff",

"commenter": {

"username": "newuser\_1",

"\_id": "62da50c7907f0e450b12eaa8",

"avatar": "",

"gender": "Male"

},

"timestamp": "2022-07-22T19:09:42.053Z",

"like\_count": 0,

"is\_liked\_by\_me": **false**,

"reply\_count": 0

},

{

"\_id": "62daf5ebfd0c70d2eba56ee9",

"content": "this is comment 0 ",

"secret\_id": "62dad2c42cd8f8858ee482ff",

"commenter": {

"username": "newuser\_1",

"\_id": "62da50c7907f0e450b12eaa8",

"avatar": "",

"gender": "Male"

},

"timestamp": "2022-07-22T19:09:31.267Z",

"like\_count": 0,

"is\_liked\_by\_me": **false**,

"reply\_count": 0

}

]

}



13. **Post Comment.**

POST:: /comments

Example request body:

{

"comment" : "this is comment 2 ",

"secret\_id" : "62dad2c42cd8f8858ee482ff"

}

Authentication required, will return a response Body

Required fields: content, tag

Response body:

{

"\_id": "62daf5fbfd0c70d2eba56ef7",

"content": "this is comment 2 ",

"secret\_id": "62dad2c42cd8f8858ee482ff",

"commenter": {

"username": "newuser\_1",

"\_id": "62da50c7907f0e450b12eaa8",

"avatar": "",

"gender": "Male"

},

"timestamp": "2022-07-22T19:09:47.723Z",

"like\_count": 0,

"is\_liked\_by\_me": **false**,

"reply\_count": 0

}



14. **Post Replies.**
### POST:: /comments/replies
Example request body:

{

  "parent\_reply\_id" : "",

  "parent\_comment\_id" : "62daf5f6fd0c70d2eba56ef0",

  "mention\_uid" : "",

  "secret\_id" : "62dad2c42cd8f8858ee482ff",

  "reply" : "this is reply "

}

Authentication required, will return a response Body

Required fields: reply, parent\_comment\_id, secret\_id

optional fields: parent\_reply\_id (\**in case if we are replying to a reply*), mention\_uid (\*mention *user\_id in case if u want to send Push notification*).

Response body:

{

"parent\_comment\_id": "62daf5f6fd0c70d2eba56ef0",

"parent\_reply\_id": "62daf5f6fd0c70d2eba56ef0",

"\_id": "62db10ba9949921400b2a8cb",

"content": "this is reply ",

"secret\_id": "62dad2c42cd8f8858ee482ff",

"commenter": {

"username": "newuser\_1",

"\_id": "62da50c7907f0e450b12eaa8",

"avatar": "",

"gender": "Male"

},

"timestamp": "2022-07-22T21:03:54.838Z",

"like\_count": 0,

"is\_liked\_by\_me": **false**

}



15. **Get Replies by comment\_id.**

GET::  /comments/replies/*:parent\_comment\_id*

Authentication required, Returns most recent replies  by default

Response body: 

{

"replies": [

{

"parent\_comment\_id": "62daf5f6fd0c70d2eba56ef0",

"parent\_reply\_id": "62daf5f6fd0c70d2eba56ef0",

"\_id": "62db034c35665cfb68877ea2",

"content": "this is reply 1",

"secret\_id": "62dad2c42cd8f8858ee482ff",

"commenter": {

"username": "newuser\_1",

"\_id": "62da50c7907f0e450b12eaa8",

"avatar": "",

"gender": "Male"

},

"timestamp": "2022-07-22T20:06:36.592Z",

"like\_count": 0,

"is\_liked\_by\_me": **false**

},

{

"parent\_comment\_id": "62daf5f6fd0c70d2eba56ef0",

"parent\_reply\_id": "62daf5f6fd0c70d2eba56ef0",

"\_id": "62db0477f704daf6b11ea458",

"content": "this is reply 2",

"secret\_id": "62dad2c42cd8f8858ee482ff",

"commenter": {

"username": "newuser\_1",

"\_id": "62da50c7907f0e450b12eaa8",

"avatar": "",

"gender": "Male"

},

"timestamp": "2022-07-22T20:11:35.751Z",

"like\_count": 0,

"is\_liked\_by\_me": **false**

},

{ "parent\_comment\_id": "62daf5f6fd0c70d2eba56ef0",

"parent\_reply\_id": "62daf5f6fd0c70d2eba56ef0",

"\_id": "62db0499f704daf6b11ea461",

"content": "this is reply 3",

"secret\_id": "62dad2c42cd8f8858ee482ff",

"commenter": {

"username": "newuser\_1",

"\_id": "62da50c7907f0e450b12eaa8",

"avatar": "",

"gender": "Male”},

"timestamp": "2022-07-22T20:12:09.057Z",

"like\_count": 0,

"is\_liked\_by\_me": **false**  }

      ]

}


16. **Like Comment or Reply.**
### PUT:: /comments/like/:compliment\_id

\*vai this endpoint you like both comments as well as replies.

Authentication required, It will return a response body of update reply or comment (whichever u just liked).

Response Body: 

{

"parent\_comment\_id": "62daf5f6fd0c70d2eba56ef0",

"parent\_reply\_id": "62daf5f6fd0c70d2eba56ef0",

"\_id": "62db0fdde1bb4758f52a6063",

"content": "this is reply ",

"secret\_id": "62dad2c42cd8f8858ee482ff",

"commenter": {

"username": "newuser\_1",

"\_id": "62da50c7907f0e450b12eaa8",

"avatar": "",

"gender": "Male"

},

"timestamp": "2022-07-22T21:00:13.933Z",

"like\_count": 1,

"is\_liked\_by\_me": **true**

}



17. **Dislike Comment or Reply.**
### DELETE:: /comments/dislike/:compliment\_id

\*vai this endpoint you dislike both comments as well as replies

Authentication required, It will return a response body of update reply or comment (whichever u just disliked).

Response Body: 

{

"parent\_comment\_id": "62daf5f6fd0c70d2eba56ef0",

"parent\_reply\_id": "62daf5f6fd0c70d2eba56ef0",

"\_id": "62db0fdde1bb4758f52a6063",

"content": "this is reply ",

"secret\_id": "62dad2c42cd8f8858ee482ff",

"commenter": {

"username": "newuser\_1",

"\_id": "62da50c7907f0e450b12eaa8",

"avatar": "",

"gender": "Male"

},

"timestamp": "2022-07-22T21:00:13.933Z",

"like\_count": 1,

"is\_liked\_by\_me": **false**

}



18. **Update Comment or Reply.**
### PUT:: /comments
Example Request Body: 

{

"content" : "updating compliment!!",

"\_id" : "62db0fdde1bb4758f52a6063"

}

Authentication required, it will return a updated response body

Required fields : content ( updated  content with changes you  want),\_id (id of comment or reply)

Response Body :

{

"parent\_comment\_id": "62daf5f6fd0c70d2eba56ef0",

"parent\_reply\_id": "62daf5f6fd0c70d2eba56ef0",

"\_id": "62db0fdde1bb4758f52a6063",

"content": "updating compliment!!",

"secret\_id": "62dad2c42cd8f8858ee482ff",

"commenter": {

"username": "newuser\_1",

"\_id": "62da50c7907f0e450b12eaa8",

"avatar": "",

"gender": "Male"

},

"timestamp": "2022-07-22T21:00:13.933Z",

"like\_count": 0,

"is\_liked\_by\_me": **false**

}



19. **Delete Comment by Id** 

DELETE:: /comments/*:comment\_id* 



With comment all its associated replies would also be deleted. 

Required Param : **commen**t**\_id** 

Authentication required, will return a response Body 

Response Body :  

{ 

"status": "Success", 

"message": "Comment Deleted!" 

}



20. **Get My Profile.**

GET::  /users

Authentication required, Returns a response body.

Response Body: 

{

"\_id": "62da50c7907f0e450b12eaa8",

"username": "newuser\_1",

"avatar": "",

"gender": "Male",

      "d\_token": "12344token"

}



21. **Get User Profile by id.**

GET::  /users/:user\_id

Authentication required, Returns a response body

Required param : user\_id

Response Body: 

{

"\_id": "62da50c7907f0e450b12eaa8",

"username": "newuser\_1",

"avatar": "",

"gender": "Male"

}



22. **Update Device token.**
### PUT:: /users/devicetoken?d\_token

Register Device token for push notification.

Authentication required, Returns a response body

Required field : d\_token

Response Body:

{

"status": "Success",

"msg": "Device token registered !!"

}


