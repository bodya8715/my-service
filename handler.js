let { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');

module.exports.error = async (event) => {
  if(Math.random() > 0.5) {
    return {statusCode: 200, body: "Hello"};
  } else {
    throw new Error('Error');
  }
};

module.exports.retry = async (event) => {
  let sqs = "https://sqs.us-east-1.amazonaws.com/159757278796/Test.fifo";
  let dlq = "https://sqs.us-east-1.amazonaws.com/159757278796/TestDead.fifo";
     
  let sqsClient = new SQSClient({region: 'us-east-1'});

  const receiveParams = {
    AttributeNames: ["SentTimestamp"],
    MaxNumberOfMessages: 10,
    MessageAttributeNames: ["All"],
    QueueUrl: dlq,
    VisibilityTimeout: 30,
    WaitTimeSeconds: 0
  };

  try {
    const receiveData = await sqsClient.send(new ReceiveMessageCommand(receiveParams));
    if(receiveData.Messages) {
      for(let i = 0; i < receiveData.Messages.length; i++) {
        let random = Math.floor(Math.random() * (20 - 1)) + 1;
        let message = receiveData.Messages[i].Body;

        const deleteParams = {
          QueueUrl: dlq,
          ReceiptHandle: receiveData.Messages[i].ReceiptHandle,
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
      }
      return JSON.stringify({statusCode: 200, body: "Success"});
    } else {
      return JSON.stringify({statusCode: 400, body:"No messages has been found"});
    }
  } catch (err) {
    return JSON.stringify({err});
  }
};