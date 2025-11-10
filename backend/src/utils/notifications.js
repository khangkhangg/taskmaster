const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 */
const createNotification = async ({
  user,
  type,
  title,
  message,
  data = {},
  actionUrl = null
}) => {
  try {
    const notification = new Notification({
      user,
      type,
      title,
      message,
      data,
      actionUrl
    });

    await notification.save();

    // If socket.io is available, emit real-time notification
    // This will be handled by the socket.io server
    if (global.io) {
      global.io.to(user.toString()).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Create notification for new bid
 */
const notifyNewBid = async (task, bid, bidder) => {
  return createNotification({
    user: task.poster,
    type: 'new_bid',
    title: 'New Bid Received',
    message: `${bidder.name} placed a bid of ${bid.amount.toLocaleString()} ${bid.currency} on your task "${task.title}"`,
    data: {
      taskId: task._id,
      bidId: bid._id,
      userId: bidder._id
    },
    actionUrl: `/tasks/${task._id}/bids`
  });
};

/**
 * Create notification for bid acceptance
 */
const notifyBidAccepted = async (task, bid, poster) => {
  return createNotification({
    user: bid.bidder,
    type: 'bid_accepted',
    title: 'Bid Accepted!',
    message: `Congratulations! Your bid on "${task.title}" has been accepted by ${poster.name}`,
    data: {
      taskId: task._id,
      bidId: bid._id,
      userId: poster._id
    },
    actionUrl: `/tasks/${task._id}`
  });
};

/**
 * Create notification for bid rejection
 */
const notifyBidRejected = async (task, bid) => {
  return createNotification({
    user: bid.bidder,
    type: 'bid_rejected',
    title: 'Bid Not Selected',
    message: `Your bid on "${task.title}" was not selected. Keep trying!`,
    data: {
      taskId: task._id,
      bidId: bid._id
    },
    actionUrl: `/my-bids`
  });
};

/**
 * Create notification for task assignment
 */
const notifyTaskAssigned = async (task, doer, poster) => {
  return createNotification({
    user: doer._id,
    type: 'task_assigned',
    title: 'Task Assigned',
    message: `You've been assigned to "${task.title}" by ${poster.name}. Time to get started!`,
    data: {
      taskId: task._id,
      userId: poster._id
    },
    actionUrl: `/tasks/${task._id}`
  });
};

/**
 * Create notification for task completion
 */
const notifyTaskCompleted = async (task, doer, poster) => {
  return createNotification({
    user: doer._id,
    type: 'task_completed',
    title: 'Task Completed',
    message: `${poster.name} marked "${task.title}" as completed. Thank you for your work!`,
    data: {
      taskId: task._id,
      userId: poster._id
    },
    actionUrl: `/tasks/${task._id}`
  });
};

/**
 * Create notification for new review
 */
const notifyNewReview = async (review, reviewer) => {
  return createNotification({
    user: review.reviewee,
    type: 'new_review',
    title: 'New Review Received',
    message: `${reviewer.name} left you a ${review.rating}-star review`,
    data: {
      reviewId: review._id,
      taskId: review.task,
      userId: reviewer._id
    },
    actionUrl: `/profile/reviews`
  });
};

/**
 * Create notification for task deadline
 */
const notifyTaskDeadline = async (task, user, hoursRemaining) => {
  return createNotification({
    user: user._id,
    type: 'task_deadline',
    title: 'Task Deadline Approaching',
    message: `"${task.title}" is due in ${hoursRemaining} hours!`,
    data: {
      taskId: task._id
    },
    actionUrl: `/tasks/${task._id}`
  });
};

/**
 * Create notification for dispute update
 */
const notifyDisputeUpdate = async (dispute, user, message) => {
  return createNotification({
    user: user._id,
    type: 'dispute_update',
    title: 'Dispute Update',
    message,
    data: {
      disputeId: dispute._id,
      taskId: dispute.task
    },
    actionUrl: `/disputes/${dispute._id}`
  });
};

module.exports = {
  createNotification,
  notifyNewBid,
  notifyBidAccepted,
  notifyBidRejected,
  notifyTaskAssigned,
  notifyTaskCompleted,
  notifyNewReview,
  notifyTaskDeadline,
  notifyDisputeUpdate
};
