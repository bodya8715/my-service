let { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');

exports.message = async (event) => {
  let sqs = "https://sqs.us-east-1.amazonaws.com/159757278796/Test_letter_queue.fifo";
  let dlq = "https://sqs.us-east-1.amazonaws.com/159757278796/Test_dead_letter_queue.fifo";
   
  let sqsClient = new SQSClient({region: 'us-east-1'});
  
  let random = Math.floor(Math.random() * (20 - 1)) + 1;
  
  const receiveParams = {
    AttributeNames: ["SentTimestamp"],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: ["All"],
    QueueUrl: dlq,
    VisibilityTimeout: 30,
    WaitTimeSeconds: 0
  };
  
  try {
    const receiveData = await sqsClient.send(new ReceiveMessageCommand(receiveParams));
    //MessageId
    //MD5OfBody
    //Body
    //Attributes
    //MD5OfMessageAttributes
    //MessageAttributes
    if (receiveData.Messages[0]) {
        let message = receiveData.Messages[0].Body;
        
        const deleteParams = {
          QueueUrl: dlq,
          ReceiptHandle: receiveData.Messages[0].ReceiptHandle,
        };
         
        const deleteMessage = await sqsClient.send(new DeleteMessageCommand(deleteParams));
        
        let sendParams = {
          MessageAttributes: {
            Title: {
              DataType: "String",
              StringValue: "The Whistler",
            },
            Author: {
              DataType: "String",
              StringValue: "John Grisham",
            },
            WeeksOn: {
              DataType: "Number",
              StringValue: "6",
            }
          },
          MessageBody: message || "Empty_mesage",
          MessageDeduplicationId: random,
          MessageGroupId: random,
          QueueUrl: sqs,
        };
        
        const sendData = await sqsClient.send(new SendMessageCommand(sendParams));
         
        return JSON.stringify({statusCode: 200, body: message});
      
     } else {
      return JSON.stringify({statusCode: 400, body:"No messages has been found"});
     }
   } catch (err) {
    return JSON.stringify({err});
   }
};