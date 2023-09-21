const Message = require("../schema/message.schema");
const saveMessage=async(senderId,receiverId,message)=>{
 try {
       const content = await Message({
           receiverId,
           senderId,
           message,
     })
     
   
     const savedMessage = await content.save();
   
     if(savedMessage){
       return{
           status:"SUCCESS",
           data:savedMessage
       }
     }else{
       return{
           status:"FAILED",
       }
     }
   
     
 } catch (error) {
    return{
        status: "SORRY! Something went wrong",
        error: error.message,
    }
 }

}

const fetchMessages = async (senderId, receiverId) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
    .sort({ timestamp: 1 })
    .populate('senderId', 'firstName lastName' ) 
    .populate('receiverId', 'firstName lastName'); 
    
    if (messages.length > 0) {
      return {
        status: "SUCCESS",
        data: messages,
      };
    } else {
      return {
        status: "FAILED",
      };
    }
  } catch (error) {
    return {
      status: "ERROR",
      error: error.message,
    };
  }
};

module.exports = {saveMessage,fetchMessages}