
//===> Attendance Tracking: If applicable, implement attendance tracking for live classes or in-person sessions. This can help verify teacher attendance and ensure students are receiving the education they expect.

// ===>  Security and Privacy: Ensure that sensitive teacher data, such as personal information, certifications, and contact details, is securely stored and accessed only by authorized personnel. Comply with data protection regulations, such as GDPR, when handling teacher data.

//===>Notification and Alerts: Set up notifications and alerts for specific teacher-related events. For example, notify administrators when a teacher's course receives poor ratings or when there are irregularities in teacher activity.

//Feedback and Support: Create a mechanism for teachers to provide feedback, report issues, or request support. An open channel of communication helps in addressing teacher concerns promptly.

// Documentation: Maintain comprehensive documentation for each teacher, including contracts, agreements, and any legal or regulatory compliance documentation.




const uploadSubmissionFile = require("./api/middleware/uploadProfile.middleware");
const { populate } = require("./api/schema/assignment.schema");

const doc = {
    startTime: new Date("2023-08-17T08:30:29.503Z"),
    endTime: new Date("2023-08-17T09:30:29.503Z"),
  };
  
  const testCases = [
    {
      // case is valid before slot
      startTime: new Date("2023-08-17T07:30:29.503Z"),
      endTime: new Date("2023-08-17T08:30:29.503Z"),
    },
    {
      // case is valid after slot
      startTime: new Date("2023-08-17T09:30:29.503Z"),
      endTime: new Date("2023-08-17T10:30:29.503Z"),
    },
    {
      // end time overlap
      startTime: new Date("2023-08-17T08:00:29.503Z"),
      endTime: new Date("2023-08-17T09:00:29.503Z"),
    },
    {
      // start time overlap
      startTime: new Date("2023-08-17T09:00:29.503Z"),
      endTime: new Date("2023-08-17T10:00:29.503Z"),
    },
    {
      // whole time overlap (inside the range)
      startTime: new Date("2023-08-17T08:45:29.503Z"),
      endTime: new Date("2023-08-17T09:15:29.503Z"),
    },
    {
      // whole time overlap (outside the range)
      startTime: new Date("2023-08-17T08:00:29.503Z"),
      endTime: new Date("2023-08-17T10:00:29.503Z"),
    },
  ];
  
  // My Logic Expected Output --------------> [ false, false, true, true, true, true ]
  const resultsOfMyLogic = testCases.map((testCase) => {
    const overlap =
      testCase.startTime < doc.startTime||doc.endTime && testCase.endTime >doc.startTime|| doc.startTime;
    return overlap;
  });
  
  console.log("resultsOfMyLogic: ", resultsOfMyLogic);


  
  //also add this teacher how many student have taught
  

  // sir abi tk aggregation use krne ka moka ni mila sir scenerios nhe abi tk ese ay
  // or dosra sir quiz bnanaya mein ne abi tk to mein ose alg table main rakha howa

  //req.starttime<

  // profiles upload
  // maybe validations
  // subscription
  // populate
  // history maintain
  // quiz
  // certificate

  // sir in the end there will be a quiz if pass then at the end we will assign the certificate to the user 
  // and in certificate the name of the student and course name will be 

  // in schema i am confused little bit
  // mein n aik teacher model bnaya howa hai aik course os main ne course main teacher ki id rkhwae hoi hai ab next mein ne aik subscription ka bnaya howa hai table os main pre hai course ki id ab suppose mein paper generate teacher se ab is ko mein alg table main rkhna the question is jb mein paper create kron ga to muje teacher ki id bnani pre gi or os course ki? 


// const nearestTeachers = await User.aggregate([
    //   {
    //     $geoNear: {
    //       near: {
    //         type: "Point",
    //         coordinates: [parseFloat(longitude), parseFloat(latitude)],
    //       },
    //       distanceField: "distance",
    //       spherical: true,
    //       maxDistance: 10000, // Maximum distance in meters (adjust as needed)
    //     },
    //   },
    //   {
    //     $match: {
    //       role: "TEACHER",
    //       isVerified: true,
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 1,
    //       firstName: 1,
    //       secondName: 1,
    //       distance: 1,
    //     },
    //   },
    // ]);
    