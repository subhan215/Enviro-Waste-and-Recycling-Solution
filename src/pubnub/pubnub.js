import PubNub from 'pubnub';

const pubnub = new PubNub({
  publishKey: 'pub-c-fbe459ff-022a-484f-bc2f-8e1987e7e104',
  subscribeKey: 'sub-c-60983979-297c-4314-bb97-9652e536841d',
  uuid: "asifsubhan904@gmail.com" // Unique identifier for each user
});

export default pubnub;