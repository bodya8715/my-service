let { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

exports.handler = async (event) => {  
  let sqsClient = new SQSClient({region: 'us-east-1'});
  let random = Math.random() * (20 - 1) + 1;
  let params = {
    MessageAttributes: {
      Title: {
        DataType: "String",
        StringValue: "The Whistler"
      },
      Author: {
        DataType: "String",
          StringValue: "John Grisham"
        },
        WeeksOn: {
          DataType: "Number",
          StringValue: "6"
        }
      },
      MessageBody: event.message_body || "Empty_mesage",
      MessageDeduplicationId: random,
      MessageGroupId: random,
      QueueUrl: "https://sqs.us-east-1.amazonaws.com/159757278796/Test_dead_letter_queue.fifo"
    };
    try {
      const data = await sqsClient.send(new SendMessageCommand(params));
      return JSON.stringify({data: data.MessageId, event: event.message_body});
    } catch (err) {
      return JSON.stringify({err});
    }
};