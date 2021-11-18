import { ajax } from 'discourse/lib/ajax';

let dockedScreenTrack = function(context, topic) {
  if (!topic) { return; }

  const highest = topic.highest_post_number;
  const lastRead = Math.min(highest, topic.last_read_post_number);

  context.topicTrackingState.updateSeen(topic.id, highest);

  let newTimings = {};
  if (lastRead === highest) {
    newTimings[highest] = 3000;
  } else {
    for (let p = lastRead + 1; p <= highest; p++) {
      newTimings[p] = 3000;
    }
  }

  ajax('/topics/timings', {
    data: {
      timings: newTimings,
      topic_time: 3000,
      topic_id: topic.id
    },
    cache: false,
    type: 'POST',
    headers: {
      'X-SILENCE-LOGGER': 'true'
    }
  });
};

export { dockedScreenTrack };
