const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseApp = null;

const initializeFirebase = () => {
  try {
    // Check if credentials are provided
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      console.log('🔥 Firebase Admin initialized successfully');
    } else {
      console.log('⚠️  Firebase credentials not found. Push notifications disabled.');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
  }
};

// Send push notification to a single device
const sendPushNotification = async (fcmToken, notification) => {
  if (!firebaseApp) {
    console.log('Firebase not initialized. Skipping push notification.');
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'taskmaster_notifications',
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: notification.badge || 0,
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Push notification sent:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: error.message };
  }
};

// Send push notification to multiple devices
const sendPushNotificationToMultiple = async (fcmTokens, notification) => {
  if (!firebaseApp) {
    console.log('Firebase not initialized. Skipping push notifications.');
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      tokens: fcmTokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'taskmaster_notifications',
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: notification.badge || 0,
          }
        }
      }
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`Push notifications sent: ${response.successCount} success, ${response.failureCount} failed`);
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return { success: false, error: error.message };
  }
};

// Send notification to a topic
const sendPushNotificationToTopic = async (topic, notification) => {
  if (!firebaseApp) {
    console.log('Firebase not initialized. Skipping push notification.');
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    const message = {
      topic: topic,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'taskmaster_notifications',
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: notification.badge || 0,
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Topic notification sent:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending topic notification:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe device to a topic
const subscribeToTopic = async (fcmTokens, topic) => {
  if (!firebaseApp) {
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    const tokens = Array.isArray(fcmTokens) ? fcmTokens : [fcmTokens];
    const response = await admin.messaging().subscribeToTopic(tokens, topic);
    console.log('Subscribed to topic:', topic, response);
    return { success: true, successCount: response.successCount };
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    return { success: false, error: error.message };
  }
};

// Unsubscribe device from a topic
const unsubscribeFromTopic = async (fcmTokens, topic) => {
  if (!firebaseApp) {
    return { success: false, error: 'Firebase not initialized' };
  }

  try {
    const tokens = Array.isArray(fcmTokens) ? fcmTokens : [fcmTokens];
    const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
    console.log('Unsubscribed from topic:', topic, response);
    return { success: true, successCount: response.successCount };
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    return { success: false, error: error.message };
  }
};

// Notification templates
const notificationTemplates = {
  newBid: (taskTitle, bidderName, bidAmount) => ({
    title: 'New Bid Received!',
    body: `${bidderName} bid ${bidAmount.toLocaleString()} VND on "${taskTitle}"`,
    data: {
      type: 'bid',
      action: 'view_bids'
    }
  }),

  bidAccepted: (taskTitle) => ({
    title: 'Bid Accepted!',
    body: `Your bid on "${taskTitle}" was accepted. Start working!`,
    data: {
      type: 'bid_accepted',
      action: 'view_task'
    }
  }),

  taskCompleted: (taskTitle) => ({
    title: 'Task Completed',
    body: `"${taskTitle}" has been marked as completed. Please review.`,
    data: {
      type: 'task_completed',
      action: 'review_task'
    }
  }),

  newMessage: (senderName) => ({
    title: 'New Message',
    body: `${senderName} sent you a message`,
    data: {
      type: 'message',
      action: 'open_chat'
    }
  }),

  newReview: (reviewerName, rating) => ({
    title: 'New Review',
    body: `${reviewerName} left you a ${rating}-star review`,
    data: {
      type: 'review',
      action: 'view_reviews'
    }
  }),

  disputeFiled: (taskTitle) => ({
    title: 'Dispute Filed',
    body: `A dispute was filed for "${taskTitle}"`,
    data: {
      type: 'dispute',
      action: 'view_dispute'
    }
  }),

  paymentReceived: (amount) => ({
    title: 'Payment Received',
    body: `You received ${amount.toLocaleString()} VND`,
    data: {
      type: 'payment',
      action: 'view_wallet'
    }
  })
};

module.exports = {
  initializeFirebase,
  sendPushNotification,
  sendPushNotificationToMultiple,
  sendPushNotificationToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
  notificationTemplates
};
