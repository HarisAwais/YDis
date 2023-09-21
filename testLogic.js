endpoint de dete hain jese agr os ne test pass kiya hai os ka endpoint bna k rakh dain gay jb user ay ga os end point pr hit kr k wo apna certificat get kr ly ga
off and on session
metadata
{
  users:[],
  messages:[{
    senderId:String,
    receiverId:String,
    message:String
  }]
}

if (status === "ACTIVE") {
  let subscriptionFound;

  if (!classStartTime || !classEndTime) {
    subscriptionFound = await SubscriptionModel.getSubscriptionById(
      subscriptionId
    );

    if (subscriptionFound.status === "SUCCESS") {
      const course = subscriptionFound?.data?._courseId;
      const teacherId = course.teacherId;

      if (String(course.teacherId) !== String(user._id)) {
        return res.status(403).json({ message: "Access denied" });
      }

      classStartTime = subscriptionFound?.data?.classStartTime;
      classEndTime = subscriptionFound?.data?.classEndTime;
    } else {
      return res
        .status(404)
        .send({ message: "FAILED", error: subscriptionFound.error });
    }
  }

  }

  const durationResult = await SubscriptionModel.calculateCourseDuration(
    subscriptionFound.data?._courseId
  );

  if (durationResult.status === "SUCCESS") {
    const dateNow = zeroSetter(Date.now(), "time");
    const endDate = moment(dateNow).add(
      durationResult.data,
      "milliseconds"
    );
    update.startDate = dateNow;
    update.endDate = endDate.toDate();
  } else {
    return res.status(500).json({
      message: "Failed to calculate course duration.",
    });
  }
}


//===> Attendance Tracking: If applicable, implement attendance tracking for live classes or in-person sessions. This can help verify teacher attendance and ensure students are receiving the education they expect.

// ===>  Security and Privacy: Ensure that sensitive teacher data, such as personal information, certifications, and contact details, is securely stored and accessed only by authorized personnel. Comply with data protection regulations, such as GDPR, when handling teacher data.

//===>Notification and Alerts: Set up notifications and alerts for specific teacher-related events. For example, notify administrators when a teacher's course receives poor ratings or when there are irregularities in teacher activity.

//Feedback and Support: Create a mechanism for teachers to provide feedback, report issues, or request support. An open channel of communication helps in addressing teacher concerns promptly.

// Documentation: Maintain comprehensive documentation for each teacher, including contracts, agreements, and any legal or regulatory compliance documentation.




const uploadSubmissionFile = require("./api/middleware/uploadProfile.middleware");
const { populate } = require("./api/schema/assignment.schema");
const { messages } = require("./api/validators/user.validator");

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
    // Handle webhook events
app.post('/webhook', async (req, res) => {
  const event = req.body;

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Mark the subscription as approved by the teacher
        const paymentIntent = event.data.object;
        const subscriptionId = paymentIntent.metadata.subscriptionId;
        await SubscriptionModel.approveSubscription(subscriptionId);
        break;
      case 'payment_intent.payment_failed':
        // Mark the subscription as not approved
        const failedPaymentIntent = event.data.object;
        const failedSubscriptionId = failedPaymentIntent.metadata.subscriptionId;
        await SubscriptionModel.markSubscriptionAsNotApproved(failedSubscriptionId);
        break;
      case 'subscription.updated':
        // Handle subscription status update (e.g., teacher approval)
        // You may need to update the subscription status in your database
        break;
      case 'subscription.deleted':
        // Subscription was canceled, refund if necessary
        const deletedSubscription = event.data.object;
        const deletedSubscriptionId = deletedSubscription.id;
        const subscriptionStatus = await SubscriptionModel.getSubscriptionStatus(deletedSubscriptionId);

        if (subscriptionStatus !== "TRANSFERRED") {
          // Refund the payment to the student's account
          await refundPayment(deletedSubscription.latest_invoice.payment_intent.client_secret);
        }
        break;
      default:
        // Handle other webhook events if needed
    }

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error handling webhook');
  }
});
